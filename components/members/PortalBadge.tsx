'use client';

import { Badge } from '../ui/badge';

interface PortalBadgeProps {
  enabled: boolean;
}

export const PortalBadge = ({ enabled }: PortalBadgeProps) => {
  return (
    <Badge
      variant="outline"
      className={
        enabled
          ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
          : 'border-slate-200 bg-slate-50 text-slate-600'
      }
    >
      {enabled ? 'Portal Active' : 'Not Activated'}
    </Badge>
  );
};
