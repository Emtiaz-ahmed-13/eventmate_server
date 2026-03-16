import { PrismaClient } from "../../../generated/prisma/client";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma =
  global.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export default prisma;