// frontend/app/(dashboard)/members/register/page.tsx
import RegisterForm from "@/components/members/RegisterForm";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Register Member" };

export default function RegisterMemberPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Link
          href="/members"
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Members
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-xs text-slate-600 font-medium">
          Register New Member
        </span>
      </div>

      <RegisterForm />
    </div>
  );
}