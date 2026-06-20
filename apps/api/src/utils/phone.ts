export function normalizePhone(phone: string) {
  const compact = phone.replace(/[^\d+]/g, "");
  if (compact.startsWith("+")) return compact;
  if (compact.length === 10) return `+91${compact}`;
  return compact;
}
