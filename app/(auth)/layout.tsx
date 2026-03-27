// frontend/app/(auth)/layout.tsx
import { redirect } from 'next/navigation';
import { auth } from '@/auth';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (session) {
    if (session.role === 'member') {
      redirect('/member');
    }

    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      {children}
    </div>
  );
}
