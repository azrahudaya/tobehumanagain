import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";
import dotenv from "dotenv";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(currentDir, "..");

dotenv.config({ path: path.resolve(backendRoot, ".env") });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl || !databaseUrl.startsWith("file:")) {
  throw new Error("DATABASE_URL must use sqlite file: format for setup-db.ts");
}

const dbRelativePath = databaseUrl.replace(/^file:/, "");
const dbPath = path.resolve(backendRoot, dbRelativePath);
const initSqlPath = path.resolve(backendRoot, "prisma", "init.sql");

if (!fs.existsSync(initSqlPath)) {
  throw new Error(`init.sql not found at ${initSqlPath}`);
}

if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
}

const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const sql = fs.readFileSync(initSqlPath, "utf-8");
const db = new Database(dbPath);

db.pragma("foreign_keys = ON");
db.exec(sql);
db.close();

console.log(`Database initialized at ${dbPath}`);
