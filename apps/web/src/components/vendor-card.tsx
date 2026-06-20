import Link from "next/link";
import { BadgeCheck, Phone, Star } from "lucide-react";
import type { Vendor } from "@/lib/api";
import { phoneHref, ratingText } from "@/lib/format";

export function VendorCard({ vendor }: { vendor: Vendor }) {
  return (
    <article className="panel">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase text-gray-600">{vendor.category.name}</p>
          <h2 className="mt-1 text-xl font-bold text-ink">{vendor.name}</h2>
        </div>
        {vendor.buddhiVerified ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-green-50 px-2 py-1 text-sm font-bold text-leaf">
            <BadgeCheck aria-hidden="true" className="h-4 w-4" />
            Verified
          </span>
        ) : null}
      </div>
      <p className="mt-3 text-gray-800">{vendor.description}</p>
      <p className="mt-2 text-gray-700">{vendor.locality}</p>
      <p className="mt-3 flex items-center gap-2 font-semibold">
        <Star aria-hidden="true" className="h-5 w-5 fill-saffron text-saffron" />
        {ratingText(vendor.averageRating)} from {vendor.reviewCount} reviews
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <a className="touch-button bg-trust text-center text-white" href={phoneHref(vendor.phone)}>
          <Phone aria-hidden="true" className="mr-2 inline h-5 w-5" />
          Call
        </a>
        <Link className="touch-button border-2 border-trust bg-white text-center text-trust" href={`/services/${vendor.id}`}>
          Details
        </Link>
      </div>
    </article>
  );
}
