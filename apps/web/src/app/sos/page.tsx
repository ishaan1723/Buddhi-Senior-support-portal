"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, BadgeCheck, Phone, Send, Mic, MicOff } from "lucide-react";
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

export default function SosPage() {
  const [status, setStatus] = useState<"idle" | "counting" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(10);
  const countdownIntervalRef = useRef<number | null>(null);

  // Speech Recognition States
  const [voiceActive, setVoiceActive] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  // Check speech recognition support
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = "en-IN"; // Set to Indian English/Hindi friendly locale

        rec.onresult = (event: any) => {
          const lastIndex = event.results.length - 1;
          const resultText = event.results[lastIndex][0].transcript.toLowerCase();
          setTranscript(resultText);

          // Check for distress keywords
          const keywords = ["help", "emergency", "danger", "bachao", "save me", "buddhi"];
          const matched = keywords.some((word) => resultText.includes(word));

          if (matched) {
            triggerSosFlow();
          }
        };

        rec.onerror = (err: any) => {
          console.warn("Speech recognition error", err);
          // Restart recognition if it gets disconnected while active
          if (voiceActive) {
            try {
              recognitionRef.current.start();
            } catch (e) {}
          }
        };

        rec.onend = () => {
          if (voiceActive) {
            try {
              recognitionRef.current.start();
            } catch (e) {}
          }
        };

        recognitionRef.current = rec;
      }
    }

    return () => {
      if (countdownIntervalRef.current) {
        window.clearInterval(countdownIntervalRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, [voiceActive]);

  // Manage voice listening state
  useEffect(() => {
    if (!recognitionRef.current) return;
    if (voiceActive) {
      try {
        setTranscript("");
        recognitionRef.current.start();
      } catch (e) {
        console.error(e);
      }
    } else {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error(e);
      }
    }
  }, [voiceActive]);

  function triggerSosFlow() {
    if (status === "counting" || status === "sending" || status === "sent") return;
    
    setError("");
    setStatus("counting");
    setSecondsLeft(10);

    // Initial alert beep and vibration
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

      // Repeat haptics (supported on Android/Chrome)
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
    if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(0);
    }
    // Low double tone for cancellation
    playBeep(250, 0.15);
    setTimeout(() => playBeep(200, 0.25), 100);

    setStatus("idle");
  }

  async function sendSos() {
    setStatus("sending");
    setError("");
    const phone = window.localStorage.getItem("buddhi_phone") || "";
    if (!phone) {
      setStatus("error");
      setError("You must be logged in to send emergency alerts. Please check your connection.");
      playBeep(180, 0.5);
      return;
    }
    try {
      await apiFetch("/api/sos/trigger", {
        method: "POST",
        body: JSON.stringify({ phone, notes: "Voice/Instant trigger from Buddhi web Portal" })
      });
      setStatus("sent");

      // Happy double success chime
      playBeep(780, 0.15);
      setTimeout(() => playBeep(1040, 0.35), 120);

      if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate([500, 100, 500]);
      }
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Failed to connect to Buddhi server");
      // Low error chime
      playBeep(180, 0.6);
    }
  }

  const savedPhone = typeof window !== "undefined" ? window.localStorage.getItem("buddhi_phone") || "" : "";
  const smsBody = `EMERGENCY! I need immediate help. Phone: ${savedPhone || "Registered Senior"}. Please contact Buddhi Support (+912212345678).`;

  return (
    <div className="page-shell">
      {/* HEADER SECTION */}
      <section className="text-center mb-6">
        <h1 className="text-4xl font-black text-ink uppercase tracking-tight">Emergency SOS</h1>
        <p className="mt-2 text-lg text-gray-700 font-semibold max-w-md mx-auto">
          Tap the red button below to trigger the emergency alert. You will have 10 seconds to cancel if pressed accidentally.
        </p>
      </section>

      {/* CORE SOS INTERACTIVE AREA */}
      <section className="flex flex-col items-center justify-center py-6">
        {status === "idle" ? (
          <button
            onClick={triggerSosFlow}
            className="flex h-64 w-64 flex-col items-center justify-center rounded-full border-8 border-ink bg-danger text-white shadow-[8px_8px_0px_0px_rgba(17,24,39,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] transition-all select-none animate-pulse-red"
            aria-label="Tap to trigger immediate SOS"
          >
            <AlertTriangle className="h-16 w-16 text-white mb-2" />
            <span className="text-4xl font-black tracking-wider">SOS</span>
            <span className="text-xs uppercase font-extrabold tracking-widest text-red-200 mt-2">Tap to trigger</span>
          </button>
        ) : null}

        {/* ACTIVE COUNTDOWN SCREEN */}
        {status === "counting" ? (
          <div className="w-full max-w-md text-center bg-white border-4 border-ink p-8 rounded-2xl shadow-[6px_6px_0px_0px_rgba(17,24,39,1)] animate-pulse-red">
            <h2 className="text-3xl font-black text-white uppercase tracking-tight">ALERTING IN PROGRESS</h2>
            <div className="my-8 flex justify-center">
              <div className="flex h-36 w-36 items-center justify-center rounded-full border-8 border-ink bg-paper text-7xl font-black text-danger animate-ping">
                {secondsLeft}
              </div>
            </div>
            <p className="text-lg text-white font-black mb-6">
              Buddhi is notifying responders.
            </p>
            <button
              onClick={cancelSosFlow}
              className="touch-button w-full bg-trust text-white font-extrabold text-2xl py-5 border-4 border-ink shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] active:translate-x-[2px] active:translate-y-[2px]"
            >
              STOP / CANCEL
            </button>
          </div>
        ) : null}

        {/* SENDING LOADING STATE */}
        {status === "sending" ? (
          <div className="w-full max-w-md text-center bg-white border-4 border-ink p-8 rounded-2xl shadow-[6px_6px_0px_0px_rgba(17,24,39,1)]">
            <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-danger border-t-transparent"></div>
            <h2 className="mt-6 text-2xl font-black text-ink">Broadcasting alert message...</h2>
          </div>
        ) : null}

        {/* SENT / DISPATCHED STATE */}
        {status === "sent" ? (
          <div className="w-full max-w-md text-center bg-white border-4 border-leaf p-8 rounded-2xl shadow-[6px_6px_0px_0px_rgba(22,101,52,1)]">
            <BadgeCheck className="mx-auto h-20 w-20 text-leaf animate-bounce" />
            <h2 className="mt-4 text-3xl font-black text-leaf">ALERTS SENT!</h2>
            <p className="mt-3 text-lg text-gray-800 font-bold leading-normal">
              Your family contacts, doctor, and Buddhi team have been alerted. Keep your phone near you.
            </p>
            <button
              onClick={cancelSosFlow}
              className="touch-button mt-6 w-full bg-ink text-white font-bold text-lg border-2 border-ink"
            >
              Back to SOS Screen
            </button>
          </div>
        ) : null}

        {/* ERROR STATE */}
        {status === "error" ? (
          <div className="w-full max-w-md bg-white border-4 border-danger p-8 rounded-2xl shadow-[6px_6px_0px_0px_rgba(185,28,28,1)]">
            <h2 className="text-2xl font-black text-danger">Alert Dispatch Failed</h2>
            <p className="mt-2 text-base text-gray-700 font-semibold">{error}</p>

            <div className="mt-6 grid gap-4">
              <a
                className="touch-button flex items-center justify-center gap-3 bg-trust text-white text-xl font-black min-h-16 border-2 border-trust"
                href={`sms:${savedPhone || "+912226422222"}?body=${encodeURIComponent(smsBody)}`}
                onClick={cancelSosFlow}
              >
                Send Offline SMS Fallback
              </a>
              <a
                className="touch-button flex items-center justify-center gap-3 bg-danger text-white text-xl font-black min-h-16 border-2 border-danger"
                href="tel:112"
              >
                Call Emergency 112
              </a>
              <button
                type="button"
                onClick={cancelSosFlow}
                className="touch-button bg-white text-ink border-2 border-gray-300 font-bold text-base"
              >
                Cancel / Reset
              </button>
            </div>
          </div>
        ) : null}
      </section>

      {/* VOICE CONTROL INTERACTIVE BANNER */}
      {status === "idle" && (
        <section className="mt-8 max-w-md mx-auto">
          <div className={`premium-card border-l-8 flex flex-col items-center p-6 text-center transition-all ${
            voiceActive ? "bg-amber-50 border-saffron" : "bg-slate-50 border-gray-400"
          }`}>
            <div className="flex items-center gap-3 justify-center mb-3">
              {voiceActive ? (
                <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-saffron text-white animate-pulse">
                  <Mic className="h-5 w-5" />
                </div>
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-500">
                  <MicOff className="h-5 w-5" />
                </div>
              )}
              <h2 className="text-xl font-black text-ink">Voice Activation (Hands-Free)</h2>
            </div>

            {speechSupported ? (
              <>
                <p className="text-sm text-gray-700 font-medium mb-4 leading-snug">
                  When enabled, Buddhi will listen through your mic. Saying **"Help"**, **"Emergency"**, or **"Bachao"** will trigger the SOS countdown automatically.
                </p>
                
                <button
                  onClick={() => setVoiceActive(!voiceActive)}
                  className={`btn-tactile w-full text-base font-extrabold py-3 border-2 ${
                    voiceActive 
                      ? "bg-saffron text-white border-saffron shadow-none" 
                      : "bg-white text-ink border-ink"
                  }`}
                >
                  {voiceActive ? "🛑 Turn Voice Trigger OFF" : "🎙️ Enable Voice Trigger"}
                </button>

                {voiceActive && (
                  <div className="mt-3 text-xs bg-amber-100 border border-amber-300 px-3 py-1.5 rounded-md font-bold text-saffron animate-pulse">
                    🔴 Active & Listening. Try speaking: "Help!"
                  </div>
                )}
                {transcript && voiceActive && (
                  <p className="mt-2 text-xs italic text-gray-500 font-semibold">
                    Heard: "{transcript}"
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-danger font-extrabold leading-snug mt-2">
                ⚠️ Voice activation is not supported in this browser. Please use Chrome or Safari on mobile.
              </p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
