// frontend/types/admin.ts
import type { UserRole } from './auth';

export interface SystemUser {
  id: string;
  employee_id: string;
  full_name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  branch: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
  name?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  resource: string;
  actor_id: string;
  actor_name?: string;
  resource_id?: string;
  details?: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
}

export interface LoanTypeRate {
  rate: number;
  max_term: number;
}

export interface CoopSettings {
  // General
  coop_name: string;
  address?: string;
  contact_email?: string;
  contact_phone?: string;

  // Rates
  default_loan_rate: number;
  default_savings_rate: number;
  withholding_tax_rate: number;
  penalty_rate_monthly: number;

  // Share capital
  share_par_value: number;

  // Loan rules
  max_active_loans: number;
  comaker_threshold: number;

  // Account rules
  dormancy_months: number;
  fiscal_year_start_month: number;

  // Per-type loan rates
  loan_rates?: Record<string, LoanTypeRate>;

  // Metadata
  key?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateUserPayload {
  employee_id: string;
  full_name: string;
  email: string;
  password: string;
  role: UserRole;
  branch: string;
}

export interface UpdateUserPayload {
  full_name?: string;
  email?: string;
  role?: UserRole;
  branch?: string;
  is_active?: boolean;
}

export interface UserFilters {
  page?: number;
  per_page?: number;
  search?: string;
  role?: UserRole | '';
  is_active?: boolean;
}

export interface AuditLogFilters {
  page?: number;
  per_page?: number;
  resource?: string;
  actor_id?: string;
  action?: string;
  date_from?: string;
  date_to?: string;
}
