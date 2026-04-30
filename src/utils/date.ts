/**
 * Formats a MySQL DATE value to a YYYY-MM-DD string using local date methods.
 *
 * Using local methods (getFullYear/getMonth/getDate) instead of toISOString()
 * prevents the off-by-one day issue caused by timezone offsets: MySQL DATE columns
 * arrive as midnight in the server's local timezone, and converting to UTC first
 * can shift the date back by one day.
 */
export function formatLocalDate(date: Date | string | null | undefined): string | null {
  if (date == null) return null;
  const d = new Date(date as string | Date);
  if (isNaN(d.getTime())) return null;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
