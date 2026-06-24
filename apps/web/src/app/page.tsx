"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CalendarCheck, ListChecks, Phone, Users, LogOut, MapPin, UserCheck } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [seniorName, setSeniorName] = useState("Member");
  const [phone, setPhone] = useState("");

  // PWA Install Prompt States
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const token = window.localStorage.getItem("buddhi_token");
    if (!token) {
      router.replace("/login");
      return;
    } else {
      const name = window.localStorage.getItem("buddhi_name");
      const phoneNum = window.localStorage.getItem("buddhi_phone");
      if (name) setSeniorName(name);
      if (phoneNum) setPhone(phoneNum);
      setLoading(false);
    }

    // Detect if app is running as PWA
    const isMinStandalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone;
    setIsStandalone(!!isMinStandalone);

    // Detect iOS devices
    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(ios);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, [router]);

  async function handleInstallApp() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  }

  function signOut() {
    window.localStorage.removeItem("buddhi_token");
    window.localStorage.removeItem("buddhi_phone");
    window.localStorage.removeItem("buddhi_name");
    router.replace("/login");
  }

  if (loading) {
    return (
      <div className="page-shell flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-trust border-t-transparent mx-auto"></div>
          <p className="mt-4 text-xl font-bold text-ink">Loading Buddhi portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      {/* PERSONALIZED GREETING HEADER */}
      <section className="premium-card bg-[#fdfaf2] border-trust border-l-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 border border-saffron px-3 py-1 text-sm font-extrabold text-saffron uppercase tracking-wider">
              <MapPin className="h-4 w-4" />
              H-West Ward, Bandra/Khar
            </span>
            <h1 className="mt-3 text-3xl sm:text-4xl font-black leading-none text-ink">
              Namaste, <span className="text-trust">{seniorName}</span>!
            </h1>
            <p className="mt-2 text-base text-gray-700 font-medium">
              Registered phone: <strong className="text-ink">{phone}</strong>
            </p>
          </div>
          <button
            onClick={signOut}
            className="btn-tactile shrink-0 bg-rose-50 border-danger text-danger hover:bg-rose-100 flex gap-2 items-center text-base min-h-12 py-2"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </section>

      {/* PWA INSTALLATION BANNER FOR ANDROID/CHROME */}
      {!isStandalone && deferredPrompt ? (
        <section className="mt-6">
          <div className="premium-card bg-amber-50 border-saffron border-l-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-saffron uppercase">📲 Install Buddhi App</h2>
              <p className="mt-1 text-base text-gray-700 font-bold">
                Add Buddhi directly to your home screen for quick, one-click access!
              </p>
            </div>
            <button
              onClick={handleInstallApp}
              className="btn-tactile bg-saffron text-white border-saffron hover:bg-amber-700 w-full md:w-auto shrink-0"
            >
              Install App Now
            </button>
          </div>
        </section>
      ) : null}

      {/* STICKY INSTALLATION GUIDE FOR IOS/SAFARI */}
      {!isStandalone && isIos ? (
        <section className="fixed bottom-20 left-4 right-4 z-40">
          <div className="premium-card bg-amber-50 border-saffron border-t-8 p-5 text-ink shadow-[6px_6px_0px_0px_rgba(17,24,39,1)]">
            <h2 className="text-xl font-black text-saffron uppercase flex items-center gap-2">
              📲 Install Buddhi on iPhone
            </h2>
            <div className="mt-2 text-sm text-gray-705 font-extrabold space-y-1.5">
              <p>1. Open this page in the <strong className="text-trust font-black">Safari</strong> app (not inside WhatsApp).</p>
              <p>2. Tap Safari's Share button <span className="inline-block border border-gray-400 bg-white px-2 py-0.5 rounded text-xs font-black text-trust">[↑]</span> at the bottom.</p>
              <p>3. Scroll down and choose <strong className="text-ink font-black">"Add to Home Screen"</strong>.</p>
            </div>
            <div className="mt-2 flex flex-col items-center">
              <span className="text-2xl animate-bounce text-saffron font-black">↓</span>
              <span className="text-xs uppercase tracking-wider text-gray-500 font-extrabold">Tap Safari Share Button Below</span>
            </div>
          </div>
        </section>
      ) : null}

      {/* DASHBOARD ACTION TILES */}
      <section className="mt-8 grid gap-5 sm:grid-cols-2" aria-label="Quick actions">
        {/* EMERGENCY SOS */}
        <a 
          href="/sos" 
          className="premium-card bg-rose-50/50 border-danger hover:bg-rose-50 flex items-center gap-4 border-l-8"
        >
          <div className="rounded-xl bg-danger p-3 text-white shadow-soft">
            <AlertTriangle aria-hidden="true" className="h-8 w-8" />
          </div>
          <span>
            <span className="block text-xl font-black text-danger">Emergency Help</span>
            <span className="mt-1 block text-base text-gray-800 font-medium">Alert family & local responders</span>
          </span>
        </a>

        {/* SERVICES MARKETPLACE */}
        <a 
          href="/services" 
          className="premium-card bg-sky-50/50 border-trust hover:bg-sky-50 flex items-center gap-4 border-l-8"
        >
          <div className="rounded-xl bg-trust p-3 text-white shadow-soft">
            <ListChecks aria-hidden="true" className="h-8 w-8" />
          </div>
          <span>
            <span className="block text-xl font-black text-trust">Find Services</span>
            <span className="mt-1 block text-base text-gray-800 font-medium">Doctors, nurses, repairs, care</span>
          </span>
        </a>

        {/* MY BOOKINGS */}
        <a 
          href="/bookings" 
          className="premium-card bg-amber-50/50 border-saffron hover:bg-amber-50 flex items-center gap-4 border-l-8"
        >
          <div className="rounded-xl bg-saffron p-3 text-white shadow-soft">
            <CalendarCheck aria-hidden="true" className="h-8 w-8" />
          </div>
          <span>
            <span className="block text-xl font-black text-saffron">My Bookings</span>
            <span className="mt-1 block text-base text-gray-800 font-medium">Track call-to-book requests</span>
          </span>
        </a>

        {/* IMPORTANT CONTACTS */}
        <a 
          href="/contacts" 
          className="premium-card bg-slate-50/50 border-ink hover:bg-slate-50 flex items-center gap-4 border-l-8"
        >
          <div className="rounded-xl bg-ink p-3 text-white shadow-soft">
            <Users aria-hidden="true" className="h-8 w-8" />
          </div>
          <span>
            <span className="block text-xl font-black text-ink">Important Contacts</span>
            <span className="mt-1 block text-base text-gray-800 font-medium">BMC, Ward, and emergency lines</span>
          </span>
        </a>
      </section>

      {/* QUICK CONCIERGE HOTLINE CARD */}
      <section className="mt-8">
        <div className="premium-card bg-emerald-50 border-leaf border-l-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-leaf p-3 text-white shrink-0 mt-1 shadow-soft">
              <Phone aria-hidden="true" className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-leaf">Need helper support?</h2>
              <p className="mt-1 text-lg text-gray-800 font-semibold">
                Speak directly with a Buddhi concierge assistant.
              </p>
              <p className="mt-1 text-base text-gray-600">
                We can log bookings, verify vendors, or answer calls for you.
              </p>
            </div>
          </div>
          <a 
            href="tel:+912212345678" 
            className="btn-tactile bg-leaf text-white hover:bg-emerald-800 text-center w-full md:w-auto shrink-0 flex items-center justify-center gap-2"
          >
            <Phone className="h-5 w-5 fill-white" />
            Call Concierge Now
          </a>
        </div>
      </section>
    </div>
  );
}
