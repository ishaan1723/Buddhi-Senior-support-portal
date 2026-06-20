import { prisma } from "../lib/prisma.js";
import { processEmergencyNotifications } from "./sos.service.js";

let started = false;

export function startNotificationRetryWorker() {
  if (started) return;
  started = true;
  setInterval(async () => {
    const due = await prisma.emergencyNotification.findMany({
      where: { status: "RETRYING", nextRetryAt: { lte: new Date() } },
      distinct: ["emergencyLogId"],
      take: 20
    });
    for (const notification of due) {
      await processEmergencyNotifications(notification.emergencyLogId);
    }
  }, 30_000).unref();
}
