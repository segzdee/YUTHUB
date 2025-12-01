import { format, parseISO, isValid } from 'date-fns';
import { enGB } from 'date-fns/locale';

/**
 * Format date to UK format with locale
 * @param date - Date string, Date object, or timestamp
 * @param formatStr - Format string (defaults to 'd MMM yyyy')
 * @returns Formatted date string
 */
export function formatDate(
  date: string | Date | number | null | undefined,
  formatStr: string = 'd MMM yyyy'
): string {
  if (!date) return '-';

  try {
    let dateObj: Date;

    if (typeof date === 'string') {
      dateObj = parseISO(date);
    } else if (typeof date === 'number') {
      dateObj = new Date(date);
    } else {
      dateObj = date;
    }

    if (!isValid(dateObj)) {
      return '-';
    }

    return format(dateObj, formatStr, { locale: enGB });
  } catch (error) {
    console.error('Date formatting error:', error);
    return '-';
  }
}

/**
 * Format date to UK short format (dd/MM/yyyy)
 */
export function formatDateUK(date: string | Date | number | null | undefined): string {
  return formatDate(date, 'dd/MM/yyyy');
}

/**
 * Format date to UK long format (d MMMM yyyy)
 */
export function formatDateLong(date: string | Date | number | null | undefined): string {
  return formatDate(date, 'd MMMM yyyy');
}

/**
 * Format date with time (d MMM yyyy, HH:mm)
 */
export function formatDateTime(date: string | Date | number | null | undefined): string {
  return formatDate(date, 'd MMM yyyy, HH:mm');
}

/**
 * Format time only (HH:mm)
 */
export function formatTime(date: string | Date | number | null | undefined): string {
  return formatDate(date, 'HH:mm');
}

/**
 * Format relative time (Today, Yesterday, etc.)
 */
export function formatRelativeDate(date: string | Date | number | null | undefined): string {
  if (!date) return '-';

  try {
    let dateObj: Date;

    if (typeof date === 'string') {
      dateObj = parseISO(date);
    } else if (typeof date === 'number') {
      dateObj = new Date(date);
    } else {
      dateObj = date;
    }

    if (!isValid(dateObj)) {
      return '-';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dateToCheck = new Date(dateObj);
    dateToCheck.setHours(0, 0, 0, 0);

    if (dateToCheck.getTime() === today.getTime()) {
      return 'Today';
    } else if (dateToCheck.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    } else {
      return formatDate(dateObj, 'd MMM yyyy');
    }
  } catch (error) {
    return '-';
  }
}

/**
 * Calculate percentage with zero-division handling
 */
export function calculatePercentage(value: number, total: number): number {
  if (!total || total === 0) return 0;
  if (!value || value === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * Format percentage with proper zero handling
 */
export function formatPercentage(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return '0%';
  return `${Math.round(value)}%`;
}
