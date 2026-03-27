// frontend/components/savings/TransactionLedger.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatCurrency, formatShortDate } from "@/lib/formatters";
import type { SavingsTransaction, TransactionType } from "@/types/savings";

const TRANSACTION_COLORS: Record<TransactionType, string> = {
  Deposit: "text-emerald-600",
  Interest: "text-indigo-600",
  Adjustment: "text-blue-600",
  Withdrawal: "text-amber-600",
  Fee: "text-red-600",
};

const TRANSACTION_PREFIX: Record<TransactionType, string> = {
  Deposit: "+",
  Interest: "+",
  Adjustment: "±",
  Withdrawal: "-",
  Fee: "-",
};

interface TransactionLedgerProps {
  transactions: SavingsTransaction[];
}

export default function TransactionLedger({
  transactions,
}: TransactionLedgerProps) {
  if (transactions.length === 0) {
    return (
      <p className="text-xs text-slate-400 px-5 pb-5">
        No transactions recorded yet.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-slate-50">
          <TableHead className="text-xs">Date</TableHead>
          <TableHead className="text-xs">Type</TableHead>
          <TableHead className="text-xs">OR Number</TableHead>
          <TableHead className="text-xs text-right">Amount</TableHead>
          <TableHead className="text-xs text-right">Balance</TableHead>
          <TableHead className="text-xs">Remarks</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((txn) => (
          <TableRow key={txn.id} className="text-xs">
            <TableCell className="text-slate-500">
              {formatShortDate(txn.transaction_date)}
            </TableCell>
            <TableCell>
              <span
                className={cn(
                  "font-medium",
                  TRANSACTION_COLORS[txn.transaction_type]
                )}
              >
                {txn.transaction_type}
              </span>
            </TableCell>
            <TableCell className="font-mono text-slate-500">
              {txn.or_number}
            </TableCell>
            <TableCell
              className={cn(
                "text-right font-semibold",
                TRANSACTION_COLORS[txn.transaction_type]
              )}
            >
              {TRANSACTION_PREFIX[txn.transaction_type]}
              {formatCurrency(txn.amount)}
            </TableCell>
            <TableCell className="text-right font-medium text-slate-800">
              {formatCurrency(txn.balance_after)}
            </TableCell>
            <TableCell className="text-slate-400 max-w-[160px] truncate">
              {txn.remarks ?? "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}