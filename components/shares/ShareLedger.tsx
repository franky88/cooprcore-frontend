// frontend/components/shares/ShareLedger.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatShortDate } from "@/lib/formatters";
import { SHARE_PAR_VALUE } from "@/lib/constants";
import type { SharePayment } from "@/types/share";

interface ShareLedgerProps {
  payments: SharePayment[];
}

export default function ShareLedger({ payments }: ShareLedgerProps) {
  if (payments.length === 0) {
    return (
      <p className="text-xs text-slate-400 px-5 pb-5">
        No payments recorded yet.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-slate-50">
          <TableHead className="text-xs">Date</TableHead>
          <TableHead className="text-xs">Payment ID</TableHead>
          <TableHead className="text-xs">OR Number</TableHead>
          <TableHead className="text-xs text-right">Shares Paid</TableHead>
          <TableHead className="text-xs text-right">Amount</TableHead>
          <TableHead className="text-xs text-right">Balance</TableHead>
          <TableHead className="text-xs">Remarks</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((p) => (
          <TableRow key={p.id} className="text-xs">
            <TableCell className="text-slate-500">
              {formatShortDate(p.payment_date)}
            </TableCell>
            <TableCell className="font-mono text-slate-500">
              {p.payment_id}
            </TableCell>
            <TableCell className="font-mono text-slate-500">
              {p.or_number}
            </TableCell>
            <TableCell className="text-right font-medium text-emerald-600">
              +{p.amount_paid / SHARE_PAR_VALUE}{" "}
              <span className="text-slate-400 font-normal">
                (₱{(p.amount_paid / SHARE_PAR_VALUE) * SHARE_PAR_VALUE})
              </span>
            </TableCell>
            <TableCell className="text-right font-semibold text-slate-800">
              {formatCurrency(p.amount_paid)}
            </TableCell>
            <TableCell className="text-right text-slate-600">
              {formatCurrency(p.balance_after)}
            </TableCell>
            <TableCell className="text-slate-400 max-w-[140px] truncate">
              {p.remarks ?? "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}