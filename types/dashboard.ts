// frontend/types/dashboard.ts

export interface DashboardSummary {
  as_of: string;
  members: {
    total: number;
    active: number;
  };
  loans: {
    total: number;
    active: number;
    past_due: number;
    pending_approval: number;
    total_outstanding: number;
  };
  savings: {
    total_deposits: number;
  };
  share_capital: {
    total_paid_up: number;
  };
}