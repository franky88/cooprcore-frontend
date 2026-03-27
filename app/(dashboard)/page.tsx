// frontend/app/(dashboard)/page.tsx
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

// Root "/" redirects to "/dashboard"
export default async function RootPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  if (session.role === 'member') {
    redirect('/member');
  }

  redirect('/dashboard');
}
