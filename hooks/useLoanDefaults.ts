// frontend/hooks/useLoanDefaults.ts
import { useCoopSettings } from "@/hooks/useAdmin";
import type { LoanType } from "@/types/loan";

export interface LoanTypeConfig {
  rate: number;
  max_term: number;
}

const FALLBACK_DEFAULTS: Record<LoanType, LoanTypeConfig> = {
  "Multi-Purpose": { rate: 12, max_term: 36 },
  "Emergency":     { rate: 10, max_term: 12 },
  "Business":      { rate: 14, max_term: 48 },
  "Salary":        { rate:  8, max_term:  6 },
  "Housing":       { rate: 10, max_term: 60 },
  "Educational":   { rate:  8, max_term: 24 },
};

export function useLoanDefaults(): Record<LoanType, LoanTypeConfig> {
  const { data: settings } = useCoopSettings();

  if (!settings?.loan_rates) return FALLBACK_DEFAULTS;

  const merged = { ...FALLBACK_DEFAULTS };
  for (const [type, config] of Object.entries(settings.loan_rates)) {
    if (type in merged) {
      merged[type as LoanType] = {
        rate: config.rate,
        max_term: config.max_term,
      };
    }
  }
  return merged;
}