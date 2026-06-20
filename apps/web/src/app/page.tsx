"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CalendarCheck, ListChecks, Phone, Users } from "lucide-react";
import { ActionTile } from "@/components/action-tile";

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Temporarily disabled login redirect for review
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="page-shell flex min-h-[50vh] items-center justify-center">
        <p className="text-xl font-bold text-slate-800">Loading Buddhi portal...</p>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <section className="rounded-md border-2 border-trust bg-white p-5 shadow-soft">
        <p className="text-base font-semibold text-saffron">H-West Ward, Bandra/Khar</p>
        <h1 className="mt-2 text-3xl font-bold leading-tight text-ink">Buddhi Senior Support Portal</h1>
        <p className="mt-3 text-lg text-gray-800">Emergency assistance, trusted local services, and phone support for senior citizens.</p>
      </section>

      <section className="mt-5 grid gap-4 sm:grid-cols-2" aria-label="Quick actions">
        <ActionTile href="/sos" label="Emergency Help" detail="Open SOS confirmation" icon={AlertTriangle} tone="danger" />
        <ActionTile href="/services" label="Find Services" detail="Doctors, nurses, repairs, care" icon={ListChecks} />
        <ActionTile href="tel:+912212345678" label="Call Support" detail="Speak with Buddhi concierge" icon={Phone} tone="leaf" />
        <ActionTile href="/bookings" label="My Bookings" detail="Track call-to-book requests" icon={CalendarCheck} tone="saffron" />
        <ActionTile href="/contacts" label="Important Contacts" detail="Emergency and ward numbers" icon={Users} />
      </section>
    </div>
  );
}
