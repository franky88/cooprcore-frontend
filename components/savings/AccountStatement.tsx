"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { formatCurrency, formatDate, formatPercent } from "@/lib/formatters";
import { useCoopSettings } from "@/hooks/useAdmin";

// ── Types (align with your existing types/savings.ts) ────────────────────────

interface SavingsAccount {
  account_id: string;
  member_id: string;
  member_name: string;
  product_type: string;
  status: string;
  current_balance: number;
  interest_rate: number;
  date_opened?: string | null;
  last_transaction_date?: string | null;
  last_interest_posting?: string | null;
  passbook_number?: string | null;
  maturity_date?: string | null;
}

interface Transaction {
  id: string;
  transaction_date: string;
  transaction_type: string;
  or_number: string;
  amount: number;
  balance_after: number;
  remarks?: string;
}

interface AccountStatementProps {
  account: SavingsAccount;
  transactions: Transaction[];
}

// ── Helper ────────────────────────────────────────────────────────────────────

function txnColor(type: string) {
  if (type === "Deposit" || type === "Interest") return "#16a34a";
  if (type === "Withdrawal") return "#dc2626";
  return "#64748b";
}

function txnPrefix(type: string) {
  if (type === "Deposit" || type === "Interest") return "+";
  if (type === "Withdrawal") return "-";
  return "";
}

// ── Print trigger ─────────────────────────────────────────────────────────────

