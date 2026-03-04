import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(currentDir, "../..");
const databaseUrl = process.env.DATABASE_URL;

if (databaseUrl?.startsWith("file:./")) {
  process.env.DATABASE_URL = `file:${path.resolve(backendRoot, databaseUrl.replace("file:./", ""))}`;
}

export const prisma = new PrismaClient();
