import { z } from "zod";

export const triggerSosSchema = z.object({
  phone: z.string().min(10).max(16),
  name: z.string().min(2).max(120).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  addressHint: z.string().max(300).optional(),
  notes: z.string().max(500).optional()
});
