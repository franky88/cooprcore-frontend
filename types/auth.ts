import type { DefaultSession } from 'next-auth';

export type UserRole =
  | 'super_admin'
  | 'branch_manager'
  | 'loan_officer'
  | 'cashier'
  | 'member';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    accessToken?: string;
    refreshToken?: string;
    role?: UserRole;
    error?: string;
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    accessToken: string;
    refreshToken: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: UserRole;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    error?: string;
    name?: string | null;
    email?: string | null;
  }
}
