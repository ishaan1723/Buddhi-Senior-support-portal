"use client";

import { useEffect, useState } from "react";
import { apiFetch, type Booking } from "@/lib/api";
import { useRouter } from "next/navigation";
import { CalendarCheck, Clock, Phone, AlertCircle, RefreshCw } from "lucide-react";

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = window.localStorage.getItem("buddhi_token");
    if (!token) {
      router.replace("/login");
      return;
    }
    void fetchBookings(token);
  }, [router]);

  async function fetchBookings(token: string) {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<Booking[]>("/api/bookings/my", { token });
      setBookings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }

  function getStatusStyle(status: Booking["status"]) {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-50 border-leaf text-leaf";
      case "CONTACTED":
      case "CONFIRMED":
        return "bg-sky-50 border-trust text-trust";
      case "CANCELLED":
        return "bg-rose-50 border-danger text-danger";
      case "REQUESTED":
      default:
        return "bg-amber-50 border-saffron text-saffron";
    }
  }

  function getStatusLabel(status: Booking["status"]) {
    switch (status) {
      case "COMPLETED":
        return "Completed";
      case "CONTACTED":
        return "Support Call Completed";
      case "CONFIRMED":
        return "Booking Confirmed";
      case "CANCELLED":
        return "Cancelled";
      case "REQUESTED":
      default:
        return "Requested - Support Will Call";
    }
  }

  if (loading) {
    return (
      <div className="page-shell flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-trust border-t-transparent mx-auto"></div>
          <p className="mt-4 text-xl font-bold text-ink">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-black text-ink">My Bookings</h1>
        <button
          onClick={() => {
            const token = window.localStorage.getItem("buddhi_token") || "";
            void fetchBookings(token);
          }}
          className="btn-tactile bg-white text-ink text-sm px-3 py-1 flex items-center gap-1.5 min-h-12"
          title="Refresh bookings"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <p className="mt-2 text-lg text-gray-700 font-medium">
        Track your concierge booking requests. Our team calls you for every request to finalize details.
      </p>

      {error ? (
        <div className="mt-5 panel border-danger bg-rose-50/50 flex items-start gap-3 text-danger font-semibold">
          <AlertCircle className="h-6 w-6 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="mt-6 grid gap-5">
        {bookings.map((booking) => (
          <article 
            key={booking.id} 
            className="premium-card bg-white border-l-8 border-trust flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs uppercase tracking-wider bg-trust/10 text-trust font-black px-2 py-0.5 rounded">
                  {booking.vendor.category.name}
                </span>
                <span className={`text-xs font-black px-2.5 py-1 rounded-full border-2 ${getStatusStyle(booking.status)}`}>
                  {getStatusLabel(booking.status)}
                </span>
              </div>
              <h2 className="mt-3 text-2xl font-black text-ink">{booking.vendor.name}</h2>
              <div className="mt-2 flex flex-col gap-1 text-sm text-gray-750 font-medium">
                <span className="flex items-center gap-1.5">
                  <CalendarCheck className="h-4 w-4 text-trust" />
                  Requested on: {new Date(booking.createdAt).toLocaleDateString()}
                </span>
                {booking.preferredTime ? (
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-saffron" />
                    Preferred: {new Date(booking.preferredTime).toLocaleString()}
                  </span>
                ) : null}
              </div>
              {booking.notes ? (
                <div className="mt-3 bg-gray-50 border border-gray-250 p-3 rounded-lg text-sm text-gray-800">
                  <strong>Notes:</strong> {booking.notes}
                </div>
              ) : null}
            </div>
            
            <div className="border-t border-gray-100 md:border-t-0 pt-4 md:pt-0 flex flex-col gap-2 shrink-0">
              <span className="text-xs font-bold text-gray-600">Assigned Support Desk:</span>
              <a 
                href={`tel:${booking.supportNumber}`} 
                className="btn-tactile bg-emerald-50 hover:bg-emerald-100 text-leaf border-leaf flex items-center justify-center gap-2 text-base min-h-12 py-2"
              >
                <Phone className="h-5 w-5 fill-leaf" />
                Call Concierge
              </a>
            </div>
          </article>
        ))}

        {bookings.length === 0 && !error ? (
          <div className="premium-card bg-[#fdfaf2] border-saffron border-l-8 text-center py-10">
            <CalendarCheck className="h-14 w-14 text-saffron mx-auto" />
            <h3 className="mt-4 text-xl font-black text-ink">No bookings requested yet</h3>
            <p className="mt-2 text-gray-700 max-w-md mx-auto">
              Find doctor consultations, nursing support, plumbers, or electric repairs in our ward directory.
            </p>
            <a 
              href="/services" 
              className="btn-tactile bg-trust text-white hover:bg-sky-850 mt-6 inline-flex items-center gap-2 min-h-14"
            >
              Browse Services Directory
            </a>
          </div>
        ) : null}
      </div>
    </div>
  );
}
