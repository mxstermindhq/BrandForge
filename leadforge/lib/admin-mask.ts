/** Mask a secret for admin display — never send full values to the client. */
export function maskSecret(value: string | undefined | null): string | null {
  if (!value?.trim()) return null;
  const v = value.trim();
  if (v.length <= 8) return "••••••••";
  return `${v.slice(0, 4)}…${v.slice(-4)}`;
}
