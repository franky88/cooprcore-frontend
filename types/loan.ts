// frontend/types/loan.ts

export type LoanType =
  | "Multi-Purpose"
  | "Emergency"
  | "Business"
  | "Salary"
  | "Housing"
  | "Educational";

export type LoanStatus =
  | "Pending"
  | "Approved"
  | "Released"
  | "Current"
  | "Past Due"
  | "Closed"
  | "Rejected";

export type PaymentMethod = "Cash" | "Bank Transfer" | "Auto-debit";

export interface CoMaker {
  member_id: string;
  name: string;
  signature_url?: string;
}

export interface Collateral {
  type: string;
  description: string;
  value: number;
}

export interface Loan {
  id: string;
  loan_id: string;
  member_id: string;
  member_name: string;

  // Terms
  loan_type: LoanType;
  principal: number;
  interest_rate: number;
  term_months: number;
  monthly_amortization: number;

  // Balances
  total_payable: number;
  total_interest: number;
  outstanding_balance: number;
  total_paid: number;
  payments_made: number;

  // Status
  status: LoanStatus;
  purpose: string;
  date_applied: string;
  date_approved?: string;
  date_released?: string;
  maturity_date?: string;
  next_due_date: string;

  // Workflow
  approved_by?: string;
  approved_at?: string;
  rejected_reason?: string;

  co_makers?: CoMaker[];
  collateral?: Collateral;

  created_at: string;
  updated_at: string;
}

export interface LoanPayment {
  id: string;
  payment_id: string;
  loan_id: string;
  member_id: string;
  amount_paid: number;
  principal_portion: number;
  interest_portion: number;
  penalty_portion: number;
  balance_after: number;
  payment_date: string;
  payment_method: PaymentMethod;
  or_number: string;
  posted_by: string;
  remarks?: string;
  excess?: number;
  created_at: string;
}

export interface AmortizationPeriod {
  period: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface AmortizationSchedule {
  monthly_amortization: number;
  total_payable: number;
  total_interest: number;
  schedule: AmortizationPeriod[];
}

export interface LoanFilters {
  page?: number;
  per_page?: number;
  status?: LoanStatus | "";
  member_id?: string;
  search?: string;
}

export interface LoanApplicationPayload {
  member_id: string;
  loan_type: LoanType;
  principal: number;
  term_months: number;
  purpose: string;
  co_makers?: string[];
  collateral?: Collateral;
}

export interface PostPaymentPayload {
  amount_paid: number;
  payment_method: PaymentMethod;
  or_number: string;
  payment_date: string;
  remarks?: string;
}

export interface RejectPayload {
  reason: string;
}

export interface ReleasePayload {
  or_number: string;
  release_date: string;
}

// Loan type defaults
export const LOAN_DEFAULTS: Record<
  LoanType,
  { rate: number; max_term: number }
> = {
  "Multi-Purpose": { rate: 12, max_term: 36 },
  Emergency: { rate: 10, max_term: 12 },
  Business: { rate: 14, max_term: 48 },
  Salary: { rate: 8, max_term: 6 },
  Housing: { rate: 10, max_term: 60 },
  Educational: { rate: 8, max_term: 24 },
};