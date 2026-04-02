export type LoanApplicationStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Approved'
  | 'Rejected';

export interface LoanApplicationCoMaker {
  member_id: string;
  name: string;
}

export interface LoanApplication {
  id: string;
  application_id: string;
  member_id: string;
  member_name: string;
  loan_type: string;
  principal: number;
  interest_rate: number;
  term_months: number;
  monthly_amortization: number;
  total_payable: number;
  total_interest: number;
  purpose: string;
  co_makers: LoanApplicationCoMaker[];
  remarks?: string;
  review_remarks?: string;
  rejected_reason?: string | null;
  status: LoanApplicationStatus;
  submitted_via: 'member_portal';
  submitted_at: string;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  approved_by?: string | null;
  approved_at?: string | null;
  converted_loan_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoanApplicationCreatePayload {
  loan_type: string;
  principal: number;
  term_months: number;
  purpose: string;
  co_makers?: LoanApplicationCoMaker[];
  remarks?: string;
}

export interface LoanApplicationReviewPayload {
  remarks?: string;
}

export interface LoanApplicationRejectPayload {
  rejected_reason: string;
  remarks?: string;
}

export interface LoanApplicationApprovePayload {
  remarks?: string;
}

export interface PaginatedResponse<T> {
  data: T;
  pagination: {
    page: number;
    per_page: number;
    total: number;
    pages: number;
  };
}

export interface ApiDataResponse<T> {
  data: T;
}
