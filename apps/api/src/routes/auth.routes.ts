import { Router } from "express";
import { adminLogin, requestOtp, verifyOtp } from "../controllers/auth.controller.js";
import { otpLimiter } from "../middleware/rate-limit.js";
import { validateBody } from "../middleware/validate.js";
import { adminLoginSchema, requestOtpSchema, verifyOtpSchema } from "../validators/auth.schema.js";

export const authRouter = Router();

authRouter.post("/otp/request", otpLimiter, validateBody(requestOtpSchema), requestOtp);
authRouter.post("/otp/verify", otpLimiter, validateBody(verifyOtpSchema), verifyOtp);
authRouter.post("/admin/login", validateBody(adminLoginSchema), adminLogin);
