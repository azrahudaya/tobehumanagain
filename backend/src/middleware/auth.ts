import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../lib/jwt.js";
import { HttpError } from "../lib/http-error.js";

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new HttpError(401, "Unauthorized"));
  }

  const token = authHeader.slice("Bearer ".length);

  try {
    const payload = verifyAccessToken(token);
    req.authUser = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
    return next();
  } catch {
    return next(new HttpError(401, "Invalid or expired token"));
  }
};

export const requireRole = (role: "ADMIN" | "USER") => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.authUser) {
      return next(new HttpError(401, "Unauthorized"));
    }

    if (req.authUser.role !== role) {
      return next(new HttpError(403, "Forbidden"));
    }

    return next();
  };
};
