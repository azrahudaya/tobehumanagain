import bcrypt from "bcryptjs";
import { OtpPurpose, type Role } from "@prisma/client";
import rateLimit from "express-rate-limit";
import { Router, type Response } from "express";
import { z } from "zod";
import { env } from "../../config/env.js";
import { sha256 } from "../../lib/crypto.js";
import { HttpError } from "../../lib/http-error.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../lib/jwt.js";
import { sendOtpEmail } from "../../lib/mailer.js";
import { compareOtpCode, generateOtpCode, hashOtpCode } from "../../lib/otp.js";
import { prisma } from "../../lib/prisma.js";
import { requireAuth } from "../../middleware/auth.js";

const router = Router();

const signupOtpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 35,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many OTP requests. Please try again shortly." },
});

const otpVerifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many verification attempts. Please wait and retry." },
});

const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts. Please try again in a few minutes." },
});

const signupStartSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(24)
    .regex(/^[a-zA-Z0-9_.-]+$/),
  email: z.string().email(),
  password: z.string().min(8).max(64),
});

const signupVerifySchema = z.object({
  email: z.string().email(),
  code: z.string().regex(/^\d{6}$/),
});

const loginSchema = z.object({
  identifier: z.string().min(3).max(80),
  password: z.string().min(8).max(64),
});

const normalizeEmail = (email: string) => email.trim().toLowerCase();
const normalizeUsername = (username: string) => username.trim().toLowerCase();

const setRefreshCookie = (res: Response, refreshToken: string, expiresAt: Date) => {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth",
    expires: expiresAt,
  });
};

const createOtpChallenge = async ({
  email,
  payload,
}: {
  email: string;
  payload: Record<string, unknown>;
}) => {
  const now = Date.now();
  const cooldownAt = now - env.OTP_RESEND_COOLDOWN_SECONDS * 1000;
  const windowStart = new Date(now - env.OTP_WINDOW_MINUTES * 60 * 1000);

  const latest = await prisma.otpChallenge.findFirst({
    where: { email, purpose: OtpPurpose.SIGNUP },
    orderBy: { createdAt: "desc" },
  });

  if (latest && latest.createdAt.getTime() > cooldownAt) {
    throw new HttpError(429, `Please wait ${env.OTP_RESEND_COOLDOWN_SECONDS} seconds before requesting a new OTP.`);
  }

  const requestCount = await prisma.otpChallenge.count({
    where: {
      email,
      purpose: OtpPurpose.SIGNUP,
      createdAt: {
        gte: windowStart,
      },
    },
  });

  if (requestCount >= env.OTP_MAX_REQUESTS_WINDOW) {
    throw new HttpError(429, "OTP request limit reached. Try again in a few minutes.");
  }

  const code = generateOtpCode();
  const codeHash = await hashOtpCode(code);

  await prisma.otpChallenge.create({
    data: {
      email,
      purpose: OtpPurpose.SIGNUP,
      codeHash,
      payload: JSON.stringify(payload),
      expiresAt: new Date(now + env.OTP_TTL_MINUTES * 60 * 1000),
    },
  });

  return code;
};

const verifySignupOtpChallenge = async ({
  email,
  code,
}: {
  email: string;
  code: string;
}) => {
  const challenge = await prisma.otpChallenge.findFirst({
    where: {
      email,
      purpose: OtpPurpose.SIGNUP,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!challenge) {
    throw new HttpError(400, "OTP not found or expired. Request a new code.");
  }

  if (challenge.attemptCount >= env.OTP_MAX_ATTEMPTS) {
    throw new HttpError(429, "Too many incorrect OTP attempts. Request a new code.");
  }

  const isMatch = await compareOtpCode(code, challenge.codeHash);

  if (!isMatch) {
    await prisma.otpChallenge.update({
      where: { id: challenge.id },
      data: { attemptCount: { increment: 1 } },
    });

    throw new HttpError(401, "Invalid OTP code.");
  }

  return challenge;
};

const issueSession = async ({
  user,
  res,
}: {
  user: { id: string; username: string; email: string; role: Role; displayName: string };
  res: Response;
}) => {
  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });

  const refreshExpiresAt = new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

  const refreshRecord = await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: "pending",
      expiresAt: refreshExpiresAt,
    },
  });

  const refreshToken = signRefreshToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    jti: refreshRecord.id,
  });

  await prisma.refreshToken.update({
    where: { id: refreshRecord.id },
    data: {
      tokenHash: sha256(refreshToken),
    },
  });

  setRefreshCookie(res, refreshToken, refreshExpiresAt);

  return {
    accessToken,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
    },
  };
};

const findUserByIdentifier = async (identifier: string) => {
  const trimmed = identifier.trim();

  if (trimmed.includes("@")) {
    return prisma.user.findUnique({ where: { email: normalizeEmail(trimmed) } });
  }

  return prisma.user.findUnique({ where: { username: normalizeUsername(trimmed) } });
};

