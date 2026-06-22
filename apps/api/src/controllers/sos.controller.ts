import type { Request, Response } from "express";
import * as sosService from "../services/sos.service.js";
import { prisma } from "../lib/prisma.js";

export async function triggerSos(req: Request, res: Response) {
  const result = await sosService.triggerSos({ ...req.body, userId: req.auth?.userId });
  res.status(201).json(result);
}

export async function history(req: Request, res: Response) {
  const result = await sosService.listSosHistory(req.auth?.adminId ? undefined : req.auth?.userId);
  res.json(result);
}

export async function getUserContacts(req: Request, res: Response) {
  const userId = req.auth?.userId;
  const contacts = await prisma.emergencyContact.findMany({
    where: { userId, isActive: true },
    orderBy: { priority: "asc" }
  });
  res.json(contacts);
}

export async function createUserContact(req: Request, res: Response) {
  const userId = req.auth?.userId || "";
  const contact = await prisma.emergencyContact.create({
    data: {
      ...req.body,
      userId
    }
  });
  res.status(201).json(contact);
}

export async function deleteUserContact(req: Request, res: Response) {
  const userId = req.auth?.userId || "";
  const id = req.params.id as string;
  const contact = await prisma.emergencyContact.findFirst({
    where: { id, userId }
  });
  if (!contact) {
    res.status(404).json({ error: "Contact not found" });
    return;
  }
  await prisma.emergencyContact.delete({
    where: { id }
  });
  res.json({ success: true });
}
