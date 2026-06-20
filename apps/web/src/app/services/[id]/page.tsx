import { BadgeCheck, MapPin, Phone, Star } from "lucide-react";
import { BookingForm } from "@/components/booking-form";
import { ReviewForm } from "@/components/review-form";
import { getVendor } from "@/lib/api";
import { phoneHref, ratingText } from "@/lib/format";

export default async function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vendor = await getVendor(id);

  return (
    <div className="page-shell">
      <p className="font-semibold uppercase text-gray-600">{vendor.category.name}</p>
      <h1 className="mt-1 text-3xl font-bold">{vendor.name}</h1>
      {vendor.buddhiVerified ? (
        <p className="mt-3 inline-flex items-center gap-2 rounded-md bg-green-50 px-3 py-2 font-bold text-leaf">
          <BadgeCheck aria-hidden="true" className="h-5 w-5" />
          Buddhi Verified
        </p>
      ) : null}
      <div className="panel mt-5">
        <p className="text-lg text-gray-800">{vendor.description}</p>
        <p className="mt-4 flex items-center gap-2">
          <MapPin aria-hidden="true" className="h-5 w-5 text-trust" />
          {vendor.address}
        </p>
        <p className="mt-3 flex items-center gap-2 font-semibold">
          <Star aria-hidden="true" className="h-5 w-5 fill-saffron text-saffron" />
          {ratingText(vendor.averageRating)} from {vendor.reviewCount} reviews
        </p>
        <a className="touch-button mt-5 block bg-trust text-center text-white" href={phoneHref(vendor.phone)}>
          <Phone aria-hidden="true" className="mr-2 inline h-5 w-5" />
          Call Vendor
        </a>
      </div>

      <BookingForm vendorId={vendor.id} />
      <ReviewForm vendorId={vendor.id} />

      <section className="mt-5">
        <h2 className="text-2xl font-bold">Recent reviews</h2>
        <div className="mt-3 grid gap-3">
          {vendor.reviews.map((review) => (
            <article key={review.id} className="panel">
              <p className="font-bold">{review.rating} stars</p>
              <p className="mt-2 text-gray-800">{review.comment || "No comment provided."}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
