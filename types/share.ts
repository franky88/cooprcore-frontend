// frontend/types/share.ts

export interface ShareCapital {
  id: string;
  share_id: string;
  member_id: string;
  member_name: string;
  subscribed_shares: number;
  paid_shares: number;
  share_par_value: number;
  subscribed_amount: number;
  paid_amount: number;
  outstanding_amount: number;
  percentage_paid: number;
  date_subscribed: string;
  last_payment_date?: string;
  created_at: string;
  updated_at: string;
}

export interface SharePayment {
  id: string;
  payment_id: string;
  share_id: string;
  member_id: string;
  // shares_paid: number;
  amount_paid: number;
  balance_after: number;
  or_number: string;
  payment_date: string;
  posted_by: string;
  remarks?: string;
  created_at: string;
}

export interface ShareFilters {
  page?: number;
  per_page?: number;
  member_id?: string;
  search?: string;
}

export interface UpdateSubscriptionPayload {
  additional_shares: number;
}

export interface PostSharePaymentPayload {
  amount_paid: number;
  or_number: string;
  payment_date: string;
  remarks?: string;
}