import { z } from "zod";

export const vendorQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  verified: z.enum(["true", "false"]).optional()
});

export const reviewSchema = z.object({
  vendorId: z.string().min(1),
  bookingId: z.string().optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional()
});

export const bookingSchema = z.object({
  vendorId: z.string().min(1),
  requesterName: z.string().min(2).max(120),
  requesterPhone: z.string().min(10).max(16),
  preferredTime: z.string().datetime().optional(),
  notes: z.string().max(500).optional()
});

export const adminVendorSchema = z.object({
  categoryId: z.string().min(1),
  name: z.string().min(2).max(160),
  phone: z.string().min(10).max(16),
  whatsapp: z.string().min(10).max(16).optional(),
  address: z.string().min(5).max(300),
  locality: z.string().min(2).max(120).default("H-West Ward"),
  description: z.string().min(10).max(1000),
  yearsExperience: z.number().int().min(0).max(80).optional()
});

export const adminVerificationSchema = z.object({
  identityVerified: z.enum(["PENDING", "PASSED", "FAILED"]),
  addressVerified: z.enum(["PENDING", "PASSED", "FAILED"]),
  licenseVerified: z.enum(["PENDING", "PASSED", "FAILED"]),
  referencesChecked: z.enum(["PENDING", "PASSED", "FAILED"]),
  serviceQualityApproved: z.enum(["PENDING", "PASSED", "FAILED"]),
  notes: z.string().max(1000).optional()
});

export const categorySchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(120).regex(/^[a-z0-9-]+$/),
  description: z.string().max(300).optional()
});

export const emergencyContactSchema = z.object({
  userId: z.string().min(1),
  name: z.string().min(2).max(120),
  phone: z.string().min(10).max(16),
  relation: z.enum(["FAMILY", "NEIGHBOUR", "DOCTOR", "LOCAL_RESPONDER", "SUPPORT_EXECUTIVE"]),
  priority: z.number().int().min(1).max(10).default(1),
  canReceiveSms: z.boolean().default(true),
  canReceiveWhatsapp: z.boolean().default(true),
  isActive: z.boolean().default(true)
});

export const supportNumberSchema = z.object({
  label: z.string().min(2).max(120),
  phone: z.string().min(10).max(16),
  whatsapp: z.string().min(10).max(16).optional(),
  isPrimary: z.boolean().default(false),
  isActive: z.boolean().default(true)
});
