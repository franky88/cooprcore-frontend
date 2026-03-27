"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";

import { useChangePassword } from "@/hooks/useChangePassword";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAddNotification } from "@/store/useStore";

const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    new_password: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .regex(/[A-Z]/, "New password must contain at least one uppercase letter")
      .regex(/[a-z]/, "New password must contain at least one lowercase letter")
      .regex(/\d/, "New password must contain at least one number")
      .regex(/[!@#$%^&*(),.?":{}|<>]/, "New password must contain at least one special character"),
    confirm_password: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "New password and confirm password do not match",
    path: ["confirm_password"],
  });

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { error?: string | Record<string, string[]> }
      | undefined;

    if (typeof data?.error === "string") {
      return data.error;
    }

    if (data?.error && typeof data.error === "object") {
      const firstEntry = Object.values(data.error)[0];
      if (Array.isArray(firstEntry) && firstEntry.length > 0) {
        return firstEntry[0];
      }
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to change password. Please try again.";
}

function PasswordField({
  id,
  label,
  placeholder,
  error,
  registration,
}: {
  id: string;
  label: string;
  placeholder: string;
  error?: string;
  registration: ReturnType<typeof useForm<ChangePasswordFormValues>>["register"];
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          autoComplete={
            id === "current_password" ? "current-password" : "new-password"
          }
          className="pr-10"
          {...registration(id as keyof ChangePasswordFormValues)}
        />
        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

export default function ChangePasswordCard() {
  const [successMessage, setSuccessMessage] = useState("");
  const mutation = useChangePassword();
  const addNotification = useAddNotification();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  const newPassword = watch("new_password");

  const passwordChecks = useMemo(
    () => [
      {
        label: "At least 8 characters",
        valid: newPassword ? newPassword.length >= 8 : false,
      },
      {
        label: "At least 1 uppercase letter",
        valid: /[A-Z]/.test(newPassword || ""),
      },
      {
        label: "At least 1 lowercase letter",
        valid: /[a-z]/.test(newPassword || ""),
      },
      {
        label: "At least 1 number",
        valid: /\d/.test(newPassword || ""),
      },
      {
        label: "At least 1 special character",
        valid: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword || ""),
      },
    ],
    [newPassword]
  );

  const onSubmit = async (values: ChangePasswordFormValues) => {
    try {
      await mutation.mutateAsync({
        current_password: values.current_password,
        new_password: values.new_password,
      });

      reset();

      addNotification({
        type: "success",
        title: "Password updated",
        message: "Your account password has been changed successfully.",
      });
    } catch (error) {
      addNotification({
        type: "error",
        title: "Password update failed",
        message: getApiErrorMessage(error),
      });
    }
  };

  const errorMessage = mutation.isError ? getApiErrorMessage(mutation.error) : "";

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-5 w-5" />
          Change Password
        </CardTitle>
        <CardDescription>
          Update your account password securely. Use a strong password that you do not reuse elsewhere.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {successMessage ? (
          <Alert>
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        ) : null}

        {errorMessage ? (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : null}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <PasswordField
            id="current_password"
            label="Current Password"
            placeholder="Enter your current password"
            error={errors.current_password?.message}
            registration={register}
          />

          <PasswordField
            id="new_password"
            label="New Password"
            placeholder="Enter your new password"
            error={errors.new_password?.message}
            registration={register}
          />

          <div className="rounded-xl border p-4">
            <p className="mb-3 text-sm font-medium">Password requirements</p>
            <div className="grid gap-2 md:grid-cols-2">
              {passwordChecks.map((check) => (
                <div key={check.label} className="flex items-center gap-2 text-sm">
                  <span
                    className={
                      check.valid ? "text-green-600 font-medium" : "text-muted-foreground"
                    }
                  >
                    {check.valid ? "✓" : "•"}
                  </span>
                  <span
                    className={check.valid ? "text-green-600" : "text-muted-foreground"}
                  >
                    {check.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <PasswordField
            id="confirm_password"
            label="Confirm New Password"
            placeholder="Re-enter your new password"
            error={errors.confirm_password?.message}
            registration={register}
          />

          <Button
            type="submit"
            disabled={mutation.isPending || isSubmitting}
            className="w-full md:w-auto"
          >
            {mutation.isPending || isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating Password...
              </>
            ) : (
              "Update Password"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}