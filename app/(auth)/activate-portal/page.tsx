'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  useStartMemberActivation,
  useCompleteMemberActivation,
} from '@/hooks/member/useMemberActivation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Step = 'start' | 'complete';

export default function ActivatePortalPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('start');
  const [memberId, setMemberId] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const startActivation = useStartMemberActivation();
  const completeActivation = useCompleteMemberActivation();

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const result = await startActivation.mutateAsync({
        member_id: memberId,
        email,
        date_of_birth: dateOfBirth,
      });

      setSuccessMessage(result.message);
      setStep('complete');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to start activation.',
      );
    }
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const result = await completeActivation.mutateAsync({
        member_id: memberId,
        otp,
        password,
        confirm_password: confirmPassword,
      });

      setSuccessMessage(result.message);
      router.push('/login');
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to complete activation.',
      );
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Activate Member Portal</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Use your member record details to activate your CoopCore portal
          account.
        </p>
      </div>

      {errorMessage ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      {successMessage ? (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          {successMessage}
        </div>
      ) : null}

      {step === 'start' ? (
        <form onSubmit={handleStart} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Member ID</label>
            <Input
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Date of Birth
            </label>
            <Input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={startActivation.isPending}
          >
            {startActivation.isPending
              ? 'Sending code...'
              : 'Send Activation Code'}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleComplete} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Member ID</label>
            <Input
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">OTP Code</label>
            <Input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Confirm Password
            </label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={completeActivation.isPending}
          >
            {completeActivation.isPending
              ? 'Activating...'
              : 'Activate Account'}
          </Button>
        </form>
      )}
    </div>
  );
}
