import rateLimit from "express-rate-limit";

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-7",
  legacyHeaders: false
});

export const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  message: { error: "Too many OTP attempts. Please wait and try again." },
  standardHeaders: "draft-7",
  legacyHeaders: false
});

export const sosLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 3,
  message: { error: "SOS was triggered recently. Support has been alerted." },
  standardHeaders: "draft-7",
  legacyHeaders: false
});
