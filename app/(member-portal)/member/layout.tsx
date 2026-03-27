import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { SessionProvider } from '@/components/providers/SessionProvider';
import MemberPortalSidebar from '@/components/member-portal/MemberPortalSidebar';
import MemberPortalTopbar from '@/components/member-portal/MemberPortalTopbar';

export default async function MemberPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  if (session.role !== 'member') {
    redirect('/dashboard');
  }

  return (
    <SessionProvider session={session}>
      <div className="flex h-screen overflow-hidden bg-slate-50">
        <MemberPortalSidebar />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <MemberPortalTopbar />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </SessionProvider>
  );
}
