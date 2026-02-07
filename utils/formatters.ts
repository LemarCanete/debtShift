import { format, formatDistance, isToday, isYesterday, parseISO } from 'date-fns';
import Decimal from 'decimal.js';

/**
 * Format a number as currency (USD)
 */
export function formatCurrency(
  amount: number | string | Decimal,
  options?: {
    showCents?: boolean;
    compact?: boolean;
  }
): string {
  const { showCents = true, compact = false } = options ?? {};

  let value: number;
  if (amount instanceof Decimal) {
    value = amount.toNumber();
  } else if (typeof amount === 'string') {
    value = parseFloat(amount);
  } else {
    value = amount;
  }

  if (isNaN(value)) {
    return '$0.00';
  }

  if (compact && Math.abs(value) >= 1000) {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    });
    return formatter.format(value);
  }

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  });

  return formatter.format(value);
}

/**
 * Format a number as a percentage
 */
export function formatPercent(
  value: number | string | Decimal,
  decimals: number = 1
): string {
  let numValue: number;
  if (value instanceof Decimal) {
    numValue = value.toNumber();
  } else if (typeof value === 'string') {
    numValue = parseFloat(value);
  } else {
    numValue = value;
  }

  if (isNaN(numValue)) {
    return '0%';
  }

  return `${numValue.toFixed(decimals)}%`;
}

/**
 * Format a date string or Date object
 */
export function formatDate(
  date: string | Date,
  formatStr: string = 'MMM d, yyyy'
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
}

/**
 * Format a date relative to now (e.g., "2 days ago", "in 3 days")
 */
export function formatRelativeDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;

  if (isToday(dateObj)) {
    return 'Today';
  }

  if (isYesterday(dateObj)) {
    return 'Yesterday';
  }

  return formatDistance(dateObj, new Date(), { addSuffix: true });
}

/**
 * Format a date as a short date (e.g., "Jan 15")
 */
export function formatShortDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM d');
}

/**
 * Format a month as "January 2024"
 */
export function formatMonth(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMMM yyyy');
}

/**
 * Format a day of month with ordinal (e.g., "15th")
 */
export function formatDayOrdinal(day: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const remainder = day % 100;

  const suffix =
    suffixes[(remainder - 20) % 10] ||
    suffixes[remainder] ||
    suffixes[0];

  return `${day}${suffix}`;
}

/**
 * Format a duration in minutes (e.g., "5 min", "1 hr 30 min")
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (mins === 0) {
    return `${hours} hr`;
  }

  return `${hours} hr ${mins} min`;
}

/**
 * Format a number with thousands separators
 */
export function formatNumber(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Parse a currency string to a number
 */
export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Format APR for display (e.g., "19.99% APR")
 */
export function formatAPR(apr: number | string): string {
  const value = typeof apr === 'string' ? parseFloat(apr) : apr;
  return `${value.toFixed(2)}% APR`;
}

/**
 * Format a phone number (e.g., "(555) 123-4567")
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }

  return phone;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength - 3)}...`;
}
