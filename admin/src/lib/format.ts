const dateTime = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });
const date = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });
const relative = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

export const formatDateTime = (v: string | Date | null | undefined) => (v ? dateTime.format(new Date(v)) : "—");
export const formatDate = (v: string | Date | null | undefined) => (v ? date.format(new Date(v)) : "—");

export function timeAgo(v: string | Date) {
  const seconds = Math.round((new Date(v).getTime() - Date.now()) / 1000);
  const abs = Math.abs(seconds);
  if (abs < 60) return relative.format(seconds, "second");
  if (abs < 3600) return relative.format(Math.round(seconds / 60), "minute");
  if (abs < 86400) return relative.format(Math.round(seconds / 3600), "hour");
  if (abs < 86400 * 30) return relative.format(Math.round(seconds / 86400), "day");
  return formatDate(v);
}

export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

/** Value for <input type="datetime-local"> in the browser's timezone. */
export function toLocalInput(v: string | Date | null | undefined) {
  if (!v) return "";
  const d = new Date(v);
  const pad = (x: number) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
