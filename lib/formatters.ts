// frontend/lib/formatters.ts

/**
 * Format a number as Philippine Peso currency.
 * Always use this — never format PHP inline.
 */
export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

/**
 * Format as plain number with commas (for shares, counts, etc.)
 */
export const formatNumber = (value: number, decimals = 0): string =>
  new Intl.NumberFormat('en-PH', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);

/**
 * Long date: "March 20, 2026"
 */
export const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Short date: "03/20/2026"
 */
export const formatShortDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-PH');
};

/**
 * Relative time: "2 days ago", "in 3 months"
 */
export const formatRelativeTime = (
  dateStr: string | null | undefined,
): string => {
  if (!dateStr) return '—';
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const diff = (new Date(dateStr).getTime() - Date.now()) / 1000;
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
    ['second', 1],
  ];
  for (const [unit, seconds] of units) {
    if (Math.abs(diff) >= seconds) {
      return rtf.format(Math.round(diff / seconds), unit);
    }
  }
  return 'just now';
};

/**
 * Loan progress: payments made / term months → percentage
 */
export const computeLoanProgress = (paid: number, term: number): number =>
  term === 0 ? 0 : Math.min(Math.round((paid / term) * 100), 100);

/**
 * Percentage: 83.33 → "83.33%"
 */
export const formatPercent = (value: number, decimals = 2): string =>
  `${value.toFixed(decimals)}%`;

/**
 * Full name from parts
 */
export const formatFullName = (
  firstName: string,
  lastName: string,
  middleName?: string | null,
  suffix?: string | null,
): string => {
  const parts = [firstName, middleName, lastName, suffix].filter(Boolean);
  return parts.join(' ');
};

/**
 * Initials for avatar fallback
 */
export const getInitials = (name?: string | null): string => {
  if (!name || typeof name !== 'string') {
    return 'NA';
  }

  const parts = name.trim().split(' ').filter(Boolean).slice(0, 2);

  if (parts.length === 0) {
    return 'NA';
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('');
};
