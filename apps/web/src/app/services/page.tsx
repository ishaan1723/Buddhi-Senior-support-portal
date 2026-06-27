import Link from "next/link";
import { VendorCard } from "@/components/vendor-card";
import { getVendors } from "@/lib/api";

const categories = [
  ["Doctors", "doctors"],
  ["Chemists", "chemists"],
  ["Nurses", "nurses"],
  ["Caregivers", "caregivers"],
  ["Electricians", "electricians"],
  ["Plumbers", "plumbers"],
  ["Medical Equipment", "medical-equipment"],
  ["Physiotherapists", "physiotherapists"],
  ["Home Services", "home-services"],
  ["Advocates", "advocates"]
];

export default async function ServicesPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const params = await searchParams;
  const vendors = await getVendors(params.category);

  return (
    <div className="page-shell">
      <h1 className="text-3xl font-bold">Find services</h1>
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2" aria-label="Service categories">
        <Link className="touch-button shrink-0 border-2 border-trust bg-white text-trust" href="/services">
          All
        </Link>
        {categories.map(([name, slug]) => (
          <Link key={slug} className="touch-button shrink-0 border-2 border-gray-300 bg-white text-gray-900" href={`/services?category=${slug}`}>
            {name}
          </Link>
        ))}
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {vendors.map((vendor) => (
          <VendorCard key={vendor.id} vendor={vendor} />
        ))}
      </div>
      {vendors.length === 0 ? <p className="panel mt-5 text-lg">No vendors found for this category.</p> : null}
    </div>
  );
}
