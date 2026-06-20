import type { Request, Response } from "express";
import * as authService from "../services/auth.service.js";

export async function requestOtp(req: Request, res: Response) {
  const result = await authService.requestOtp(req.body);
  res.json(result);
}

export async function verifyOtp(req: Request, res: Response) {
  const result = await authService.verifyOtp(req.body);
  res.json(result);
}

export async function adminLogin(req: Request, res: Response) {
  const result = await authService.adminLogin(req.body);
  res.json(result);
}
