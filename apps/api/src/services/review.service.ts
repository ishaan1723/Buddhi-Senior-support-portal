import { prisma } from "../lib/prisma.js";
import { HttpError } from "../utils/http-error.js";

export async function createReview(input: {
  vendorId: string;
  bookingId?: string;
  rating: number;
  comment?: string;
  userId?: string;
}) {
  const vendor = await prisma.vendor.findUnique({ where: { id: input.vendorId } });
  if (!vendor) throw new HttpError(404, "Vendor not found", "VENDOR_NOT_FOUND");

  const review = await prisma.review.create({
    data: {
      vendorId: input.vendorId,
      bookingId: input.bookingId,
      userId: input.userId,
      rating: input.rating,
      comment: input.comment
    }
  });

  const aggregate = await prisma.review.aggregate({
    where: { vendorId: input.vendorId, isPublished: true },
    _avg: { rating: true },
    _count: true
  });
  await prisma.vendor.update({
    where: { id: input.vendorId },
    data: {
      averageRating: aggregate._avg.rating || 0,
      reviewCount: aggregate._count
    }
  });

  return review;
}
