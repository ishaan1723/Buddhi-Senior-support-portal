import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../utils/http-error.js";

export async function dashboard(req: Request, res: Response) {
  const [vendorsPending, vendorsApproved, sosOpen, bookingsRequested, reviewCount] = await Promise.all([
    prisma.vendor.count({ where: { status: "PENDING" } }),
    prisma.vendor.count({ where: { status: "APPROVED" } }),
    prisma.emergencyLog.count({ where: { status: { in: ["TRIGGERED", "NOTIFYING", "NOTIFIED"] } } }),
    prisma.booking.count({ where: { status: "REQUESTED" } }),
    prisma.review.count()
  ]);
  res.json({ vendorsPending, vendorsApproved, sosOpen, bookingsRequested, reviewCount });
}

export async function listAdminVendors(_req: Request, res: Response) {
  const vendors = await prisma.vendor.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true, checklist: true }
  });
  res.json(vendors);
}

export async function createVendor(req: Request, res: Response) {
  const vendor = await prisma.vendor.create({
    data: {
      ...req.body,
      checklist: { create: {} }
    },
    include: { category: true, checklist: true }
  });
  res.status(201).json(vendor);
}

export async function approveVendor(req: Request, res: Response) {
  const id = req.params.id as string;
  const vendor = await prisma.vendor.update({
    where: { id },
    data: { status: "APPROVED" },
    include: { checklist: true }
  });
  res.json(vendor);
}

export async function rejectVendor(req: Request, res: Response) {
  const id = req.params.id as string;
  const vendor = await prisma.vendor.update({
    where: { id },
    data: { status: "REJECTED", buddhiVerified: false },
    include: { checklist: true }
  });
  res.json(vendor);
}

export async function updateVerification(req: Request, res: Response) {
  const id = req.params.id as string;
  const allPassed = Object.values(req.body).filter((value) => value === "PASSED").length >= 5;
  const vendor = await prisma.vendor.update({
    where: { id },
    data: {
      buddhiVerified: allPassed,
      checklist: {
        upsert: {
          create: { ...req.body, verifiedByAdminId: req.auth?.adminId },
          update: { ...req.body, verifiedByAdminId: req.auth?.adminId }
        }
      }
    },
    include: { checklist: true }
  });
  res.json(vendor);
}

export async function listCategories(_req: Request, res: Response) {
  res.json(await prisma.category.findMany({ orderBy: { name: "asc" } }));
}

export async function createCategory(req: Request, res: Response) {
  res.status(201).json(await prisma.category.create({ data: req.body }));
}

export async function listBookings(_req: Request, res: Response) {
  res.json(
    await prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      include: { vendor: true, user: true }
    })
  );
}

export async function updateBookingStatus(req: Request, res: Response) {
  const status = req.body.status;
  if (!["REQUESTED", "CONTACTED", "CONFIRMED", "COMPLETED", "CANCELLED"].includes(status)) {
    throw new HttpError(400, "Invalid booking status", "INVALID_STATUS");
  }
  const id = req.params.id as string;
  res.json(await prisma.booking.update({ where: { id }, data: { status } }));
}

export async function listEmergencyContacts(_req: Request, res: Response) {
  res.json(
    await prisma.emergencyContact.findMany({
      orderBy: [{ userId: "asc" }, { priority: "asc" }],
      include: { user: true }
    })
  );
}

export async function createEmergencyContact(req: Request, res: Response) {
  res.status(201).json(await prisma.emergencyContact.create({ data: req.body }));
}

export async function updateEmergencyContact(req: Request, res: Response) {
  const id = req.params.id as string;
  res.json(await prisma.emergencyContact.update({ where: { id }, data: req.body }));
}

export async function listSupportNumbers(_req: Request, res: Response) {
  res.json(await prisma.supportNumber.findMany({ orderBy: [{ isPrimary: "desc" }, { label: "asc" }] }));
}

export async function createSupportNumber(req: Request, res: Response) {
  res.status(201).json(await prisma.supportNumber.create({ data: req.body }));
}

export async function updateSupportNumber(req: Request, res: Response) {
  const id = req.params.id as string;
  res.json(await prisma.supportNumber.update({ where: { id }, data: req.body }));
}

export async function listFeedback(_req: Request, res: Response) {
  res.json(
    await prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      include: { vendor: true, user: true, booking: true }
    })
  );
}
