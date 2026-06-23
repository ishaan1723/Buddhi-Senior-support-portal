"use client";

import Link from "next/link";
import { PhoneCall, Menu, X, Home, Users, ShieldCheck, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    // Check authentication status on mount & route change
    setIsAuth(!!window.localStorage.getItem("buddhi_token"));
  }, [pathname]);

  function handleSignOut() {
    window.localStorage.removeItem("buddhi_token");
    window.localStorage.removeItem("buddhi_phone");
    window.localStorage.removeItem("buddhi_name");
    setIsAuth(false);
    setMenuOpen(false);
    router.replace("/login");
  }

  // Prevent background scrolling when menu drawer is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-40 border-b-2 border-gray-250 bg-paper">
      <div className="mx-auto flex min-h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          {/* Hamburger Menu Toggle for Secondary Actions */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg border-2 border-ink p-2 bg-white text-ink hover:bg-gray-150 active:scale-95 transition-transform"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          <Link href="/" className="text-2xl font-black tracking-tight text-trust" aria-label="Buddhi home">
            Buddhi <span className="text-saffron">2026</span>
          </Link>
        </div>

        <a className="touch-button bg-trust text-white hover:bg-sky-850 shadow-soft border border-trust" href="tel:+912212345678">
          <PhoneCall aria-hidden="true" className="mr-2 inline h-5 w-5 fill-white" />
          Call Concierge
        </a>
      </div>

      {/* Drawer Overlay */}
      {menuOpen && (
        <div 
          className="fixed inset-0 top-16 z-30 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150" 
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Drawer Menu Panel */}
      <div
        className={`fixed top-16 left-0 bottom-0 z-40 w-72 border-r-2 border-gray-250 bg-paper p-5 shadow-soft transition-transform duration-200 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 mb-4">
          Secondary Actions
        </h3>
        <nav className="flex flex-col gap-3">
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-3 rounded-lg border border-transparent p-3 text-lg font-bold text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <Home className="h-5 w-5 text-trust" />
            Home Dashboard
          </Link>

          <Link
            href="/contacts"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-3 rounded-lg border border-transparent p-3 text-lg font-bold text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <Users className="h-5 w-5 text-trust" />
            Configure Contacts
          </Link>

          <Link
            href="/admin"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-3 rounded-lg border border-transparent p-3 text-lg font-bold text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <ShieldCheck className="h-5 w-5 text-trust" />
            Admin Dashboard
          </Link>

          {isAuth && (
            <button
              onClick={handleSignOut}
              className="mt-6 flex w-full items-center gap-3 rounded-lg border-2 border-danger bg-rose-50 p-3 text-lg font-bold text-danger hover:bg-rose-100 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          )}
        </nav>

        <div className="absolute bottom-5 left-5 right-5 text-xs text-gray-500 border-t border-gray-200 pt-3">
          <p className="font-extrabold text-ink">Buddhi Senior Portal v1.2</p>
          <p className="mt-1">Designed for H-West Ward seniors</p>
        </div>
      </div>
    </header>
  );
}
