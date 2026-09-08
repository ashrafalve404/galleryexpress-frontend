export function isInternalEmail(email?: string | null): boolean {
  if (!email) return true;
  const lower = email.toLowerCase().trim();
  return (
    lower.includes('.internal') ||
    lower.includes('@ticketdorkar.xyz') ||
    lower.includes('@galleryexpress.internal')
  );
}

export function formatDisplayEmail(email?: string | null, fallback = '—'): string {
  if (!email || isInternalEmail(email)) return fallback;
  return email;
}
