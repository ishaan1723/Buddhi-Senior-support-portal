import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import { HttpError } from "../utils/http-error.js";

const safeMethods = new Set(["GET", "HEAD", "OPTIONS"]);

export function verifyOrigin(req: Request, _res: Response, next: NextFunction) {
  if (safeMethods.has(req.method)) {
    next();
    return;
  }

  const origin = req.headers.origin;
  if (!origin || origin === env.WEB_ORIGIN) {
    next();
    return;
  }

  throw new HttpError(403, "Request origin is not allowed", "CSRF_ORIGIN_BLOCKED");
}
