import { PrismaClient } from "../generated/prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@eventmate.com";
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    console.log("Admin already exists:", existing.email);
    return;
  }

  const hashedPassword = await bcrypt.hash("Admin@1234", 12);

  const admin = await prisma.user.create({
    data: {
      name: "EventMate Admin",
      email,
      password: hashedPassword,
      role: "ADMIN",
      isVerified: true,
    },
  });

  console.log("Admin created successfully:");
  console.log("  Email   :", admin.email);
  console.log("  Password: Admin@1234");
  console.log("  Role    :", admin.role);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
