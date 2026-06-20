import Link from "next/link";
import { PhoneCall } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b-2 border-gray-200 bg-paper">
      <div className="mx-auto flex min-h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-xl font-bold text-trust" aria-label="Buddhi home">
          Buddhi
        </Link>
        <a className="touch-button bg-trust text-white" href="tel:+912212345678">
          <PhoneCall aria-hidden="true" className="mr-2 inline h-5 w-5" />
          Support
        </a>
      </div>
    </header>
  );
}