router.post("/signup/start", signupOtpLimiter, async (req, res, next) => {
  try {
    const { username, email, password } = signupStartSchema.parse(req.body);
    const normalizedEmail = normalizeEmail(email);
    const normalizedUsername = normalizeUsername(username);

    const [existingByEmail, existingByUsername] = await Promise.all([
      prisma.user.findUnique({ where: { email: normalizedEmail } }),
      prisma.user.findUnique({ where: { username: normalizedUsername } }),
    ]);

    if (existingByEmail) {
      throw new HttpError(409, "Email already registered.");
    }

    if (existingByUsername) {
      throw new HttpError(409, "Username already used.");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const code = await createOtpChallenge({
      email: normalizedEmail,
      payload: {
        username: normalizedUsername,
        displayName: normalizedUsername,
        passwordHash,
      },
    });

    await sendOtpEmail({ email: normalizedEmail, code, purpose: "signup" });

    return res.json({
      message: "OTP sent to email.",
      debugOtp: env.NODE_ENV !== "production" && !env.SMTP_USER ? code : undefined,
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/signup/verify", otpVerifyLimiter, async (req, res, next) => {
  try {
    const { email, code } = signupVerifySchema.parse(req.body);
    const normalizedEmail = normalizeEmail(email);

    const challenge = await verifySignupOtpChallenge({
      email: normalizedEmail,
      code,
    });

    const payloadSchema = z.object({
      username: z.string().min(3).max(24),
      displayName: z.string().min(2).max(40),
      passwordHash: z.string().min(10),
    });

    const payload = payloadSchema.parse(challenge.payload ? JSON.parse(challenge.payload) : null);

    const [existingByEmail, existingByUsername] = await Promise.all([
      prisma.user.findUnique({ where: { email: normalizedEmail } }),
      prisma.user.findUnique({ where: { username: payload.username } }),
    ]);

    if (existingByEmail) {
      throw new HttpError(409, "Email already registered.");
    }

    if (existingByUsername) {
      throw new HttpError(409, "Username already used.");
    }

    const user = await prisma.user.create({
      data: {
        username: payload.username,
        email: normalizedEmail,
        displayName: payload.displayName,
        passwordHash: payload.passwordHash,
        emailVerifiedAt: new Date(),
      },
    });

    await prisma.otpChallenge.deleteMany({
      where: {
        email: normalizedEmail,
        purpose: OtpPurpose.SIGNUP,
      },
    });

    const session = await issueSession({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        displayName: user.displayName,
      },
      res,
    });

    return res.status(201).json(session);
  } catch (error) {
    return next(error);
  }
});

router.post("/login", loginLimiter, async (req, res, next) => {
  try {
    const { identifier, password } = loginSchema.parse(req.body);

    const user = await findUserByIdentifier(identifier);

    if (!user) {
      throw new HttpError(401, "Invalid username/email or password.");
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);

    if (!validPassword) {
      throw new HttpError(401, "Invalid username/email or password.");
    }

    const session = await issueSession({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        displayName: user.displayName,
      },
      res,
    });

    return res.json(session);
  } catch (error) {
    return next(error);
  }
});

router.post("/refresh", async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken as string | undefined;

    if (!refreshToken) {
      throw new HttpError(401, "Missing refresh token.");
    }

    const payload = verifyRefreshToken(refreshToken);

    if (payload.type !== "refresh") {
      throw new HttpError(401, "Invalid refresh token.");
    }

    const tokenRecord = await prisma.refreshToken.findFirst({
      where: {
        id: payload.jti,
        userId: payload.sub,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!tokenRecord || tokenRecord.tokenHash !== sha256(refreshToken)) {
      throw new HttpError(401, "Refresh token not valid.");
    }

    await prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { revokedAt: new Date() },
    });

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });

    if (!user) {
      throw new HttpError(404, "User not found.");
    }

    const session = await issueSession({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        displayName: user.displayName,
      },
      res,
    });

    return res.json(session);
  } catch (error) {
    return next(error);
  }
});

router.post("/logout", async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken as string | undefined;

    if (refreshToken) {
      try {
        const payload = verifyRefreshToken(refreshToken);
        await prisma.refreshToken.updateMany({
          where: {
            id: payload.jti,
            userId: payload.sub,
            revokedAt: null,
          },
          data: {
            revokedAt: new Date(),
          },
        });
      } catch {
        // Best effort logout.
      }
    }

    res.clearCookie("refreshToken", {
      path: "/api/auth",
      sameSite: "lax",
      secure: env.NODE_ENV === "production",
      httpOnly: true,
    });

    return res.json({ message: "Logged out." });
  } catch (error) {
    return next(error);
  }
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.authUser!.id },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new HttpError(404, "User not found.");
    }

    return res.json(user);
  } catch (error) {
    return next(error);
  }
});

export { router as authRouter };
