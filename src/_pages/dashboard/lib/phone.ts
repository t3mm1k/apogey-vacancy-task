export function normalizePhoneDigits(input: string): string {
  let d = input.replace(/\D/g, "");
  if (d.startsWith("8") && d.length >= 11) d = `7${d.slice(1)}`;
  if (d.length === 10 && d.startsWith("9")) d = `7${d}`;
  if (d.startsWith("7")) return d.slice(0, 11);
  return d.slice(0, 11);
}

export function formatPhonePretty(digits: string): string {
  const d = normalizePhoneDigits(digits);
  if (d.length === 0) return "";

  const national = d.startsWith("7") ? d.slice(1) : d;
  const b = national.slice(0, 10);
  if (b.length === 0) return "+ 7 ";

  const g1 = b.slice(0, 3);
  if (b.length <= 3) return `+ 7 (${g1}`;

  const g2 = b.slice(3, 6);
  let s = `+ 7 (${g1}) ${g2}`;
  if (b.length <= 6) return s;

  const g3 = b.slice(6, 8);
  s += `–${g3}`;
  if (b.length <= 8) return s;

  const g4 = b.slice(8, 10);
  s += `–${g4}`;
  return s;
}

export function phoneLooksValid(digits: string): boolean {
  const n = normalizePhoneDigits(digits);
  return n.length === 11 && n.startsWith("7");
}

export function formatMmSs(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
