// frontend/lib/constants.ts
import type { UserRole } from '@/types/auth';

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  branch_manager: 'Branch Manager',
  loan_officer: 'Loan Officer',
  cashier: 'Cashier',
  member: 'Member',
};

// Higher number = more permissions
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  super_admin: 5,
  branch_manager: 4,
  loan_officer: 3,
  cashier: 2,
  member: 1,
};

export const LOAN_TYPES = [
  'Multi-Purpose',
  'Emergency',
  'Business',
  'Salary',
  'Housing',
  'Educational',
] as const;

export const MEMBER_STATUSES = [
  'Active',
  'Inactive',
  'Suspended',
  'Deceased',
] as const;

export const LOAN_STATUSES = [
  'Pending',
  'Approved',
  'Released',
  'Current',
  'Past Due',
  'Closed',
  'Rejected',
] as const;

export const SAVINGS_PRODUCT_TYPES = [
  'Regular Savings',
  'Time Deposit',
  'Special Savings',
] as const;

export const PER_PAGE_OPTIONS = [10, 20, 50, 100] as const;

export const DEFAULT_PER_PAGE = 20;

export const SHARE_PAR_VALUE = 100;

export const API_BASE = process.env.NEXT_PUBLIC_API_URL;
