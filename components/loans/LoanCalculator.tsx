// frontend/components/loans/LoanCalculator.tsx
"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { useLoanDefaults } from "@/hooks/useLoanDefaults";
import type { LoanType, AmortizationPeriod } from "@/types/loan";
import { Calculator } from "lucide-react";

function computeSchedule(
  principal: number,
  annualRate: number,
  termMonths: number
): {
  monthlyAmortization: number;
  totalPayable: number;
  totalInterest: number;
  schedule: AmortizationPeriod[];
} {
  if (!principal || !annualRate || !termMonths) {
    return {
      monthlyAmortization: 0,
      totalPayable: 0,
      totalInterest: 0,
      schedule: [],
    };
  }

  const monthlyRate = annualRate / 100 / 12;
  const monthly =
    monthlyRate === 0
      ? principal / termMonths
      : (principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths))) /
        (Math.pow(1 + monthlyRate, termMonths) - 1);

  const totalPayable = monthly * termMonths;
  const totalInterest = totalPayable - principal;

  let balance = principal;
  const schedule: AmortizationPeriod[] = [];

  for (let i = 1; i <= termMonths; i++) {
    const interest = balance * monthlyRate;
    const principalPortion = monthly - interest;
    balance -= principalPortion;
    schedule.push({
      period: i,
      payment: Math.round(monthly * 100) / 100,
      principal: Math.round(principalPortion * 100) / 100,
      interest: Math.round(interest * 100) / 100,
      balance: Math.round(Math.max(balance, 0) * 100) / 100,
    });
  }

  return {
    monthlyAmortization: Math.round(monthly * 100) / 100,
    totalPayable: Math.round(totalPayable * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    schedule,
  };
}

interface LoanCalculatorProps {
  value?: {
    principal: number;
    rate: number;
    term: number;
    loanType: LoanType;
  };
  onChange?: (values: {
    principal: number;
    rate: number;
    term: number;
    loanType: LoanType;
  }) => void;
  showSchedule?: boolean;
}

export default function LoanCalculator({
  value,
  onChange,
  showSchedule = true,
}: LoanCalculatorProps) {
  const loanDefaults = useLoanDefaults(); // ← reads from settings
  const isControlled = !!value;

  const [localLoanType, setLocalLoanType] =
    useState<LoanType>("Multi-Purpose");
  const [localPrincipal, setLocalPrincipal] = useState<number>(0);
  const [localTerm, setLocalTerm] = useState<number>(12);

  const loanType = isControlled ? value.loanType : localLoanType;
  const principal = isControlled ? value.principal : localPrincipal;
  const rate = isControlled
    ? value.rate
    : (loanDefaults[localLoanType]?.rate ?? 12);
  const term = isControlled ? value.term : localTerm;
  const maxTerm = loanDefaults[loanType]?.max_term ?? 36;

  const result = useMemo(
    () => computeSchedule(principal, rate, term),
    [principal, rate, term]
  );

  const handleTypeChange = (type: LoanType) => {
    const defaults = loanDefaults[type];
    if (isControlled && onChange) {
      onChange({
        loanType: type,
        principal,
        rate: defaults?.rate ?? 12,
        term: Math.min(term, defaults?.max_term ?? 36),
      });
    } else {
      setLocalLoanType(type);
      setLocalTerm((t) => Math.min(t, defaults?.max_term ?? 36));
    }
  };

  const [showFullSchedule, setShowFullSchedule] = useState<boolean>(false);
  const visibleSchedule = showFullSchedule
    ? result.schedule
    : result.schedule.slice(0, 6);

  return (
    <div className="space-y-4">
      {/* ── Standalone inputs (uncontrolled mode) ── */}
      {!isControlled && (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3 pt-4 px-5">
            <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Calculator className="h-3.5 w-3.5 text-slate-400" />
              Loan Calculator
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label className="text-xs font-medium">Loan Type</Label>
                <Select
                  value={loanType}
                  onValueChange={(v) => handleTypeChange(v as LoanType)}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(loanDefaults).map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">
                  Principal Amount (₱)
                </Label>
                <Input
                  type="number"
                  value={localPrincipal || ""}
                  onChange={(e) =>
                    setLocalPrincipal(parseFloat(e.target.value) || 0)
                  }
                  placeholder="50000"
                  className="h-8 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">
                  Term (months, max {maxTerm})
                </Label>
                <Input
                  type="number"
                  value={localTerm || ""}
                  onChange={(e) => {
                    const v = Math.min(
                      parseInt(e.target.value) || 1,
                      maxTerm
                    );
                    setLocalTerm(v);
                  }}
                  min={1}
                  max={maxTerm}
                  className="h-8 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">
                  Interest Rate (% p.a.)
                </Label>
                <Input
                  value={`${rate}%`}
                  readOnly
                  className="h-8 text-sm bg-slate-50"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Summary ── */}
      {result.monthlyAmortization > 0 && (
        <>
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: "Monthly Payment",
                value: formatCurrency(result.monthlyAmortization),
                highlight: true,
              },
              {
                label: "Total Payable",
                value: formatCurrency(result.totalPayable),
              },
              {
                label: "Total Interest",
                value: formatCurrency(result.totalInterest),
              },
            ].map((item) => (
              <div
                key={item.label}
                className={`rounded-lg p-3 text-center ${
                  item.highlight
                    ? "bg-indigo-50 ring-1 ring-indigo-200"
                    : "bg-slate-50"
                }`}
              >
                <p
                  className={`text-base font-bold ${
                    item.highlight ? "text-indigo-700" : "text-slate-800"
                  }`}
                >
                  {item.value}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {item.label}
                </p>
              </div>
            ))}
          </div>

          {/* ── Amortization schedule ── */}
          {showSchedule && (
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="text-xs w-16">Period</TableHead>
                    <TableHead className="text-xs text-right">Payment</TableHead>
                    <TableHead className="text-xs text-right">Principal</TableHead>
                    <TableHead className="text-xs text-right">Interest</TableHead>
                    <TableHead className="text-xs text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleSchedule.map((row) => (
                    <TableRow key={row.period} className="text-xs">
                      <TableCell className="text-slate-500">
                        {row.period}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(row.payment)}
                      </TableCell>
                      <TableCell className="text-right text-slate-600">
                        {formatCurrency(row.principal)}
                      </TableCell>
                      <TableCell className="text-right text-slate-600">
                        {formatCurrency(row.interest)}
                      </TableCell>
                      <TableCell className="text-right text-slate-700">
                        {formatCurrency(row.balance)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {result.schedule.length > 6 && (
                <button
                  onClick={() => setShowFullSchedule((v) => !v)}
                  className="w-full py-2 text-xs text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition-colors border-t border-slate-200"
                >
                  {showFullSchedule
                    ? "Show less"
                    : `Show all ${result.schedule.length} periods`}
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}