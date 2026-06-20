import bcrypt from "bcryptjs";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { normalizePhone } from "../utils/phone.js";
import { signAdminToken, signUserToken } from "../utils/tokens.js";
import { HttpError } from "../utils/http-error.js";
import { sendSms } from "./sms.service.js";

function generateOtp() {
  return env.OTP_TEST_CODE || String(Math.floor(100000 + Math.random() * 900000));
}

export async function requestOtp(input: { phone: string; fullName?: string }) {
  const phone = normalizePhone(input.phone);
  const code = generateOtp();
  const expiresAt = new Date(Date.now() + env.OTP_TTL_MINUTES * 60 * 1000);
  const user = await prisma.user.upsert({
    where: { phone },
    update: input.fullName ? { fullName: input.fullName } : {},
    create: { phone, fullName: input.fullName || "Buddhi Member" }
  });

  await prisma.otpCode.create({
    data: {
      phone,
      userId: user.id,
      codeHash: await bcrypt.hash(code, 10),
      expiresAt
    }
  });

  await sendSms(phone, `Your Buddhi login OTP is ${code}. It expires in ${env.OTP_TTL_MINUTES} minutes.`);
  return { ok: true, expiresAt };
}

export async function verifyOtp(input: { phone: string; code: string; fullName?: string }) {
  const phone = normalizePhone(input.phone);
  const otp = await prisma.otpCode.findFirst({
    where: { phone, consumedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" }
  });
  if (!otp) throw new HttpError(400, "OTP expired. Please request a new code.", "OTP_EXPIRED");
  if (otp.attempts >= 5) throw new HttpError(429, "Too many OTP attempts.", "OTP_LOCKED");

  const matches = await bcrypt.compare(input.code, otp.codeHash);
  await prisma.otpCode.update({
    where: { id: otp.id },
    data: { attempts: { increment: 1 }, consumedAt: matches ? new Date() : null }
  });
  if (!matches) throw new HttpError(400, "Incorrect OTP.", "OTP_INVALID");

  const user = await prisma.user.upsert({
    where: { phone },
    update: input.fullName ? { fullName: input.fullName } : {},
    create: { phone, fullName: input.fullName || "Buddhi Member" }
  });

  return {
    token: signUserToken({ userId: user.id, phone: user.phone, role: user.role }),
    user
  };
}

export async function adminLogin(input: { email: string; password: string }) {
  const admin = await prisma.admin.findUnique({ where: { email: input.email } });
  if (!admin || !admin.isActive) throw new HttpError(401, "Invalid admin credentials", "ADMIN_INVALID");
  const ok = await bcrypt.compare(input.password, admin.passwordHash);
  if (!ok) throw new HttpError(401, "Invalid admin credentials", "ADMIN_INVALID");
  return {
    token: signAdminToken(admin.id),
    admin: { id: admin.id, fullName: admin.fullName, email: admin.email }
  };
}
