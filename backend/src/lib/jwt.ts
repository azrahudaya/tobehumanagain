import jwt from "jsonwebtoken";
import type { Role } from "@prisma/client";
import { env } from "../config/env.js";

export type AccessTokenPayload = {
  sub: string;
  email: string;
  role: Role;
  type: "access";
};

export type RefreshTokenPayload = {
  sub: string;
  email: string;
  role: Role;
  jti: string;
  type: "refresh";
};

export const signAccessToken = (payload: Omit<AccessTokenPayload, "type">) => {
  return jwt.sign({ ...payload, type: "access" } satisfies AccessTokenPayload, env.JWT_ACCESS_SECRET, {
    expiresIn: `${env.ACCESS_TOKEN_TTL_MINUTES}m`,
  });
};

export const signRefreshToken = (payload: Omit<RefreshTokenPayload, "type">) => {
  return jwt.sign({ ...payload, type: "refresh" } satisfies RefreshTokenPayload, env.JWT_REFRESH_SECRET, {
    expiresIn: `${env.REFRESH_TOKEN_TTL_DAYS}d`,
  });
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
};
