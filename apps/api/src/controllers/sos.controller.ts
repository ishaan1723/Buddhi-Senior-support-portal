import type { Request, Response } from "express";
import * as sosService from "../services/sos.service.js";

export async function triggerSos(req: Request, res: Response) {
  const result = await sosService.triggerSos({ ...req.body, userId: req.auth?.userId });
  res.status(201).json(result);
}

export async function history(req: Request, res: Response) {
  const result = await sosService.listSosHistory(req.auth?.adminId ? undefined : req.auth?.userId);
  res.json(result);
}
