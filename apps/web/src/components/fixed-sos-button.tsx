"use client";
import { AlertTriangle, BadgeCheck, Phone, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";

// Programmatic Audio Synth for senior-accessible warning sound indicators
function playBeep(frequency = 440, duration = 0.15) {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.value = frequency;

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.warn("AudioContext failed to beep:", e);
  }
}

export function FixedSosButton() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "counting" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(10);
  const countdownIntervalRef = useRef<number | null>(null);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        window.clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  function triggerSosFlow() {
    setError("");
    setOpen(true);
    setStatus("counting");
    setSecondsLeft(10);

    // Initial alert sound and haptic vibration
    playBeep(400, 0.35);
    if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate([300, 100, 300]);
    }

    if (countdownIntervalRef.current) {
      window.clearInterval(countdownIntervalRef.current);
    }

    let count = 10;
    countdownIntervalRef.current = window.setInterval(() => {
      count -= 1;
      setSecondsLeft(count);

      // Warning sound sonar tone: gets higher pitch as time runs out
      const sonarPitch = 480 + (10 - count) * 90;
      playBeep(sonarPitch, 0.18);

      // Pulse haptic vibration each second (supported on Android/Chrome)
      if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(150);
      }

      if (count <= 0) {
        if (countdownIntervalRef.current) {
          window.clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        void sendSos();
      }
    }, 1000);
  }

  function cancelSosFlow() {
    if (countdownIntervalRef.current) {
      window.clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    // Cancel any active vibration
    if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(0);
    }
    // Low double tone for cancellation
    playBeep(250, 0.15);
    setTimeout(() => playBeep(200, 0.25), 100);
    
    setStatus("idle");
    setOpen(false);
  }

  async function sendSos() {
    setStatus("sending");
    setError("");
    const phone = window.localStorage.getItem("buddhi_phone") || "";
    if (!phone) {
      setStatus("error");
      setError("Phone number is required. Please sign in first.");
      playBeep(180, 0.5);
      return;
    }
    try {
      await apiFetch("/api/sos/trigger", {
        method: "POST",
        body: JSON.stringify({ phone, notes: "Triggered from Buddhi web portal (10s Instant Countdown)" })
      });
      setStatus("sent");
      
      // Happy double success chime
      playBeep(780, 0.15);
      setTimeout(() => playBeep(1040, 0.35), 120);

      // Long final vibration
      if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate([500, 100, 500]);
      }
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Could not connect to server");
      // Low emergency error chime
      playBeep(180, 0.6);
    }
  }

  const savedPhone = typeof window !== "undefined" ? window.localStorage.getItem("buddhi_phone") || "" : "";
  const smsBody = `EMERGENCY! I need immediate help. Phone: ${savedPhone || "Registered Senior"}. Please contact Buddhi Support (+912212345678).`;

  return (
    <>
      {/* Floating SOS Trigger Button */}
      <button
        type="button"
        onClick={triggerSosFlow}
        className="fixed bottom-24 right-4 z-30 flex h-20 w-20 flex-col items-center justify-center rounded-full border-4 border-white bg-danger text-lg font-bold text-white shadow-soft active:scale-95 transition-transform select-none animate-bounce"
        aria-label="Trigger emergency SOS"
      >
        <span className="text-xs uppercase tracking-wider text-red-200">Tap</span>
        <span className="text-xl font-black leading-none">SOS</span>
      </button>

      {/* FULL-SCREEN SOS COUNTDOWN & FLASH OVERLAY */}
      {open ? (
        <div 
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-colors duration-300 ${
            status === "counting" ? "animate-pulse-red text-white" : "bg-black/90 text-white"
          }`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="sos-title"
        >
          <div className="w-full max-w-lg rounded-2xl border-4 border-ink bg-white p-8 text-ink shadow-[8px_8px_0px_0px_rgba(17,24,39,1)]">
            <div className="flex items-center justify-between border-b-2 border-gray-200 pb-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-10 w-10 text-danger animate-bounce" />
                <h2 id="sos-title" className="text-3xl font-black text-ink uppercase tracking-tight">
                  Emergency SOS
                </h2>
              </div>
              {status !== "counting" && status !== "sending" ? (
                <button
                  className="rounded-lg border-2 border-gray-300 p-2 hover:bg-gray-100"
                  type="button"
                  onClick={cancelSosFlow}
                  aria-label="Close"
                >
                  <X aria-hidden="true" className="h-6 w-6 text-gray-700" />
                </button>
              ) : null}
            </div>

            <div className="mt-6">
              {/* COUNTDOWN STATE */}
              {status === "counting" ? (
                <div className="text-center py-4">
                  <p className="text-2xl font-black text-danger uppercase tracking-wide">
                    Sending emergency alerts in
                  </p>
                  <div className="my-8 flex justify-center">
                    <div className="flex h-36 w-36 items-center justify-center rounded-full border-8 border-danger bg-red-50 text-7xl font-black text-danger shadow-soft animate-ping">
                      {secondsLeft}
                    </div>
                  </div>
                  <p className="text-lg text-gray-700 font-semibold mb-6">
                    Responders and family will be notified automatically.
                  </p>

                  <button
                    type="button"
                    onClick={cancelSosFlow}
                    className="touch-button w-full bg-trust text-white font-extrabold text-2xl py-5 border-4 border-ink shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] hover:translate-y-[1px] active:translate-y-[3px]"
                  >
                    STOP / CANCEL ALERT
                  </button>
                </div>
              ) : null}

              {/* SENDING STATE */}
              {status === "sending" ? (
                <div className="text-center py-8">
                  <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-danger border-t-transparent"></div>
                  <p className="mt-6 text-2xl font-black text-gray-800 animate-pulse">
                    Broadcasting alerts now...
                  </p>
                </div>
              ) : null}

              {/* SENT STATE */}
              {status === "sent" ? (
                <div className="rounded-xl bg-green-50 border-4 border-leaf p-6 text-center shadow-soft">
                  <BadgeCheck className="mx-auto h-16 w-16 text-leaf animate-bounce" />
                  <h3 className="mt-4 text-3xl font-black text-leaf tracking-tight">ALERTS DISPATCHED!</h3>
                  <p className="mt-3 text-lg text-gray-800 font-bold leading-normal">
                    Your family contacts and Buddhi team have been alerted. Keep your phone line free.
                  </p>
                  <button
                    type="button"
                    onClick={cancelSosFlow}
                    className="touch-button mt-6 w-full bg-ink text-white font-bold text-lg border-2 border-ink"
                  >
                    Close Screen
                  </button>
                </div>
              ) : null}

              {/* ERROR / OFFLINE FALLBACK STATE */}
              {status === "error" ? (
                <div className="rounded-xl bg-red-50 border-4 border-danger p-6">
                  <h3 className="text-2xl font-black text-danger">Internet Dispatch Failed</h3>
                  <p className="mt-2 text-base text-gray-800 font-semibold">{error}</p>

                  <div className="mt-6 grid gap-4">
                    {/* SMS Fallback Button */}
                    <a
                      className="touch-button flex items-center justify-center gap-3 bg-trust text-white text-center text-xl font-extrabold min-h-16 border-2 border-trust shadow-soft"
                      href={`sms:${savedPhone || "+912226422222"}?body=${encodeURIComponent(smsBody)}`}
                      onClick={cancelSosFlow}
                    >
                      <Send className="h-6 w-6 fill-white animate-pulse" />
                      Send SMS Alert (No Internet)
                    </a>
                    {/* Call 112 Backup */}
                    <a
                      className="touch-button flex items-center justify-center gap-3 bg-danger text-white text-center text-xl font-extrabold min-h-16 border-2 border-danger shadow-soft"
                      href="tel:112"
                    >
                      <Phone className="h-6 w-6 animate-bounce" />
                      Call Emergency Help (112)
                    </a>
                    <button
                      type="button"
                      onClick={cancelSosFlow}
                      className="touch-button bg-white text-ink border-2 border-gray-300 font-bold text-base mt-2"
                    >
                      Cancel / Close
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
