export function ratingText(value: string | number) {
  const number = typeof value === "string" ? Number(value) : value;
  return Number.isFinite(number) ? number.toFixed(1) : "0.0";
}

export function phoneHref(phone: string) {
  return `tel:${phone.replace(/\s/g, "")}`;
}
