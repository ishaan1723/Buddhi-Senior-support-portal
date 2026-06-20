"use client";

import Link from "next/link";
import { CalendarCheck, Home, ListChecks, Phone, ShieldCheck } from "lucide-react";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/services", label: "Services", icon: ListChecks },
  { href: "/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/contacts", label: "Contacts", icon: Phone },
  { href: "/admin", label: "Admin", icon: ShieldCheck }
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t-2 border-gray-200 bg-white" aria-label="Primary">
      <div className="mx-auto grid max-w-5xl grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex min-h-16 flex-col items-center justify-center gap-1 text-sm font-semibold",
                active ? "bg-blue-50 text-trust" : "text-gray-800"
              )}
            >
              <Icon aria-hidden="true" className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
