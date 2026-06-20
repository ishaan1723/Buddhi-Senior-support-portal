import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1),
  API_PORT: z.coerce.number().int().positive().default(4000),
  WEB_ORIGIN: z.string().url().default("http://localhost:3000"),
  JWT_SECRET: z.string().min(24),
  ADMIN_JWT_SECRET: z.string().min(24),
  OTP_TTL_MINUTES: z.coerce.number().int().positive().default(5),
  OTP_TEST_CODE: z.string().optional(),
  SUPPORT_PHONE: z.string().default("+912212345678"),
  SUPPORT_WHATSAPP: z.string().default("+919876543210"),
  LOCAL_RESPONDER_PHONE: z.string().default("+912226422222"),
  MSG91_AUTH_KEY: z.string().optional(),
  MSG91_TEMPLATE_ID: z.string().optional(),
  MSG91_SENDER_ID: z.string().default("BUDDHI"),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_FROM_PHONE: z.string().optional(),
  WHATSAPP_PROVIDER: z.enum(["mock", "meta"]).default("mock"),
  WHATSAPP_BUSINESS_TOKEN: z.string().optional(),
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional()
});

export const env = envSchema.parse(process.env);
