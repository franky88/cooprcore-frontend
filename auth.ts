// // frontend/auth.ts
// import NextAuth, { Session } from "next-auth";
// import Credentials from "next-auth/providers/credentials";
// import { z } from "zod";
// import axios from "axios";
// import type { UserRole } from "@/types/auth";
// import { API_BASE } from "@/lib/constants";

// const credentialsSchema = z.object({
//   email: z.string().email(),
//   password: z.string().min(1),
// });

// export const { handlers, signIn, signOut, auth } = NextAuth({
//   providers: [
//     Credentials({
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         const parsed = credentialsSchema.safeParse(credentials);
//         if (!parsed.success) return null;

//         try {
//           const { data } = await axios.post(`${API_BASE}/auth/login`, {
//             email: parsed.data.email,
//             password: parsed.data.password,
//           });

//           return {
//             id: data.user.id,
//             name: data.user.name,
//             email: data.user.email,
//             role: data.user.role as UserRole,
//             accessToken: data.access_token,
//             refreshToken: data.refresh_token,
//           };
//         } catch {
//           return null;
//         }
//       },
//     }),
//   ],

//   callbacks: {
//     async jwt({ token, user }) {
//       // Initial sign in
//       if (user) {
//         token.id = user.id;
//         token.role = (user as { role: UserRole }).role;
//         token.accessToken = (user as { accessToken: string }).accessToken;
//         token.refreshToken = (user as { refreshToken: string }).refreshToken;
//         token.accessTokenExpires = Date.now() + 3600 * 1000;
//         return token;
//       }

//       // Access token still valid
//       if (Date.now() < (token.accessTokenExpires as number)) {
//         return token;
//       }

//       // Access token expired — try refresh
//       try {
//         const response = await fetch(`${API_BASE}/auth/refresh`, {
//           method: "POST",
//           headers: {
//             Authorization: `Bearer ${token.refreshToken}`,
//           },
//         });

//         if (!response.ok) throw new Error("Refresh failed");

//         const data = await response.json();

//         return {
//           ...token,
//           accessToken: data.access_token,
//           accessTokenExpires: Date.now() + 3600 * 1000,
//           error: undefined,
//         };
//       } catch {
//         // Refresh token expired — force re-login
//         return { ...token, error: "RefreshTokenExpired" };
//       }
//     },

//     async session({ session, token }) {
//       session.user.id = token.id as string;
//       session.role = token.role as UserRole;
//       session.accessToken = token.accessToken as string;
//       session.refreshToken = token.refreshToken as string;
//       if (token.error) {
//         (session as Session & { error?: string }).error = token.error as string;
//       }
//       return session;
//     },
//   },

//   pages: {
//     signIn: "/login",
//     error: "/login",
//   },

//   session: { strategy: "jwt" },

//   secret: process.env.AUTH_SECRET,
// });

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import axios from 'axios';
import type { UserRole } from '@/types/auth';
import { API_BASE } from '@/lib/constants';

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type RefreshResponse = {
  access_token: string;
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'CoopCore',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        try {
          const { data } = await axios.post(`${API_BASE}/auth/login`, {
            email: parsed.data.email,
            password: parsed.data.password,
          });

          return {
            id: data.user.id as string,
            name: data.user.name as string,
            email: data.user.email as string,
            role: data.user.role as UserRole,
            accessToken: data.access_token as string,
            refreshToken: data.refresh_token as string,
          };
        } catch {
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.accessTokenExpires = Date.now() + 60 * 60 * 1000;
        token.error = undefined;
        return token;
      }

      if (
        token.accessToken &&
        token.accessTokenExpires &&
        Date.now() < token.accessTokenExpires
      ) {
        return token;
      }

      if (!token.refreshToken) {
        return { ...token, error: 'RefreshTokenExpired' };
      }

      try {
        const response = await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token.refreshToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Refresh failed');
        }

        const data: RefreshResponse = await response.json();

        return {
          ...token,
          accessToken: data.access_token,
          accessTokenExpires: Date.now() + 60 * 60 * 1000,
          error: undefined,
        };
      } catch {
        return {
          ...token,
          accessToken: undefined,
          accessTokenExpires: undefined,
          error: 'RefreshTokenExpired',
        };
      }
    },

    async session({ session, token }) {
      session.user.id = token.id ?? '';
      session.user.name = token.name ?? '';
      session.user.email = token.email ?? '';
      session.role = token.role;
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.error = token.error;
      return session;
    },

    authorized({ auth, request }) {
      const pathname = request.nextUrl.pathname;

      const isProtected =
        pathname.startsWith('/dashboard') ||
        pathname.startsWith('/members') ||
        pathname.startsWith('/loans') ||
        pathname.startsWith('/savings') ||
        pathname.startsWith('/shares') ||
        pathname.startsWith('/admin') ||
        pathname.startsWith('/member');

      if (!isProtected) return true;

      return !!auth;
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60,
  },

  secret: process.env.AUTH_SECRET,
});
