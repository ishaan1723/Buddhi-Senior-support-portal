"use client";

import Link from "next/link";
import { AlertTriangle, CalendarCheck, Phone } from "lucide-react";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const items = [
  { href: "/sos", label: "Emergency", icon: AlertTriangle },
  { href: "/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/services", label: "Support", icon: Phone }
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t-2 border-gray-200 bg-white" aria-label="Primary">
      <div className="mx-auto grid max-w-5xl grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex min-h-16 flex-col items-center justify-center gap-1 text-sm font-semibold transition-colors duration-150",
                active ? "bg-amber-50 text-trust border-t-4 border-saffron" : "text-gray-800"
              )}
            >
              <Icon aria-hidden="true" className={clsx("h-6 w-6", active ? "text-trust" : "text-gray-800")} />
              <span className={clsx("text-base font-extrabold", active ? "text-trust" : "text-gray-850")}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
