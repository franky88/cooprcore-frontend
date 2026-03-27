'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Loader2, UserX } from 'lucide-react';

import { useDeactivateMember } from '@/hooks/useMembers';
import { useStore } from '@/store/useStore';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface DeactivateMemberButtonProps {
  memberId: string;
  memberName: string;
  disabled?: boolean;
}

function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { error?: string | Record<string, string[]> }
      | undefined;

    if (typeof data?.error === 'string') {
      return data.error;
    }

    if (data?.error && typeof data.error === 'object') {
      const firstEntry = Object.values(data.error)[0];
      if (Array.isArray(firstEntry) && firstEntry.length > 0) {
        return firstEntry[0];
      }
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Failed to deactivate member.';
}

export default function DeactivateMemberButton({
  memberId,
  memberName,
  disabled = false,
}: DeactivateMemberButtonProps) {
  const router = useRouter();
  const addNotification = useStore((state) => state.addNotification);
  const mutation = useDeactivateMember(memberId);
  const [open, setOpen] = useState(false);

  const handleDeactivate = async () => {
    try {
      await mutation.mutateAsync();

      addNotification({
        type: 'success',
        title: 'Member deactivated',
        message: `${memberName} (${memberId}) has been marked as inactive.`,
      });

      setOpen(false);
      router.refresh();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Deactivation failed',
        message: getApiErrorMessage(error),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || mutation.isPending}
          className="gap-1.5 text-red-600 border-red-200 hover:text-red-700 hover:bg-red-50 hover:border-red-300"
        >
          <UserX className="h-3.5 w-3.5" />
          Deactivate
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deactivate member</DialogTitle>
          <DialogDescription>
            This will set the member status to Inactive and preserve all related
            financial and audit records. This action does not delete the member.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
          <p className="font-medium text-slate-900">{memberName}</p>
          <p className="text-xs text-slate-500">{memberId}</p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>

          <Button
            onClick={handleDeactivate}
            disabled={mutation.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deactivating...
              </>
            ) : (
              'Confirm Deactivate'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
