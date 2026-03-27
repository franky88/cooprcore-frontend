// frontend/app/(dashboard)/admin/page.tsx
import Link from "next/link";
import {
  Users,
  Settings,
  ScrollText,
  ChevronRight,
  Shield,
  BarChart3,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const ADMIN_SECTIONS = [
  {
    href: "/admin/users",
    icon: Users,
    title: "System Users",
    description:
      "Manage staff accounts, roles, and branch assignments.",
    color: "bg-indigo-50 text-indigo-600",
  },
  {
    href: "/admin/settings",
    icon: Settings,
    title: "Cooperative Settings",
    description:
      "Configure interest rates, penalties, and system-wide rules.",
    color: "bg-violet-50 text-violet-600",
  },
  {
    href: "/admin/audit-logs",
    icon: ScrollText,
    title: "Audit Logs",
    description:
      "View all system activity and transaction history by staff.",
    color: "bg-amber-50 text-amber-600",
  },
  {
    href: "/admin/reports",
    icon: BarChart3,
    title: "Reports",
    description:
        "Members, loans, savings, and share capital reports with charts.",
    color: "bg-emerald-50 text-emerald-600",
  },
];

export default function AdminPage() {
  return (
    <div className="space-y-5 max-w-3xl">
      {/* ── Header ── */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-red-50">
          <Shield className="h-4 w-4 text-red-600" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Administration
          </h2>
          <p className="text-xs text-slate-400">
            System configuration and management
          </p>
        </div>
      </div>

      {/* ── Section cards ── */}
      <div className="grid grid-cols-1 gap-3">
        {ADMIN_SECTIONS.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="border-slate-200 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer group">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`flex items-center justify-center h-10 w-10 rounded-lg shrink-0 ${section.color}`}
                  >
                    <section.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors">
                      {section.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {section.description}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-400 transition-colors shrink-0" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}