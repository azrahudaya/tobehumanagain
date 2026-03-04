import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const toBool = (value: unknown) => value === true || value === "true";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().default("file:./prisma/dev.db"),
  CLIENT_ORIGIN: z.string().default("http://localhost:5173"),
  JWT_ACCESS_SECRET: z.string().min(16).default("dev_access_secret_change_this_now"),
  JWT_REFRESH_SECRET: z.string().min(16).default("dev_refresh_secret_change_this_now"),
  ACCESS_TOKEN_TTL_MINUTES: z.coerce.number().default(15),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().default(7),
  OTP_TTL_MINUTES: z.coerce.number().default(10),
  OTP_RESEND_COOLDOWN_SECONDS: z.coerce.number().default(60),
  OTP_MAX_REQUESTS_WINDOW: z.coerce.number().default(5),
  OTP_WINDOW_MINUTES: z.coerce.number().default(10),
  OTP_MAX_ATTEMPTS: z.coerce.number().default(5),
  SMTP_HOST: z.string().default("smtp.gmail.com"),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_SECURE: z.preprocess(toBool, z.boolean()).default(false),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().default("To Be Human Again <no-reply@tobehumanagain.local>"),
});

export const env = envSchema.parse(process.env);
