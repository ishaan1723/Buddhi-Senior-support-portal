"use client";
import { AlertTriangle, BadgeCheck, Phone, Send, X } from "lucide-react";
import { useRef, useState } from "react";
import { apiFetch } from "@/lib/api";

export function FixedSosButton() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  // Hold States
  const [isHolding, setIsHolding] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(3);
  const holdIntervalRef = useRef<number | null>(null);

  function startHold(event: React.PointerEvent<HTMLButtonElement>) {
    // Prevent default behaviour to avoid accidental trigger
    event.preventDefault();
    setIsHolding(true);
    setSecondsLeft(3);
    setStatus("idle");
    setError("");

    let count = 3;
    holdIntervalRef.current = window.setInterval(() => {
      count -= 1;
      setSecondsLeft(count);
      if (count <= 0) {
        if (holdIntervalRef.current) {
          window.clearInterval(holdIntervalRef.current);
          holdIntervalRef.current = null;
        }
        setIsHolding(false);
        setOpen(true);
        void sendSos();
      }
    }, 1000);
  }

  function cancelHold() {
    if (holdIntervalRef.current) {
      window.clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    setIsHolding(false);
    setSecondsLeft(3);
  }

  async function sendSos() {
    setStatus("sending");
    setError("");
    const phone = window.localStorage.getItem("buddhi_phone") || prompt("Please enter your phone number to identify yourself:") || "";
    if (!phone) {
      setStatus("error");
      setError("Phone number is required to trigger SOS.");
      return;
    }
    try {
      await apiFetch("/api/sos/trigger", {
        method: "POST",
        body: JSON.stringify({ phone, notes: "Triggered from Buddhi web portal (3s Hold)" })
      });
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Could not connect to server");
    }
  }

  const savedPhone = typeof window !== "undefined" ? window.localStorage.getItem("buddhi_phone") || "" : "";
  const smsBody = `EMERGENCY! I need immediate help. Phone: ${savedPhone || "Registered Senior"}. Please contact Buddhi Support (+912212345678).`;

  return (
    <>
      <button
        type="button"
        onPointerDown={startHold}
        onPointerUp={cancelHold}
        onPointerLeave={cancelHold}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            setOpen(true);
            void sendSos();
          }
        }}
        className="fixed bottom-24 right-4 z-40 flex h-20 w-20 flex-col items-center justify-center rounded-full border-4 border-white bg-danger text-lg font-bold text-white shadow-soft active:scale-95 transition-transform select-none"
        aria-label="Hold for 3 seconds to send emergency SOS"
      >
        <span className="text-xs uppercase tracking-wider text-red-200">Hold</span>
        <span className="text-xl leading-none">SOS</span>
      </button>

      {/* HOLD COUNTDOWN OVERLAY */}
      {isHolding ? (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 text-white p-5">
          <div className="relative flex h-48 w-48 items-center justify-center rounded-full border-8 border-danger bg-danger/10 shadow-soft">
            <span className="text-8xl font-black text-danger animate-pulse">{secondsLeft}</span>
          </div>
          <h2 className="mt-8 text-3xl font-black text-center tracking-wide text-danger">HOLDING FOR SOS EMERGENCY</h2>
          <p className="mt-3 text-xl text-gray-300 text-center">Do not let go! Release button to cancel.</p>
        </div>
      ) : null}

      {/* SOS MODAL */}
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" role="dialog" aria-modal="true" aria-labelledby="sos-title">
          <div className="w-full max-w-md rounded-md border-2 border-trust bg-white p-6 text-ink shadow-soft animate-in fade-in zoom-in duration-200">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-8 w-8 text-danger" />
                <h2 id="sos-title" className="text-2xl font-black text-ink">
                  Emergency SOS
                </h2>
              </div>
              <button
                className="rounded-md border-2 border-gray-300 p-2 hover:bg-gray-100"
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close SOS"
              >
                <X aria-hidden="true" className="h-6 w-6 text-gray-700" />
              </button>
            </div>

            <div className="mt-5">
              {status === "sending" ? (
                <div className="text-center py-6">
                  <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-danger border-t-transparent"></div>
                  <p className="mt-4 text-xl font-bold text-gray-800">Sending alerts to family & responders...</p>
                </div>
              ) : null}

              {status === "sent" ? (
                <div className="rounded-md bg-green-50 border-2 border-leaf p-4 text-center">
                  <BadgeCheck className="mx-auto h-12 w-12 text-leaf" />
                  <h3 className="mt-3 text-xl font-black text-leaf">ALERTS DISPATCHED!</h3>
                  <p className="mt-2 text-base text-gray-800 font-medium">
                    Your family, local responder, and Buddhi support have been notified. Please stay near your phone.
                  </p>
                </div>
              ) : null}

              {status === "error" ? (
                <div className="rounded-md bg-red-50 border-2 border-danger p-4">
                  <h3 className="text-lg font-bold text-danger">Alert could not send via internet</h3>
                  <p className="mt-1 text-sm text-gray-700">{error}</p>

                  <div className="mt-5 grid gap-3">
                    {/* SMS Fallback Button */}
                    <a
                      className="touch-button flex items-center justify-center gap-2 bg-trust text-white text-center text-lg font-bold min-h-14 border-2 border-trust"
                      href={`sms:${savedPhone || "+912226422222"}?body=${encodeURIComponent(smsBody)}`}
                    >
                      <Send className="h-6 w-6" />
                      Send SMS Alert (No Internet)
                    </a>
                    {/* Call 112 Backup */}
                    <a
                      className="touch-button flex items-center justify-center gap-2 bg-danger text-white text-center text-lg font-bold min-h-14 border-2 border-danger"
                      href="tel:112"
                    >
                      <Phone className="h-6 w-6 animate-bounce" />
                      Call Emergency (112)
                    </a>
                  </div>
                </div>
              ) : null}

              {status === "idle" ? (
                <div className="mt-4 text-center">
                  <p className="text-lg text-gray-800">Press Confirm to trigger the SOS manually.</p>
                  <button type="button" onClick={sendSos} className="touch-button w-full bg-danger text-white font-bold mt-4 min-h-14 text-lg">
                    Confirm SOS Alert
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
