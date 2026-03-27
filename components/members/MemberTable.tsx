// frontend/components/members/MemberTable.tsx
'use client';

import { useRouter } from 'next/navigation';
import DataTable, { type Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import Pagination from '@/components/shared/Pagination';
import { formatDate, formatFullName } from '@/lib/formatters';
import type { Member } from '@/types/member';
import type { PaginatedResponse } from '@/types/api';
import { Badge } from '../ui/badge';

const COLUMNS: Column<Member>[] = [
  {
    key: 'member_id',
    header: 'Member ID',
    className: 'w-36 font-mono',
    render: (m) => (
      <span className="text-xs font-mono text-slate-500">{m.member_id}</span>
    ),
  },
  {
    key: 'name',
    header: 'Full Name',
    render: (m) => (
      <div>
        <p className="font-medium text-slate-900">
          {formatFullName(m.first_name, m.last_name, m.middle_name)}
        </p>
        {m.suffix && <p className="text-xs text-slate-400">{m.suffix}</p>}
      </div>
    ),
  },
  {
    key: 'contact',
    header: 'Contact',
    render: (m) => (
      <div className="space-y-0.5">
        <p className="text-slate-700">{m.phone}</p>
        {m.email && (
          <p className="text-xs text-slate-400 truncate max-w-[180px]">
            {m.email}
          </p>
        )}
      </div>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    className: 'w-28',
    render: (m) => <StatusBadge status={m.status} />,
  },
  {
    key: 'portal_access',
    header: 'Portal Access',
    className: 'w-36',
    render: (member) => (
      <Badge
        variant="outline"
        className={
          member.portal_enabled
            ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
            : 'border-slate-200 bg-slate-50 text-slate-600'
        }
      >
        {member.portal_enabled ? 'Portal Active' : 'Not Activated'}
      </Badge>
    ),
  },
  {
    key: 'date_admitted',
    header: 'Date Admitted',
    className: 'w-40',
    render: (m) => (
      <span className="text-slate-500 text-xs">
        {formatDate(m.date_admitted)}
      </span>
    ),
  },
];

interface MemberTableProps {
  result: PaginatedResponse<Member> | undefined;
  isLoading: boolean;
  page: number;
  onPageChange: (page: number) => void;
}

export default function MemberTable({
  result,
  isLoading,
  page,
  onPageChange,
}: MemberTableProps) {
  const router = useRouter();

  return (
    <div className="space-y-2">
      <DataTable
        columns={COLUMNS}
        data={result?.data ?? []}
        isLoading={isLoading}
        keyExtractor={(m) => m.id}
        onRowClick={(m) => router.push(`/members/${m.member_id}`)}
        emptyMessage="No members found. Try adjusting your search."
      />
      {result && (
        <Pagination
          page={result.pagination.page}
          pages={result.pagination.pages}
          total={result.pagination.total}
          perPage={result.pagination.per_page}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
