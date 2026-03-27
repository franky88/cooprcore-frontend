import React from "react";

interface AuditLogDetailsProps {
  details: unknown;
}

function formatKey(key: string) {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPrimitive(value: unknown) {
  return (
    value === null ||
    value === undefined ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  );
}

function renderPrimitive(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return <span className="text-slate-400">—</span>;
  }

  if (typeof value === "boolean") {
    return (
      <span className="inline-flex rounded-md border px-2 text-[11px]">
        {value ? "Yes" : "No"}
      </span>
    );
  }

  return <span className="break-words text-slate-700">{String(value)}</span>;
}

function renderValue(value: unknown): React.ReactNode {
  if (isPrimitive(value)) {
    return renderPrimitive(value);
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-slate-400">—</span>;
    }

    const primitiveItems = value.every(isPrimitive);

    if (primitiveItems) {
      return (
        <div className="flex flex-wrap gap-1">
          {value.map((item, index) => (
            <span
              key={index}
              className="inline-flex rounded-md bg-slate-100 px-2 text-[11px] text-slate-700"
            >
              {item === null || item === undefined || item === ""
                ? "—"
                : String(item)}
            </span>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {value.map((item, index) => (
          <div key={index} className="rounded-md border bg-white p-1">
            <AuditLogDetails details={item} />
          </div>
        ))}
      </div>
    );
  }

  if (isPlainObject(value)) {
    const entries = Object.entries(value);

    if (entries.length === 0) {
      return <span className="text-slate-400">—</span>;
    }

    return (
      <div className="space-y-1.5">
        {entries.map(([key, val]) => (
          <div
            key={key}
            className="flex items-start gap-2 rounded-md bg-slate-50 px-2"
          >
            <span className="min-w-[110px] text-[11px] font-medium uppercase tracking-wide text-slate-500">
              {formatKey(key)}
            </span>
            <div className="flex-1 text-[12px]">{renderValue(val)}</div>
          </div>
        ))}
      </div>
    );
  }

  return <span className="break-words text-slate-700">{String(value)}</span>;
}

export default function AuditLogDetails({ details }: AuditLogDetailsProps) {
  return <div className="min-w-[220px] text-xs leading-5">{renderValue(details)}</div>;
}