import type { Request, Response } from "express";
import * as reviewService from "../services/review.service.js";

export async function createReview(req: Request, res: Response) {
  const result = await reviewService.createReview({ ...req.body, userId: req.auth?.userId });
  res.status(201).json(result);
}
