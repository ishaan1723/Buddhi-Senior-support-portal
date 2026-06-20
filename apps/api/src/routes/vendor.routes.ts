import { Router } from "express";
import { getVendor, listVendors } from "../controllers/vendor.controller.js";
import { validateQuery } from "../middleware/validate.js";
import { vendorQuerySchema } from "../validators/vendor.schema.js";

export const vendorRouter = Router();

vendorRouter.get("/", validateQuery(vendorQuerySchema), listVendors);
vendorRouter.get("/:id", getVendor);
