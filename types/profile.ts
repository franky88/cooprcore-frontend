export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: "super_admin" | "branch_manager" | "loan_officer" | "cashier" | "member";
  employee_id?: string;
  branch?: string | null;
}

export interface ProfileResponse extends Profile {}