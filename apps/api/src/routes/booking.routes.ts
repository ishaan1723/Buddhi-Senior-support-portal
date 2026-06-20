import { Router } from "express";
import { createBooking } from "../controllers/booking.controller.js";
import { optionalUser } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { bookingSchema } from "../validators/vendor.schema.js";

export const bookingRouter = Router();

bookingRouter.post("/", optionalUser, validateBody(bookingSchema), createBooking);
