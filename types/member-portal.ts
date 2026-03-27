export interface MemberPortalAddress {
  street?: string;
  barangay?: string;
  city?: string;
  province?: string;
  zip_code?: string;
}

export interface MemberPortalProfile {
  id: string;
  member_id: string;
  membership_type?: 'Regular' | 'Associate';
  status: 'Active' | 'Inactive' | 'Suspended' | 'Deceased';
  first_name: string;
  middle_name?: string;
  last_name: string;
  suffix?: string;
  date_of_birth?: string;
  gender?: 'Male' | 'Female';
  civil_status?: string;
  nationality?: string;
  email?: string;
  phone?: string;
  address?: MemberPortalAddress;
  employer?: string;
  occupation?: string;
  monthly_income?: number;
  date_admitted?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MemberPortalLoan {
  id: string;
  loan_id: string;
  loan_type: string;
  principal: number;
  outstanding_balance: number;
  monthly_amortization?: number;
  status: string;
  date_applied?: string;
  date_released?: string;
  maturity_date?: string;
  term_months?: number;
  interest_rate?: number;
}

export interface MemberPortalSavings {
  id: string;
  account_id: string;
  product_type: string;
  status: string;
  current_balance: number;
  date_opened?: string;
}

export interface MemberPortalShares {
  id: string;
  share_id: string;
  subscribed_shares: number;
  paid_shares: number;
  share_par_value: number;
  subscribed_amount: number;
  paid_amount: number;
  outstanding_amount: number;
  percentage_paid: number;
  last_payment_date?: string | null;
}

export interface MemberPortalDashboardStats {
  total_savings_balance: number;
  active_loans_count: number;
  total_loan_balance: number;
  share_paid_amount: number;
}

export interface MemberPortalDashboard {
  member: MemberPortalProfile;
  stats: MemberPortalDashboardStats;
  loans: MemberPortalLoan[];
  savings: MemberPortalSavings[];
  shares: MemberPortalShares | null;
}

export interface ApiDataResponse<T> {
  data: T;
}
