import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { HttpError } from "../utils/http-error.js";

type UserToken = {
  sub: string;
  phone: string;
  role: "SENIOR" | "FAMILY" | "SUPPORT";
};

type AdminToken = {
  sub: string;
  admin: true;
};

function readBearer(req: Request) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length);
}

export function requireUser(req: Request, _res: Response, next: NextFunction) {
  const token = readBearer(req);
  if (!token) throw new HttpError(401, "Login is required", "AUTH_REQUIRED");
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as UserToken;
    req.auth = { userId: payload.sub, phone: payload.phone, role: payload.role };
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new HttpError(401, "Session expired, please login again", "TOKEN_EXPIRED");
    }
    throw new HttpError(401, "Invalid token", "TOKEN_INVALID");
  }
}

export function optionalUser(req: Request, _res: Response, next: NextFunction) {
  const token = readBearer(req);
  if (!token) {
    next();
    return;
  }
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as UserToken;
    req.auth = { userId: payload.sub, phone: payload.phone, role: payload.role };
  } catch (error) {
    // Optional, ignore invalid tokens
  }
  next();
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  const token = readBearer(req);
  if (!token) throw new HttpError(401, "Admin login is required", "ADMIN_AUTH_REQUIRED");
  try {
    const payload = jwt.verify(token, env.ADMIN_JWT_SECRET) as AdminToken;
    if (!payload.admin) throw new HttpError(403, "Admin access denied", "ADMIN_FORBIDDEN");
    req.auth = { userId: payload.sub, adminId: payload.sub };
    next();
  } catch (error) {
    if (error instanceof HttpError) throw error;
    if (error instanceof jwt.TokenExpiredError) {
      throw new HttpError(401, "Session expired, please login again", "TOKEN_EXPIRED");
    }
    throw new HttpError(401, "Invalid token", "TOKEN_INVALID");
  }
}
