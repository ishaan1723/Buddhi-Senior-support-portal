"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { Phone, CheckCircle } from "lucide-react";

export function BookingForm({ vendorId }: { vendorId: string }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const savedPhone = isClient ? window.localStorage.getItem("buddhi_phone") || "" : "";
  const savedName = isClient ? window.localStorage.getItem("buddhi_name") || "Buddhi Member" : "";
  const savedToken = isClient ? window.localStorage.getItem("buddhi_token") || "" : "";

  async function handleOneClickBook() {
    setError("");
    setMessage("");
    setIsBooking(true);
    try {
      const result = await apiFetch<{ supportNumber: string }>("/api/bookings", {
        method: "POST",
        body: JSON.stringify({
          vendorId,
          requesterName: savedName,
          requesterPhone: savedPhone
        }),
        token: savedToken
      });
      setMessage(`Booking request registered! Dialing support at ${result.supportNumber}...`);
      // Start the phone call immediately
      window.location.href = `tel:${result.supportNumber}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create booking");
    } finally {
      setIsBooking(false);
    }
  }

  async function submit(formData: FormData) {
    setError("");
    setMessage("");
    try {
      const result = await apiFetch<{ supportNumber: string }>("/api/bookings", {
        method: "POST",
        body: JSON.stringify({
          vendorId,
          requesterName: formData.get("requesterName"),
          requesterPhone: formData.get("requesterPhone"),
          notes: formData.get("notes") || undefined
        })
      });
      setMessage(`Request created. Buddhi support will call you. Support: ${result.supportNumber}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create booking");
    }
  }

  // If logged in, show the true premium "One-Click Call to Book" experience!
  if (isClient && savedPhone) {
    return (
      <div className="panel mt-5 border-2 border-leaf bg-green-50/30">
        <h2 className="text-xl font-black text-leaf">Call to Book (Concierge Helper)</h2>
        <p className="mt-2 text-base text-gray-800">
          Hello <strong>{savedName}</strong>, you can request this service with a single tap. We will register your request and connect you to our support desk.
        </p>
        
        {message ? (
          <div className="mt-4 flex items-start gap-2 rounded-md bg-green-50 border border-leaf p-3 text-leaf font-semibold">
            <CheckCircle className="h-6 w-6 shrink-0" />
            <span>{message}</span>
          </div>
        ) : null}
        {error ? <p className="mt-4 rounded-md bg-red-50 p-3 font-semibold text-danger">{error}</p> : null}

        <button
          type="button"
          onClick={handleOneClickBook}
          disabled={isBooking}
          className="touch-button flex items-center justify-center gap-2 mt-5 w-full bg-leaf text-white font-black text-lg min-h-14 border-2 border-leaf shadow-soft active:scale-98 transition-transform"
        >
          <Phone className="h-6 w-6" />
          {isBooking ? "Registering..." : "One-Click Call to Book"}
        </button>
      </div>
    );
  }

  // Fallback for anonymous/not logged-in users
  return (
    <form action={submit} className="panel mt-5">
      <h2 className="text-xl font-bold">Call to book</h2>
      <p className="mt-1 text-sm text-gray-700">Fill in your details below, or login from the menu to book in a single click.</p>
      
      <div className="mt-4">
        <label className="label" htmlFor="requesterName">
          Your name
        </label>
        <input className="input" id="requesterName" name="requesterName" required minLength={2} />
      </div>
      <div className="mt-4">
        <label className="label" htmlFor="requesterPhone">
          Mobile number
        </label>
        <input className="input" id="requesterPhone" name="requesterPhone" required inputMode="tel" />
      </div>
      <div className="mt-4">
        <label className="label" htmlFor="notes">
          Notes (Optional)
        </label>
        <textarea className="input min-h-28 py-3" id="notes" name="notes" />
      </div>
      {message ? <p className="mt-4 rounded-md bg-green-50 p-3 font-semibold text-leaf">{message}</p> : null}
      {error ? <p className="mt-4 rounded-md bg-red-50 p-3 font-semibold text-danger">{error}</p> : null}
      <button className="touch-button mt-5 w-full bg-trust text-white" type="submit">
        Create Booking Request
      </button>
    </form>
  );
}
