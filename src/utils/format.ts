export function formatWorldlineNumber(n: number): string {
  return `WORLDLINE ${String(n).padStart(2, '0')}`;
}

/** ISO → "YYYY.MM.DD HH:mm" (로컬 시간) */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const p = (x: number) => String(x).padStart(2, '0');
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
