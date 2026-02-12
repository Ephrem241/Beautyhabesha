/** Build Telegram URL from username (with or without @). */
export function buildTelegramUrl(username: string): string {
  const s = username.replace(/^@/, "").trim();
  if (!s) return "";
  return /^https?:\/\//i.test(s) ? s : `https://t.me/${encodeURIComponent(s)}`;
}

/** Build WhatsApp URL from phone number. Digits only for wa.me. */
export function buildWhatsAppUrl(number: string): string {
  const digits = number.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : "";
}

/** Build Telegram URL with pre-filled message. */
export function buildTelegramUrlWithText(handle: string, text: string): string {
  const base = buildTelegramUrl(handle);
  if (!base) return "";
  const params = new URLSearchParams();
  if (text.trim()) params.set("text", text.trim());
  return params.toString() ? `${base}?${params.toString()}` : base;
}

/** Build WhatsApp URL with pre-filled message. */
export function buildWhatsAppUrlWithText(number: string, text: string): string {
  const base = buildWhatsAppUrl(number);
  if (!base) return "";
  const params = new URLSearchParams();
  if (text.trim()) params.set("text", text.trim());
  return params.toString() ? `${base}?${params.toString()}` : base;
}
