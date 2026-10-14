export function daysAgo(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  d.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return Math.round((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
}
