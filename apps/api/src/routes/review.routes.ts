import { Router } from "express";
import { createReview } from "../controllers/review.controller.js";
import { optionalUser } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { reviewSchema } from "../validators/vendor.schema.js";

export const reviewRouter = Router();

reviewRouter.post("/", optionalUser, validateBody(reviewSchema), createReview);
