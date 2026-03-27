// frontend/app/page.tsx
import Link from 'next/link';
import {
  Building2,
  Users,
  CreditCard,
  PiggyBank,
  TrendingUp,
  Shield,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';

// ── Data ──────────────────────────────────────────────────────────────────────

const TICKER_ITEMS = [
  { label: 'LOAN PORTFOLIO', value: '₱2.4M', change: '+12.3%' },
  { label: 'ACTIVE MEMBERS', value: '1,247', change: '+8.1%' },
  { label: 'TOTAL DEPOSITS', value: '₱890K', change: '+5.7%' },
  { label: 'SHARE CAPITAL', value: '₱340K', change: '+3.2%' },
  { label: 'LOAN RELEASES', value: '₱180K', change: '+15.4%' },
  { label: 'INTEREST INCOME', value: '₱42K', change: '+9.8%' },
  { label: 'ACTIVE LOANS', value: '384', change: '+6.2%' },
  { label: 'NEW MEMBERS', value: '23', change: '+4.5%' },
];

const MODULES = [
  {
    code: '01',
    icon: Users,
    title: 'Member Management',
    desc: 'KYC registration, membership tiers, nominee tracking, and member portfolio summaries.',
    tag: 'CORE',
  },
  {
    code: '02',
    icon: CreditCard,
    title: 'Loan Management',
    desc: 'Actuarial amortization, multi-level approval workflows, co-maker enforcement, penalty computation.',
    tag: 'CORE',
  },
  {
    code: '03',
    icon: PiggyBank,
    title: 'Savings & Deposits',
    desc: 'Regular savings, time deposits, monthly interest posting with 20% withholding tax.',
    tag: 'CORE',
  },
  {
    code: '04',
    icon: TrendingUp,
    title: 'Share Capital',
    desc: 'Subscription tracking, installment payments, paid-up capital monitoring, dividend eligibility.',
    tag: 'CORE',
  },
  {
    code: '05',
    icon: BarChart3,
    title: 'Reports & Analytics',
    desc: 'Loan aging, portfolio charts, savings summaries, share capital listings — all exportable.',
    tag: 'ANALYTICS',
  },
  {
    code: '06',
    icon: Shield,
    title: 'Access Control',
    desc: 'Five-tier role hierarchy, JWT authentication, full audit trail on every transaction.',
    tag: 'SECURITY',
  },
];

const ROLES = [
  {
    title: 'Super Admin',
    level: 5,
    duties: 'Full system · User management · Settings',
  },
  {
    title: 'Branch Manager',
    level: 4,
    duties: 'All operations · Approvals · Reports',
  },
  {
    title: 'Loan Officer',
    level: 3,
    duties: 'Members · Loan applications · KYC',
  },
  { title: 'Cashier', level: 2, duties: 'Payments · Deposits · Withdrawals' },
];

const COMPLIANCE = [
  'Diminishing balance (actuarial) amortization',
  '3% monthly penalty on overdue loans',
  '20% withholding tax on savings interest',
  'Co-maker required above ₱30,000',
  'Maximum 2 active loans per member',
  '6-month membership before loan eligibility',
  'Soft-delete only — no data destruction',
  'OR number required on all cash transactions',
];

// ── Ticker ────────────────────────────────────────────────────────────────────

function Ticker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS]; // duplicate for seamless loop

  return (
    <div className="bg-amber-400 overflow-hidden py-2.5 border-y border-amber-500">
      <div className="flex animate-marquee whitespace-nowrap">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-3 mx-8 shrink-0">
            <span className="text-[10px] font-bold tracking-widest text-amber-900">
              {item.label}
            </span>
            <span className="text-sm font-bold text-slate-900">
              {item.value}
            </span>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
              {item.change}
            </span>
            <span className="text-amber-600 mx-2">◆</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────

function Navbar() {
  return (
    <nav className="border-b border-slate-700 bg-slate-900">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-7 w-7 rounded bg-amber-400">
            <Building2 className="h-3.5 w-3.5 text-slate-900" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-white tracking-tight uppercase">
              CoopCore
            </span>
            <span className="text-[10px] font-medium text-slate-500 border border-slate-700 px-1.5 py-0.5 rounded">
              v1.0
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {['Features', 'How It Works', 'Compliance'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(' ', '-')}`}
              className="text-xs font-medium text-slate-400 hover:text-amber-400 transition-colors tracking-wide uppercase"
            >
              {item}
            </a>
          ))}
        </div>

        <Link
          href="/login"
          className="flex items-center gap-1.5 px-4 py-2 bg-amber-400 text-slate-900 text-xs font-bold uppercase tracking-wider rounded hover:bg-amber-300 transition-colors"
        >
          Staff Login
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </nav>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="bg-slate-900 pt-16 pb-0 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
          {/* Left */}
          <div className="pb-16">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-px w-8 bg-amber-400" />
              <span className="text-[10px] font-bold text-amber-400 tracking-widest uppercase">
                Cooperative Management System
              </span>
            </div>

            <h1 className="text-6xl font-black text-white leading-none tracking-tighter mb-6">
              THE COMPLETE
              <br />
              <span className="text-amber-400">COOPERATIVE</span>
              <br />
              PLATFORM.
            </h1>

            <p className="text-slate-400 text-sm leading-relaxed max-w-md mb-8">
              CoopCore integrates member management, loan processing, savings
              operations, and share capital tracking into a single, audit-ready
              platform — built to Philippine cooperative standards.
            </p>

            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="flex items-center gap-2 px-6 py-3.5 bg-amber-400 text-slate-900 font-bold text-sm uppercase tracking-wider rounded hover:bg-amber-300 transition-colors"
              >
                Access System
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <a
                href="#features"
                className="text-xs text-slate-400 hover:text-white transition-colors underline underline-offset-4"
              >
                Explore modules →
              </a>
            </div>
          </div>

          {/* Right — terminal card */}
          <div className="relative lg:pb-0 pb-8">
            {/* Decorative grid */}
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(251,191,36,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(251,191,36,0.5) 1px, transparent 1px)',
                backgroundSize: '32px 32px',
              }}
            />

            {/* Terminal */}
            <div className="relative bg-slate-800 border border-slate-700 rounded-t-xl overflow-hidden shadow-2xl">
              {/* Terminal header */}
              <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  coopcore — dashboard
                </span>
                <div />
              </div>

              {/* Terminal content */}
              <div className="p-5 font-mono text-xs space-y-3">
                <div className="flex items-center justify-between text-slate-400 border-b border-slate-700 pb-3">
                  <span className="text-amber-400 font-bold">
                    PORTFOLIO SUMMARY
                  </span>
                  <span>as of today</span>
                </div>

                {[
                  {
                    label: 'Total Members',
                    value: '1,247',
                    status: 'ACTIVE',
                    color: 'text-emerald-400',
                  },
                  {
                    label: 'Active Loans',
                    value: '384',
                    status: 'CURRENT',
                    color: 'text-blue-400',
                  },
                  {
                    label: 'Loan Portfolio',
                    value: '₱2,400,000',
                    status: 'HEALTHY',
                    color: 'text-emerald-400',
                  },
                  {
                    label: 'Past Due',
                    value: '12',
                    status: 'ALERT',
                    color: 'text-red-400',
                  },
                  {
                    label: 'Total Deposits',
                    value: '₱890,000',
                    status: 'GROWING',
                    color: 'text-emerald-400',
                  },
                  {
                    label: 'Share Capital',
                    value: '₱340,000',
                    status: 'STABLE',
                    color: 'text-amber-400',
                  },
                  {
                    label: 'Pending Approvals',
                    value: '8',
                    status: 'ACTION',
                    color: 'text-amber-400',
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between"
                  >
                    <span className="text-slate-500">{row.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-white">{row.value}</span>
                      <span className={`text-[10px] font-bold ${row.color}`}>
                        [{row.status}]
                      </span>
                    </div>
                  </div>
                ))}

                <div className="pt-2 border-t border-slate-700 flex items-center gap-2">
                  <span className="text-emerald-400">●</span>
                  <span className="text-slate-500">System operational ·</span>
                  <span className="text-amber-400 animate-pulse">▋</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Features ──────────────────────────────────────────────────────────────────

function Features() {
  return (
    <section id="features" className="bg-slate-900 py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12 border-b border-slate-700 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-px w-8 bg-amber-400" />
            <span className="text-[10px] font-bold text-amber-400 tracking-widest uppercase">
              Modules
            </span>
          </div>
          <span className="text-[10px] text-slate-600 font-mono">
            6 INTEGRATED MODULES
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-700">
          {MODULES.map((mod) => (
            <div
              key={mod.code}
              className="bg-slate-900 p-8 hover:bg-slate-800 transition-colors group"
            >
              <div className="flex items-start justify-between mb-6">
                <span className="text-4xl font-black text-slate-800 group-hover:text-slate-700 transition-colors font-mono leading-none">
                  {mod.code}
                </span>
                <span className="text-[9px] font-bold tracking-widest text-amber-400 border border-amber-400/30 px-2 py-1 rounded">
                  {mod.tag}
                </span>
              </div>

              <mod.icon className="h-5 w-5 text-amber-400 mb-3" />

              <h3 className="text-sm font-bold text-white mb-2 tracking-tight">
                {mod.title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {mod.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── How It Works ──────────────────────────────────────────────────────────────

function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-slate-950 py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-px w-8 bg-amber-400" />
            <span className="text-[10px] font-bold text-amber-400 tracking-widest uppercase">
              How It Works
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Steps */}
          <div className="space-y-0">
            {[
              {
                n: 'I',
                title: 'Register & Onboard',
                body: 'Staff register new members through a 4-step guided wizard — capturing personal info, contact details, employment, and cooperative-specific data. A savings account and share capital record are auto-created on registration.',
              },
              {
                n: 'II',
                title: 'Apply & Approve',
                body: 'Loan officers submit applications with automatic eligibility checks — membership age, active loan count, co-maker requirements. Branch managers approve or reject with documented reasons.',
              },
              {
                n: 'III',
                title: 'Transact & Track',
                body: 'Cashiers post deposits, withdrawals, loan payments, and share capital payments — all requiring OR numbers. The system allocates payments in order: penalty → interest → principal.',
              },
              {
                n: 'IV',
                title: 'Report & Govern',
                body: 'Managers access real-time dashboards, loan aging reports, and portfolio analytics. Every action is logged to the audit trail with actor, timestamp, and resource reference.',
              },
            ].map((step, i) => (
              <div key={step.n} className="flex gap-6 pb-8 relative">
                {i < 3 && (
                  <div className="absolute left-5 top-10 bottom-0 w-px bg-slate-800" />
                )}
                <div className="flex items-center justify-center h-10 w-10 rounded border border-amber-400 shrink-0 z-10 bg-slate-950">
                  <span className="text-xs font-black text-amber-400 font-mono">
                    {step.n}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Role matrix */}
          <div>
            <div className="border border-slate-800 rounded overflow-hidden">
              <div className="bg-slate-800 px-4 py-3 border-b border-slate-700">
                <span className="text-[10px] font-bold text-slate-300 tracking-widest uppercase">
                  Staff Role Matrix
                </span>
              </div>
              <div className="divide-y divide-slate-800">
                {ROLES.map((role) => (
                  <div
                    key={role.title}
                    className="flex items-center gap-4 px-4 py-4 hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center justify-center h-8 w-8 bg-slate-800 rounded font-mono text-xs font-bold text-amber-400 shrink-0">
                      L{role.level}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white">
                        {role.title}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {role.duties}
                      </p>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-1.5 w-4 rounded-sm ${
                            i < role.level ? 'bg-amber-400' : 'bg-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Compliance strip */}
            <div
              id="compliance"
              className="mt-6 border border-slate-800 rounded overflow-hidden"
            >
              <div className="bg-slate-800 px-4 py-3 border-b border-slate-700">
                <span className="text-[10px] font-bold text-slate-300 tracking-widest uppercase">
                  Compliance Checklist
                </span>
              </div>
              <div className="p-4 grid grid-cols-1 gap-2">
                {COMPLIANCE.map((item) => (
                  <div key={item} className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-[11px] text-slate-400">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── CTA ───────────────────────────────────────────────────────────────────────

function CTA() {
  return (
    <section className="bg-amber-400 py-16 px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-8">
        <div>
          <p className="text-[10px] font-bold tracking-widest uppercase text-amber-800 mb-2">
            Ready to operate
          </p>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">
            YOUR COOPERATIVE,
            <br />
            FULLY MANAGED.
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-xs font-bold text-amber-800">
              Staff access only
            </p>
            <p className="text-[11px] text-amber-700">
              Contact your administrator for credentials
            </p>
          </div>
          <Link
            href="/login"
            className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white font-bold text-sm uppercase tracking-wider rounded hover:bg-slate-800 transition-colors"
          >
            Sign In
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 px-6 py-10">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-6 w-6 rounded bg-amber-400">
            <Building2 className="h-3 w-3 text-slate-900" />
          </div>
          <span className="text-xs font-black text-white uppercase tracking-tight">
            CoopCore
          </span>
          <span className="text-slate-700">·</span>
          <span className="text-[11px] text-slate-600">
            Philippine Multi-Purpose Credit Cooperative MIS
          </span>
        </div>

        <div className="flex items-center gap-8">
          <span className="text-[11px] text-slate-600">
            Next.js 15 · Flask 3 · MongoDB 7
          </span>
          <span className="text-slate-700">·</span>
          <span className="text-[11px] text-slate-600">
            © {new Date().getFullYear()} CoopCore
          </span>
        </div>
      </div>
    </footer>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Ticker />
      <Hero />
      <Features />
      <HowItWorks />
      <CTA />
      <Footer />
    </div>
  );
}
