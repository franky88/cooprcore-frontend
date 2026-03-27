// frontend/types/reports.ts

export interface MembersReport {
  total: number;
  status_counts: Record<string, number>;
  members: Array<{
    member_id: string;
    first_name: string;
    last_name: string;
    membership_type: string;
    status: string;
    phone?: string;
    email?: string;
    date_admitted: string;
    monthly_income?: number;
  }>;
}

export interface LoansReport {
  total_loans: number;
  total_portfolio_outstanding: number;
  summary_by_status: Record<
    string,
    {
      count: number;
      total_outstanding: number;
      total_principal: number;
    }
  >;
  loans: Array<{
    loan_id: string;
    member_id: string;
    member_name: string;
    loan_type: string;
    principal: number;
    outstanding_balance: number;
    monthly_amortization: number;
    status: string;
    date_released?: string;
    maturity_date?: string;
    payments_made: number;
    term_months: number;
    days_overdue: number;
  }>;
}

export interface SavingsReport {
  total_accounts: number;
  total_deposits: number;
  summary_by_product: Record<
    string,
    {
      count: number;
      total_balance: number;
    }
  >;
  accounts: Array<{
    account_id: string;
    member_id: string;
    member_name: string;
    product_type: string;
    status: string;
    current_balance: number;
    interest_rate: number;
    date_opened: string;
    last_transaction_date?: string;
  }>;
}

export interface SharesReport {
  total_members: number;
  members_with_paid_shares: number;
  total_subscribed_amount: number;
  total_paid_amount: number;
  total_outstanding_amount: number;
  records: Array<{
    share_id: string;
    member_id: string;
    member_name: string;
    subscribed_shares: number;
    paid_shares: number;
    subscribed_amount: number;
    paid_amount: number;
    outstanding_amount: number;
    percentage_paid: number;
    last_payment_date?: string;
  }>;
}