function printElement(id: string) {
  const el = document.getElementById(id);
  if (!el) return;

  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) return;

  win.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Account Statement – ${id}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Georgia', serif; background: #fff; color: #1e293b; }
          @media print {
            @page { size: A4 portrait; margin: 18mm 16mm; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>${el.outerHTML}</body>
    </html>
  `);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); win.close(); }, 400);
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AccountStatement({
  account,
  transactions,
}: AccountStatementProps) {
  const statementId = `stmt-${account.account_id}`;
  const printedAt = new Date().toLocaleString("en-PH", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
  const {data: settings, isLoading} = useCoopSettings()

  return (
    <>
      {/* ── Trigger button — rendered in page, not in print area ── */}
      <Button
        size="sm"
        variant="outline"
        className="gap-1.5 border-slate-200 text-slate-600 hover:bg-slate-50"
        onClick={() => printElement(statementId)}
      >
        <FileDown className="h-3.5 w-3.5" />
        Download Statement
      </Button>

      {/* ── Hidden printable statement ── */}
      <div style={{ display: "none" }}>
        <div
          id={statementId}
          style={{
            width: "100%",
            maxWidth: "720px",
            margin: "0 auto",
            fontFamily: "'Robot', sans-serif",
            color: "#1e293b",
            fontSize: "12px",
            lineHeight: "1.6",
          }}
        >
          {/* Header */}
          <div
            style={{
              borderBottom: "2px solid #1e293b",
              paddingBottom: "14px",
              marginBottom: "20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <div>
              <div style={{ fontSize: "22px", fontWeight: "bold", letterSpacing: "-0.5px" }}>
                {settings?.coop_name}
              </div>
              <div style={{ fontSize: "10px", color: "#64748b", marginTop: "2px" }}>
                Savings Account Statement
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "10px", color: "#64748b" }}>Printed on</div>
              <div style={{ fontSize: "11px", fontWeight: "600" }}>{printedAt}</div>
            </div>
          </div>

          {/* Account Info Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
              marginBottom: "24px",
            }}
          >
            {/* Left: Member & Account */}
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                padding: "14px 16px",
              }}
            >
              <div style={{ fontSize: "9px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "10px" }}>
                Account Holder
              </div>
              <InfoRow label="Name" value={account.member_name} />
              <InfoRow label="Member ID" value={account.member_id} />
              <InfoRow label="Account No." value={account.account_id} bold />
              <InfoRow label="Product" value={account.product_type} />
              <InfoRow label="Status" value={account.status} />
              {account.passbook_number && (
                <InfoRow label="Passbook No." value={account.passbook_number} />
              )}
            </div>

            {/* Right: Balance & Dates */}
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                padding: "14px 16px",
              }}
            >
              <div style={{ fontSize: "9px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "10px" }}>
                Balance & Terms
              </div>
              {/* Balance highlight */}
              <div style={{ marginBottom: "10px" }}>
                <div style={{ fontSize: "9px", color: "#64748b" }}>Current Balance</div>
                <div style={{ fontSize: "20px", fontWeight: "bold", color: "#4f46e5" }}>
                  {formatCurrency(account.current_balance)}
                </div>
              </div>
              <InfoRow label="Interest Rate" value={`${formatPercent(account.interest_rate)} p.a.`} />
              <InfoRow label="Date Opened" value={formatDate(account.date_opened)} />
              <InfoRow label="Last Transaction" value={formatDate(account.last_transaction_date)} />
              <InfoRow label="Last Interest" value={formatDate(account.last_interest_posting)} />
              {account.maturity_date && (
                <InfoRow label="Maturity Date" value={formatDate(account.maturity_date)} />
              )}
            </div>
          </div>

          {/* Transaction Ledger */}
          <div style={{ marginBottom: "24px" }}>
            <div
              style={{
                fontSize: "9px",
                fontWeight: "700",
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                marginBottom: "10px",
              }}
            >
              Transaction Ledger ({transactions.length} record{transactions.length !== 1 ? "s" : ""})
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
              <thead>
                <tr
                  style={{
                    background: "#1e293b",
                    color: "#fff",
                  }}
                >
                  {["Date", "Type", "OR Number", "Amount", "Balance", "Remarks"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "7px 10px",
                        textAlign: h === "Amount" || h === "Balance" ? "right" : "left",
                        fontWeight: "600",
                        fontSize: "10px",
                        letterSpacing: "0.3px",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: "16px 10px", textAlign: "center", color: "#94a3b8" }}>
                      No transactions found.
                    </td>
                  </tr>
                ) : (
                  transactions.map((txn, i) => (
                    <tr
                      key={txn.id}
                      style={{
                        background: i % 2 === 0 ? "#ffffff" : "#f8fafc",
                        borderBottom: "1px solid #e2e8f0",
                      }}
                    >
                      <td style={{ padding: "6px 10px", whiteSpace: "nowrap" }}>
                        {new Date(txn.transaction_date).toLocaleDateString("en-PH", {
                          year: "numeric", month: "short", day: "numeric",
                        })}
                      </td>
                      <td style={{ padding: "6px 10px" }}>
                        <span
                          style={{
                            color: txnColor(txn.transaction_type),
                            fontWeight: "600",
                          }}
                        >
                          {txn.transaction_type}
                        </span>
                      </td>
                      <td style={{ padding: "6px 10px", fontFamily: "monospace", fontSize: "10px", color: "#64748b" }}>
                        {txn.or_number}
                      </td>
                      <td
                        style={{
                          padding: "6px 10px",
                          textAlign: "right",
                          fontWeight: "600",
                          color: txnColor(txn.transaction_type),
                          whiteSpace: "nowrap",
                        }}
                      >
                        {txnPrefix(txn.transaction_type)}{formatCurrency(txn.amount)}
                      </td>
                      <td style={{ padding: "6px 10px", textAlign: "right", whiteSpace: "nowrap" }}>
                        {formatCurrency(txn.balance_after)}
                      </td>
                      <td style={{ padding: "6px 10px", color: "#64748b", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {txn.remarks || "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div
            style={{
              borderTop: "1px solid #e2e8f0",
              paddingTop: "12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              color: "#94a3b8",
              fontSize: "9px",
            }}
          >
            <div>This statement is system-generated and does not require a signature.</div>
            <div>{account.account_id} · {printedAt}</div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── InfoRow sub-component ─────────────────────────────────────────────────────

function InfoRow({
  label,
  value,
  bold,
}: {
  label: string;
  value?: string | null;
  bold?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: "8px",
        marginBottom: "4px",
        fontSize: "11px",
      }}
    >
      <span style={{ color: "#64748b", flexShrink: 0 }}>{label}</span>
      <span
        style={{
          fontWeight: bold ? "700" : "500",
          color: "#1e293b",
          textAlign: "right",
        }}
      >
        {value ?? "—"}
      </span>
    </div>
  );
}