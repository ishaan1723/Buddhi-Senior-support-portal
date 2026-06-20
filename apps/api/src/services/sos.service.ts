export enum NotificationChannel {
  SMS = "SMS",
  WHATSAPP = "WHATSAPP"
}
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { normalizePhone } from "../utils/phone.js";
import { sendSms } from "./sms.service.js";
import { sendWhatsapp } from "./whatsapp.service.js";

type TriggerSosInput = {
  phone: string;
  name?: string;
  latitude?: number;
  longitude?: number;
  addressHint?: string;
  notes?: string;
  userId?: string;
};

function emergencyMessage(name: string, phone: string, addressHint?: string) {
  const place = addressHint ? ` Location: ${addressHint}.` : "";
  return `Buddhi SOS alert for ${name} (${phone}). Please call immediately.${place}`;
}

export async function triggerSos(input: TriggerSosInput) {
  const phone = normalizePhone(input.phone);
  const user = input.userId
    ? await prisma.user.findUnique({ where: { id: input.userId }, include: { emergencyContacts: true } })
    : await prisma.user.findUnique({ where: { phone }, include: { emergencyContacts: true } });

  const displayName = input.name || user?.fullName || "Senior citizen";
  const log = await prisma.emergencyLog.create({
    data: {
      userId: user?.id,
      phone,
      latitude: input.latitude,
      longitude: input.longitude,
      addressHint: input.addressHint,
      notes: input.notes,
      status: "NOTIFYING"
    }
  });

  const baseRecipients = [
    ...(user?.emergencyContacts.filter((contact) => contact.isActive) || []).map((contact) => ({
      name: contact.name,
      phone: contact.phone,
      sms: contact.canReceiveSms,
      whatsapp: contact.canReceiveWhatsapp
    })),
    { name: "Local Emergency Responder", phone: env.LOCAL_RESPONDER_PHONE, sms: true, whatsapp: true },
    { name: "Buddhi Support Executive", phone: env.SUPPORT_PHONE, sms: true, whatsapp: true }
  ];

  const message = emergencyMessage(displayName, phone, input.addressHint);
  const notificationRows = baseRecipients.flatMap((recipient) => [
    ...(recipient.sms
      ? [{ channel: NotificationChannel.SMS, recipientName: recipient.name, recipientPhone: normalizePhone(recipient.phone) }]
      : []),
    ...(recipient.whatsapp
      ? [
          {
            channel: NotificationChannel.WHATSAPP,
            recipientName: recipient.name,
            recipientPhone: normalizePhone(recipient.phone)
          }
        ]
      : [])
  ]);

  await prisma.emergencyNotification.createMany({
    data: notificationRows.map((notification) => ({ ...notification, emergencyLogId: log.id }))
  });

  await processEmergencyNotifications(log.id, message);
  const updated = await prisma.emergencyLog.findUniqueOrThrow({
    where: { id: log.id },
    include: { notifications: true }
  });
  return updated;
}

export async function processEmergencyNotifications(emergencyLogId: string, message?: string) {
  const log = await prisma.emergencyLog.findUniqueOrThrow({
    where: { id: emergencyLogId },
    include: { notifications: true }
  });
  const body = message || `Buddhi SOS alert for ${log.phone}. Please call immediately.`;

  const pendingNotifications = log.notifications.filter((item) => ["PENDING", "RETRYING"].includes(item.status));

  await Promise.allSettled(
    pendingNotifications.map(async (notification) => {
      try {
        const result =
          notification.channel === "SMS"
            ? await sendSms(notification.recipientPhone, body)
            : await sendWhatsapp(notification.recipientPhone, body);
        await prisma.emergencyNotification.update({
          where: { id: notification.id },
          data: {
            status: "SENT",
            sentAt: new Date(),
            provider: result.provider,
            providerMessageId: result.providerMessageId,
            attemptCount: { increment: 1 },
            lastError: null,
            nextRetryAt: null
          }
        });
      } catch (error) {
        const attemptCount = notification.attemptCount + 1;
        await prisma.emergencyNotification.update({
          where: { id: notification.id },
          data: {
            status: attemptCount >= 3 ? "FAILED" : "RETRYING",
            attemptCount,
            lastError: error instanceof Error ? error.message : "Notification failed",
            nextRetryAt: attemptCount >= 3 ? null : new Date(Date.now() + attemptCount * 60 * 1000)
          }
        });
      }
    })
  );

  const remaining = await prisma.emergencyNotification.count({
    where: { emergencyLogId, status: { in: ["PENDING", "RETRYING"] } }
  });
  await prisma.emergencyLog.update({
    where: { id: emergencyLogId },
    data: { status: remaining === 0 ? "NOTIFIED" : "NOTIFYING" }
  });
}

export async function listSosHistory(userId?: string) {
  return prisma.emergencyLog.findMany({
    where: userId ? { userId } : {},
    orderBy: { triggeredAt: "desc" },
    take: 50,
    include: { notifications: true }
  });
}
