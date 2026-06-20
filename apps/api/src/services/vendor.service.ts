import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

export async function listVendors(query: { category?: string; search?: string; verified?: "true" | "false" }) {
  const where: Prisma.VendorWhereInput = {
    status: "APPROVED",
    ...(query.verified ? { buddhiVerified: query.verified === "true" } : {}),
    ...(query.category ? { category: { slug: query.category } } : {}),
    ...(query.search
      ? {
          OR: [
            { name: { contains: query.search } },
            { description: { contains: query.search } },
            { locality: { contains: query.search } }
          ]
        }
      : {})
  };

  return prisma.vendor.findMany({
    where,
    orderBy: [{ buddhiVerified: "desc" }, { averageRating: "desc" }, { name: "asc" }],
    include: { category: true }
  });
}

export async function getVendor(id: string) {
  return prisma.vendor.findUnique({
    where: { id },
    include: {
      category: true,
      checklist: true,
      reviews: {
        where: { isPublished: true },
        orderBy: { createdAt: "desc" },
        take: 20
      }
    }
  });
}
