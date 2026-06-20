import type { Request, Response } from "express";
import { HttpError } from "../utils/http-error.js";
import * as vendorService from "../services/vendor.service.js";

export async function listVendors(req: Request, res: Response) {
  const result = await vendorService.listVendors(req.query as { category?: string; search?: string; verified?: "true" | "false" });
  res.json(result);
}

export async function getVendor(req: Request, res: Response) {
  const result = await vendorService.getVendor(req.params.id as string);
  if (!result) throw new HttpError(404, "Vendor not found", "VENDOR_NOT_FOUND");
  res.json(result);
}
