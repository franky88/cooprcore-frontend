// frontend/components/admin/UserForm.tsx
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { ROLE_LABELS } from "@/lib/constants";
import type { SystemUser, CreateUserPayload, UpdateUserPayload } from "@/types/admin";
import type { UserRole } from "@/types/auth";

const createSchema = z.object({
  employee_id: z.string().min(1, "Required"),
  full_name: z.string().min(2, "Required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Minimum 8 characters"),
  role: z.enum([
    "super_admin",
    "branch_manager",
    "loan_officer",
    "cashier",
    "member",
  ]),
  branch: z.string().min(1, "Required"),
});

const editSchema = z.object({
  full_name: z.string().min(2, "Required"),
  email: z.string().email("Enter a valid email"),
  role: z.enum([
    "super_admin",
    "branch_manager",
    "loan_officer",
    "cashier",
    "member",
  ]),
  branch: z.string().min(1, "Required"),
});

type CreateValues = z.infer<typeof createSchema>;
type EditValues = z.infer<typeof editSchema>;

interface UserFormProps {
  open: boolean;
  user?: SystemUser | null; // null = create mode
  onClose: () => void;
  onCreate: (payload: CreateUserPayload) => Promise<void>;
  onUpdate: (payload: UpdateUserPayload) => Promise<void>;
}

export default function UserForm({
  open,
  user,
  onClose,
  onCreate,
  onUpdate,
}: UserFormProps) {
  const [isPending, setIsPending] = useState<boolean>(false);
  const isEditMode = !!user;

  const createForm = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { role: "cashier", branch: "Main Branch" },
  });

  const editForm = useForm<EditValues>({
    resolver: zodResolver(editSchema),
  });

  // Populate edit form when user changes
  useEffect(() => {
    if (user) {
      editForm.reset({
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        branch: user.branch,
      });
    } else {
      createForm.reset({
        role: "cashier",
        branch: "Main Branch",
      });
    }
  }, [user]);

  const handleClose = () => {
    createForm.reset();
    editForm.reset();
    onClose();
  };

  const handleSubmit = async () => {
    setIsPending(true);
    try {
      if (isEditMode) {
        const valid = await editForm.trigger();
        if (!valid) return;
        await onUpdate(editForm.getValues());
      } else {
        const valid = await createForm.trigger();
        if (!valid) return;
        await onCreate(createForm.getValues());
      }
      handleClose();
    } finally {
      setIsPending(false);
    }
  };

  const roles = Object.entries(ROLE_LABELS) as [UserRole, string][];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">
            {isEditMode ? "Edit User" : "Create System User"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-1">
          {/* Create-only fields */}
          {!isEditMode && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  label="Employee ID"
                  required
                  error={createForm.formState.errors.employee_id?.message}
                >
                  <Input
                    {...createForm.register("employee_id")}
                    placeholder="EMP-001"
                    className="h-8 text-sm font-mono"
                  />
                </FormField>
                <FormField
                  label="Password"
                  required
                  error={createForm.formState.errors.password?.message}
                >
                  <Input
                    {...createForm.register("password")}
                    type="password"
                    placeholder="Min 8 chars"
                    className="h-8 text-sm"
                  />
                </FormField>
              </div>
            </>
          )}

          {/* Shared fields */}
          <FormField
            label="Full Name"
            required
            error={
              isEditMode
                ? editForm.formState.errors.full_name?.message
                : createForm.formState.errors.full_name?.message
            }
          >
            <Input
              {...(isEditMode
                ? editForm.register("full_name")
                : createForm.register("full_name"))}
              placeholder="Maria Santos"
              className="h-8 text-sm"
            />
          </FormField>

          <FormField
            label="Email"
            required
            error={
              isEditMode
                ? editForm.formState.errors.email?.message
                : createForm.formState.errors.email?.message
            }
          >
            <Input
              {...(isEditMode
                ? editForm.register("email")
                : createForm.register("email"))}
              type="email"
              placeholder="user@coopcore.ph"
              className="h-8 text-sm"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField
              label="Role"
              required
              error={
                isEditMode
                  ? editForm.formState.errors.role?.message
                  : createForm.formState.errors.role?.message
              }
            >
              <Select
                defaultValue={user?.role ?? "cashier"}
                onValueChange={(v) => {
                  if (isEditMode) {
                    editForm.setValue("role", v as UserRole);
                  } else {
                    createForm.setValue("role", v as UserRole);
                  }
                }}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField
              label="Branch"
              required
              error={
                isEditMode
                  ? editForm.formState.errors.branch?.message
                  : createForm.formState.errors.branch?.message
              }
            >
              <Input
                {...(isEditMode
                  ? editForm.register("branch")
                  : createForm.register("branch"))}
                placeholder="Main Branch"
                className="h-8 text-sm"
              />
            </FormField>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isPending}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {isPending && (
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
            )}
            {isEditMode ? "Save Changes" : "Create User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FormField({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}