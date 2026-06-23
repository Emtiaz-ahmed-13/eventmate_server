import "dotenv/config";
import { Prisma, PrismaClient } from "../generated/prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function safeDeleteMany(action: () => Promise<unknown>) {
  try {
    await action();
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2021"
    ) {
      return;
    }
    throw error;
  }
}

async function removeDuplicateEvents() {
  const events = await prisma.event.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true },
  });

  const seen = new Set<string>();
  const duplicateIds: string[] = [];

  for (const event of events) {
    const key = event.name.trim().toLowerCase();
    if (seen.has(key)) {
      duplicateIds.push(event.id);
    } else {
      seen.add(key);
    }
  }

  if (duplicateIds.length === 0) {
    return;
  }

  await safeDeleteMany(() =>
    prisma.chatMessage.deleteMany({ where: { eventId: { in: duplicateIds } } })
  );
  await safeDeleteMany(() =>
    prisma.discussion.deleteMany({ where: { eventId: { in: duplicateIds } } })
  );
  await safeDeleteMany(() =>
    prisma.waitlist.deleteMany({ where: { eventId: { in: duplicateIds } } })
  );
  await safeDeleteMany(() =>
    prisma.savedEvent.deleteMany({ where: { eventId: { in: duplicateIds } } })
  );
  await safeDeleteMany(() =>
    prisma.participant.deleteMany({ where: { eventId: { in: duplicateIds } } })
  );
  await safeDeleteMany(() =>
    prisma.review.deleteMany({ where: { eventId: { in: duplicateIds } } })
  );
  await prisma.event.deleteMany({ where: { id: { in: duplicateIds } } });

  console.log(`Removed ${duplicateIds.length} duplicate event(s).`);
}

async function removeUserByName(name: string) {
  const users = await prisma.user.findMany({
    where: { name: { equals: name, mode: "insensitive" } },
  });

  if (users.length === 0) {
    console.log(`No user found with name "${name}".`);
    return;
  }

  for (const user of users) {
    const hostedEvents = await prisma.event.findMany({
      where: { hostId: user.id },
      select: { id: true },
    });
    const eventIds = hostedEvents.map((event) => event.id);

    if (eventIds.length > 0) {
      await safeDeleteMany(() =>
        prisma.chatMessage.deleteMany({ where: { eventId: { in: eventIds } } })
      );
      await safeDeleteMany(() =>
        prisma.discussion.deleteMany({ where: { eventId: { in: eventIds } } })
      );
      await prisma.participant.deleteMany({ where: { eventId: { in: eventIds } } });
      await prisma.waitlist.deleteMany({ where: { eventId: { in: eventIds } } });
      await prisma.savedEvent.deleteMany({ where: { eventId: { in: eventIds } } });
      await prisma.review.deleteMany({ where: { eventId: { in: eventIds } } });
      await prisma.event.deleteMany({ where: { id: { in: eventIds } } });
    }

    await safeDeleteMany(() =>
      prisma.chatMessage.deleteMany({ where: { userId: user.id } })
    );
    await safeDeleteMany(() =>
      prisma.discussion.deleteMany({ where: { userId: user.id } })
    );
    await prisma.review.deleteMany({
      where: { OR: [{ reviewerId: user.id }, { hostId: user.id }] },
    });
    await safeDeleteMany(() =>
      prisma.follower.deleteMany({
        where: { OR: [{ followerId: user.id }, { hostId: user.id }] },
      })
    );
    await prisma.notification.deleteMany({ where: { userId: user.id } });
    await prisma.participant.deleteMany({ where: { userId: user.id } });
    await prisma.waitlist.deleteMany({ where: { userId: user.id } });
    await prisma.savedEvent.deleteMany({ where: { userId: user.id } });
    await prisma.profile.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });

    console.log(`Removed user: ${user.name} (${user.email})`);
  }
}

async function main() {
  const email = "admin@eventmate.com";
  const existing = await prisma.user.findUnique({ where: { email } });

  let adminUser = existing;
  if (!existing) {
    const hashedPassword = await bcrypt.hash("Admin@1234", 12);
    adminUser = await prisma.user.create({
      data: {
        name: "EventMate Admin",
        email,
        password: hashedPassword,
        role: "ADMIN",
        isVerified: true,
      },
    });
    console.log("Admin created successfully!");
  } else {
    console.log("Admin already exists, skipping user creation.");
  }

  const adminId = adminUser!.id;

  console.log("Admin credentials:");
  console.log("  Email   :", adminUser!.email);
  console.log("  Password: Admin@1234");
  console.log("  Role    :", adminUser!.role);

  await removeUserByName("Nafisa");
  await removeDuplicateEvents();

  const events = [
    {
      name: "Tech Summit 2026",
      type: "In-person",
      dateTime: new Date("2026-06-15T10:00:00Z"),
      location: "Gulshan, Dhaka",
      minParticipants: 5,
      maxParticipants: 100,
      description: "A grand tech conference for innovators.",
      joiningFee: 10,
      category: "Technology",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop",
      hostId: adminId,
    },
    {
      name: "Midnight Acoustic Night",
      type: "In-person",
      dateTime: new Date("2026-05-15T20:00:00Z"),
      location: "Dhanmondi Lake, Dhaka",
      minParticipants: 2,
      maxParticipants: 50,
      description: "Enjoy a relaxing night with live acoustic music.",
      joiningFee: 200,
      category: "Music & Concert",
      image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=1200&auto=format&fit=crop",
      hostId: adminId,
    },
  ];

  for (const eventData of events) {
    const existingEvent = await prisma.event.findFirst({
      where: { name: eventData.name },
    });

    if (existingEvent) {
      console.log(`Event "${eventData.name}" already exists, skipping.`);
      continue;
    }

    await prisma.event.create({ data: eventData });
    console.log(`Event "${eventData.name}" created.`);
  }

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
