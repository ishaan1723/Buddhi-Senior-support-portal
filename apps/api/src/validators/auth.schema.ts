import { z } from "zod";

export const requestOtpSchema = z.object({
  fullName: z.string().min(2).max(120).optional(),
  phone: z.string().min(10).max(16)
});

export const verifyOtpSchema = z.object({
  phone: z.string().min(10).max(16),
  code: z.string().length(6),
  fullName: z.string().min(2).max(120).optional()
});

export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});
