/**
 * Get ISO week number for a given date
 * @param date The date to get the week number for
 * @returns The ISO week number (1-53)
 */
export function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/**
 * Get ISO week-year for a given date (the year that the ISO week belongs to)
 * @param date The date to get the week-year for
 * @returns The ISO week-year
 */
export function getISOWeekYear(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  return d.getUTCFullYear();
}

/**
 * Format a date as ISO week period string "YYYY.WW"
 * @param date The date to format
 * @returns The formatted period string (e.g., "2026.26")
 */
export function formatISOWeekPeriod(date: Date): string {
  const year = getISOWeekYear(date);
  const week = getISOWeek(date);
  return `${year}.${week.toString().padStart(2, '0')}`;
}

/**
 * Add days to a date
 * @param date The base date
 * @param days Number of days to add
 * @returns New date with days added
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Calculate the difference in days between two dates
 * @param date1 The first date
 * @param date2 The second date
 * @returns The number of days between the two dates
 */
export function differenceInDays(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.floor((date1.getTime() - date2.getTime()) / oneDay);
}

/**
 * Calculate eggs for a period based on the formula:
 * eggsPeriod = hensHoused * (standard.eggs / 100) * 7
 *
 * @param hensHoused Number of hens housed
 * @param eggsPercentage The eggs percentage (HDEP) from standards
 * @returns The calculated number of eggs (rounded to integer)
 */
export function calculateEggsPeriod(hensHoused: number, eggsPercentage: number): number {
  return Math.round(hensHoused * (eggsPercentage / 100) * 7);
}
