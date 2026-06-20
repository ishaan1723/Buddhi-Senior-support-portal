import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { normalizePhone } from "../utils/phone.js";
import { HttpError } from "../utils/http-error.js";
import { sendSms } from "./sms.service.js";

export async function createBooking(input: {
  vendorId: string;
  requesterName: string;
  requesterPhone: string;
  preferredTime?: string;
  notes?: string;
  userId?: string;
}) {
  const vendor = await prisma.vendor.findUnique({ where: { id: input.vendorId } });
  if (!vendor || vendor.status !== "APPROVED") throw new HttpError(404, "Vendor not available", "VENDOR_NOT_FOUND");

  const booking = await prisma.booking.create({
    data: {
      userId: input.userId,
      vendorId: vendor.id,
      requesterName: input.requesterName,
      requesterPhone: normalizePhone(input.requesterPhone),
      preferredTime: input.preferredTime ? new Date(input.preferredTime) : undefined,
      notes: input.notes,
      supportNumber: env.SUPPORT_PHONE
    },
    include: { vendor: true }
  });

  await sendSms(env.SUPPORT_PHONE, `New Buddhi booking: ${input.requesterName} needs ${vendor.name}. Call ${booking.requesterPhone}.`);
  return booking;
}

export async function listBookings() {
  return prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    include: { vendor: { include: { category: true } }, user: true }
  });
}
