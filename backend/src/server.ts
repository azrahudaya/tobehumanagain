import { app } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";

const ensureCompatSchema = async () => {
  if (!env.DATABASE_URL.startsWith("file:")) {
    return;
  }

  const columns = await prisma.$queryRawUnsafe<Array<{ name: string }>>('PRAGMA table_info("User")');
  const hasAvatarColumn = columns.some((column) => column.name === "avatarUrl");

  if (!hasAvatarColumn) {
    await prisma.$executeRawUnsafe('ALTER TABLE "User" ADD COLUMN "avatarUrl" TEXT');
  }
};

await ensureCompatSchema();

app.listen(env.PORT, () => {
  console.log(`Backend API running on http://localhost:${env.PORT}`);
});
