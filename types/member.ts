import { z } from 'zod';

export type MemberStatus = 'Active' | 'Inactive' | 'Suspended' | 'Deceased';
export type MembershipType = 'Regular' | 'Associate';
export type Gender = 'Male' | 'Female';
export type CivilStatus =
  | 'Single'
  | 'Married'
  | 'Widowed'
  | 'Separated'
  | 'Annulled';

export type IdType =
  | 'SSS'
  | 'GSIS'
  | 'PhilHealth'
  | 'Pag-IBIG'
  | 'TIN'
  | 'Passport'
  | "Driver's License"
  | "Voter's ID"
  | 'PRC ID'
  | 'National ID';

export interface Address {
  street: string;
  barangay: string;
  city: string;
  province: string;
  zip_code: string;
}

export interface Nominee {
  name: string;
  relationship: string;
  phone: string;
}

export interface Member {
  id: string;
  member_id: string;
  membership_type: MembershipType;
  status: MemberStatus;
  first_name: string;
  middle_name?: string;
  last_name: string;
  suffix?: string;
  date_of_birth: string;
  gender: Gender;
  civil_status: CivilStatus;
  nationality: string;
  tin?: string | null;
  email?: string | null;
  phone: string;
  address: Address;
  employer?: string;
  occupation?: string;
  monthly_income?: number;
  date_admitted: string;
  admitting_officer?: string;
  nominee: Nominee;
  id_type: IdType;
  id_number: string;
  photo_url?: string | null;
  signature_url?: string | null;
  portal_enabled?: boolean;
  portal_activated_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MemberFilters {
  page?: number;
  per_page?: number;
  status?: MemberStatus | '';
  membership_type?: MembershipType | '';
  search?: string;
}

export interface MemberSummary {
  member: Member;
  loans: Array<{
    id: string;
    loan_id: string;
    loan_type: string;
    outstanding_balance: number;
    status: string;
  }>;
  savings: Array<{
    id: string;
    account_id: string;
    product_type: string;
    current_balance: number;
  }>;
  shares: {
    id: string;
    share_id: string;
    paid_shares: number;
    paid_amount: number;
    subscribed_shares: number;
    subscribed_amount: number;
    percentage_paid: number;
  } | null;
}

export interface MemberPersonalStep {
  first_name: string;
  middle_name?: string;
  last_name: string;
  suffix?: string;
  date_of_birth: string;
  gender: Gender;
  civil_status: CivilStatus;
  nationality: string;
  tin?: string;
}

export interface MemberContactStep {
  email?: string;
  phone: string;
  address: Address;
}

export interface MemberEmploymentStep {
  employer?: string;
  occupation?: string;
  monthly_income?: number;
}

export interface MemberCoopStep {
  membership_type: MembershipType;
  id_type: IdType;
  id_number: string;
  nominee: Nominee;
}

export type MemberRegisterPayload = MemberPersonalStep &
  MemberContactStep &
  MemberEmploymentStep &
  MemberCoopStep;

export type UpdateMemberPayload = Partial<MemberRegisterPayload> & {
  email?: string | null;
  tin?: string | null;
  status?: MemberStatus;
  photo_url?: string | null;
  signature_url?: string | null;
};

export const memberFormSchema = z.object({
  first_name: z.string().min(1).max(50),
  middle_name: z.string().max(50).optional().or(z.literal('')),
  last_name: z.string().min(1).max(50),
  suffix: z.string().max(10).optional().or(z.literal('')),
  gender: z.enum(['Male', 'Female']),
  civil_status: z.enum([
    'Single',
    'Married',
    'Widowed',
    'Separated',
    'Annulled',
  ]),
  nationality: z.string().max(50),
  tin: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((value) => !value || /^\d{3}-\d{3}-\d{3}-\d{3}$/.test(value), {
      message: 'TIN must be in NNN-NNN-NNN-NNN format',
    }),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().regex(/^(09\d{9}|\+639\d{9})$/, 'Invalid phone format'),
  employer: z.string().max(150).optional().or(z.literal('')),
  occupation: z.string().max(100).optional().or(z.literal('')),
  monthly_income: z.coerce.number().min(0),
  membership_type: z.enum(['Regular', 'Associate']),
  status: z.enum(['Active', 'Inactive', 'Suspended', 'Deceased']),
  id_type: z.enum([
    'SSS',
    'GSIS',
    'PhilHealth',
    'Pag-IBIG',
    'TIN',
    'Passport',
    "Driver's License",
    "Voter's ID",
    'PRC ID',
    'National ID',
  ]),
  id_number: z.string().min(3).max(30),
  address: z.object({
    street: z.string().min(2).max(200),
    barangay: z.string().min(2).max(100),
    city: z.string().min(2).max(100),
    province: z.string().min(2).max(100),
    zip_code: z.string().regex(/^\d{4}$/, 'Zip code must be 4 digits'),
  }),
  nominee: z.object({
    name: z.string().min(2).max(100),
    relationship: z.string().min(2).max(50),
    phone: z.string().regex(/^(09\d{9}|\+639\d{9})$/, 'Invalid phone format'),
  }),
});

export type MemberFormValues = z.infer<typeof memberFormSchema>;
