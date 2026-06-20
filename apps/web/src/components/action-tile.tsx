import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export function ActionTile({
  href,
  label,
  detail,
  icon: Icon,
  tone = "trust"
}: {
  href: string;
  label: string;
  detail: string;
  icon: LucideIcon;
  tone?: "trust" | "danger" | "leaf" | "saffron";
}) {
  const colors = {
    trust: "border-trust text-trust",
    danger: "border-danger text-danger",
    leaf: "border-leaf text-leaf",
    saffron: "border-saffron text-saffron"
  };

  return (
    <Link href={href} className={`panel flex min-h-32 items-center gap-4 border-l-8 ${colors[tone]}`}>
      <Icon aria-hidden="true" className="h-9 w-9 shrink-0" />
      <span>
        <span className="block text-xl font-bold text-ink">{label}</span>
        <span className="mt-1 block text-base text-gray-700">{detail}</span>
      </span>
    </Link>
  );
}
