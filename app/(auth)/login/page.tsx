'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, getSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types/auth';
import { useCoopSettings } from '@/hooks/useAdmin';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  // const { data, isLoading } = useCoopSettings();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const getRedirectPathByRole = (role?: UserRole) => {
    if (role === 'member') {
      return '/member';
    }

    return '/dashboard';
  };

  const onSubmit = async (values: LoginFormValues) => {
    setAuthError(null);

    const result = await signIn('credentials', {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    if (result?.error) {
      setAuthError('Invalid email or password. Please try again.');
      return;
    }

    const session = await getSession();
    const redirectPath = getRedirectPathByRole(
      session?.role as UserRole | undefined,
    );

    router.replace(redirectPath);
    router.refresh();
  };

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-indigo-600 shadow-lg shadow-indigo-200">
          <Building2 className="h-6 w-6 text-white" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Lufamco
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Cooperative Management System
          </p>
        </div>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Sign in to your account</CardTitle>
          <CardDescription className="text-xs">
            Use your portal or staff credentials to continue
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            {authError && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2.5">
                <p className="text-xs text-red-700">{authError}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                autoFocus
                placeholder="you@coopcore.ph"
                className={
                  errors.email
                    ? 'border-red-300 focus-visible:ring-red-300'
                    : ''
                }
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={cn(
                    'pr-9',
                    errors.password
                      ? 'border-red-300 focus-visible:ring-red-300'
                      : '',
                  )}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 mt-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          <div className="mt-4 space-y-2 text-center">
            <Link
              href="/activate-portal"
              className="block text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              Activate portal account
            </Link>

            <p className="text-[11px] text-slate-400">
              Members without a portal password can activate their account
              first.
            </p>
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-[11px] text-slate-400">
        Contact your system administrator if you need access.
      </p>
    </div>
  );
}
