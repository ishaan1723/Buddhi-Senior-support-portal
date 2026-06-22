import type { Request, Response } from "express";
import * as bookingService from "../services/booking.service.js";

export async function createBooking(req: Request, res: Response) {
  const result = await bookingService.createBooking({ ...req.body, userId: req.auth?.userId });
  res.status(201).json(result);
}

export async function getMyBookings(req: Request, res: Response) {
  const userId = req.auth?.userId || "";
  const phone = req.auth?.phone || "";
  const result = await bookingService.listUserBookings(userId, phone);
  res.json(result);
}
