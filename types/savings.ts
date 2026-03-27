// frontend/types/savings.ts

export type SavingsStatus = "Active" | "Dormant" | "Closed";
export type SavingsProductType =
  | "Regular Savings"
  | "Time Deposit"
  | "Special Savings";
export type TransactionType =
  | "Deposit"
  | "Withdrawal"
  | "Interest"
  | "Fee"
  | "Adjustment";

export interface SavingsAccount {
  id: string;
  account_id: string;
  member_id: string;
  member_name: string;
  product_type: SavingsProductType;
  status: SavingsStatus;
  current_balance: number;
  interest_rate: number;
  maturity_date?: string;
  placement_amount?: number;
  date_opened: string;
  last_transaction_date?: string;
  last_interest_posting?: string;
  passbook_number?: string;
  created_at: string;
  updated_at: string;
}

export interface SavingsTransaction {
  id: string;
  transaction_id: string;
  account_id: string;
  member_id: string;
  transaction_type: TransactionType;
  amount: number;
  balance_before: number;
  balance_after: number;
  reference_number?: string;
  or_number: string;
  posted_by: string;
  transaction_date: string;
  remarks?: string;
  created_at: string;
}

export interface SavingsFilters {
  page?: number;
  per_page?: number;
  status?: SavingsStatus | "";
  product_type?: SavingsProductType | "";
  member_id?: string;
  search?: string;
}

export interface PostTransactionPayload {
  transaction_type: "Deposit" | "Withdrawal";
  amount: number;
  or_number: string;
  payment_method: "Cash" | "Check" | "Online Transfer" | "Others";
  transaction_date: string;
  remarks?: string;
}

export interface PostInterestPayload {
  account_id?: string;
  product_type?: string;
  as_of_date?: string;
}

export interface CloseAccountPayload {
  or_number: string;
  remarks?: string;
}