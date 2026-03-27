// frontend/components/members/RegisterForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateMember } from "@/hooks/useMembers";
import { useAddNotification } from "@/store/useStore";
import { extractApiError } from "@/lib/api";
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
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronLeft, Check, Loader2 } from "lucide-react";

// ── Zod schemas per step ──────────────────────────────────────────────────────

const personalSchema = z.object({
  first_name: z.string().min(1, "Required"),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, "Required"),
  suffix: z.string().optional(),
  date_of_birth: z.string().min(1, "Required"),
  gender: z.enum(["Male", "Female"]),
  civil_status: z.enum([
    "Single",
    "Married",
    "Widowed",
    "Separated",
    "Divorced",
  ]),
  nationality: z.string().min(1, "Required"),
  tin: z.string().optional(),
});

const contactSchema = z.object({
  phone: z
    .string()
    .min(10, "Enter a valid PH mobile number")
    .regex(/^(09|\+639)\d{9}$/, "Format: 09XXXXXXXXX"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  address: z.object({
    street: z.string().min(1, "Required"),
    barangay: z.string().min(1, "Required"),
    city: z.string().min(1, "Required"),
    province: z.string().min(1, "Required"),
    zip_code: z.string().min(4, "Required"),
  }),
});

const employmentSchema = z.object({
  employer: z.string().optional(),
  occupation: z.string().optional(),
  monthly_income: z.coerce.number().min(0).optional(),
});

const coopSchema = z.object({
  membership_type: z.enum(["Regular", "Associate"]),
  id_type: z.string().optional(),
  id_number: z.string().optional(),
  nominee: z
    .object({
      name: z.string().min(1, "Required"),
      relationship: z.string().min(1, "Required"),
      phone: z.string().min(10, "Required"),
    })
    .optional(),
});

type PersonalValues = z.infer<typeof personalSchema>;
type ContactValues = z.infer<typeof contactSchema>;
type EmploymentValues = z.infer<typeof employmentSchema>;
type CoopValues = z.infer<typeof coopSchema>;

// ── Step config ───────────────────────────────────────────────────────────────

const STEPS = [
  { label: "Personal", description: "Basic information" },
  { label: "Contact", description: "Address & phone" },
  { label: "Employment", description: "Work details" },
  { label: "Cooperative", description: "Membership details" },
];

// ── Field component helpers ───────────────────────────────────────────────────

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
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

// ── Main component ────────────────────────────────────────────────────────────

export default function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState<number>(0);
  const addNotification = useAddNotification();
  const { mutateAsync: createMember, isPending } = useCreateMember();

  // Accumulated form data across steps
  const [formData, setFormData] = useState<
        Partial<PersonalValues & ContactValues & EmploymentValues & CoopValues>
    >({});

  // ── Step forms ──
  const personal = useForm<PersonalValues>({
    resolver: zodResolver(personalSchema),
    defaultValues: formData,
  });

  const contact = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: formData as ContactValues,
  });

  const employment = useForm<EmploymentValues>({
    resolver: zodResolver(employmentSchema),
    defaultValues: formData,
  });

  const coop = useForm<CoopValues>({
    resolver: zodResolver(coopSchema),
    defaultValues: { membership_type: "Regular", ...formData },
  });

  const forms = [personal, contact, employment, coop];
  const schemas = [personalSchema, contactSchema, employmentSchema, coopSchema];

  const handleNext = async () => {
    const currentForm = forms[step];
    const valid = await currentForm.trigger();
    if (!valid) return;

    const values = currentForm.getValues();
    setFormData((prev) => ({ ...prev, ...values }));
    setStep((s) => s + 1);
  };

  const handleBack = () => setStep((s) => s - 1);

  const handleSubmit = async () => {
    const valid = await coop.trigger();
    if (!valid) return;

    const coopValues = coop.getValues();
    const payload = { ...formData, ...coopValues };

    // Validate full payload
    const fullSchema = personalSchema
      .merge(contactSchema)
      .merge(employmentSchema)
      .merge(coopSchema);

    const parsed = fullSchema.safeParse(payload);
    if (!parsed.success) return;

    try {
      const member = await createMember(parsed.data as Parameters<typeof createMember>[0]);
      addNotification({
        type: "success",
        title: "Member registered",
        message: `${member.first_name} ${member.last_name} (${member.member_id}) has been registered.`,
      });
      router.push(`/members/${member.member_id}`);
    } catch (error) {
      addNotification({
        type: "error",
        title: "Registration failed",
        message: extractApiError(error),
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* ── Stepper ── */}
      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "flex items-center justify-center h-8 w-8 rounded-full text-sm font-medium transition-colors",
                  i < step
                    ? "bg-indigo-600 text-white"
                    : i === step
                    ? "bg-indigo-600 text-white ring-4 ring-indigo-100"
                    : "bg-slate-100 text-slate-400"
                )}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <div className="text-center hidden sm:block">
                <p
                  className={cn(
                    "text-xs font-medium",
                    i === step ? "text-indigo-700" : "text-slate-400"
                  )}
                >
                  {s.label}
                </p>
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-px mx-2 mb-5",
                  i < step ? "bg-indigo-600" : "bg-slate-200"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* ── Step content ── */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="pt-6 space-y-4">
          {/* Step 0 — Personal */}
          {step === 0 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="First Name"
                  required
                  error={personal.formState.errors.first_name?.message}
                >
                  <Input
                    {...personal.register("first_name")}
                    placeholder="Juan"
                    className="h-8 text-sm"
                  />
                </Field>
                <Field
                  label="Last Name"
                  required
                  error={personal.formState.errors.last_name?.message}
                >
                  <Input
                    {...personal.register("last_name")}
                    placeholder="Dela Cruz"
                    className="h-8 text-sm"
                  />
                </Field>
                <Field
                  label="Middle Name"
                  error={personal.formState.errors.middle_name?.message}
                >
                  <Input
                    {...personal.register("middle_name")}
                    placeholder="Santos"
                    className="h-8 text-sm"
                  />
                </Field>
                <Field
                  label="Suffix"
                  error={personal.formState.errors.suffix?.message}
                >
                  <Input
                    {...personal.register("suffix")}
                    placeholder="Jr., Sr., III"
                    className="h-8 text-sm"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Date of Birth"
                  required
                  error={personal.formState.errors.date_of_birth?.message}
                >
                  <Input
                    {...personal.register("date_of_birth")}
                    type="date"
                    className="h-8 text-sm"
                  />
                </Field>
                <Field
                  label="Gender"
                  required
                  error={personal.formState.errors.gender?.message}
                >
                  <Select
                    onValueChange={(v) =>
                      personal.setValue("gender", v as "Male" | "Female")
                    }
                    defaultValue={formData.gender}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field
                  label="Civil Status"
                  required
                  error={personal.formState.errors.civil_status?.message}
                >
                  <Select
                    onValueChange={(v) =>
                      personal.setValue("civil_status", v as PersonalValues["civil_status"])
                    }
                    defaultValue={formData.civil_status}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {["Single","Married","Widowed","Separated","Divorced"].map(
                        (s) => <SelectItem key={s} value={s}>{s}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </Field>
                <Field
                  label="Nationality"
                  required
                  error={personal.formState.errors.nationality?.message}
                >
                  <Input
                    {...personal.register("nationality")}
                    placeholder="Filipino"
                    className="h-8 text-sm"
                  />
                </Field>
              </div>

              <Field
                label="TIN"
                error={personal.formState.errors.tin?.message}
              >
                <Input
                  {...personal.register("tin")}
                  placeholder="123-456-789-000"
                  className="h-8 text-sm"
                />
              </Field>
            </>
          )}

          {/* Step 1 — Contact */}
          {step === 1 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Mobile Number"
                  required
                  error={contact.formState.errors.phone?.message}
                >
                  <Input
                    {...contact.register("phone")}
                    placeholder="09171234567"
                    className="h-8 text-sm"
                  />
                </Field>
                <Field
                  label="Email Address"
                  error={contact.formState.errors.email?.message}
                >
                  <Input
                    {...contact.register("email")}
                    type="email"
                    placeholder="juan@email.com"
                    className="h-8 text-sm"
                  />
                </Field>
              </div>

              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide pt-1">
                Address
              </p>

              <Field
                label="Street / House No."
                required
                error={contact.formState.errors.address?.street?.message}
              >
                <Input
                  {...contact.register("address.street")}
                  placeholder="123 Rizal St."
                  className="h-8 text-sm"
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Barangay"
                  required
                  error={contact.formState.errors.address?.barangay?.message}
                >
                  <Input
                    {...contact.register("address.barangay")}
                    placeholder="Poblacion"
                    className="h-8 text-sm"
                  />
                </Field>
                <Field
                  label="City / Municipality"
                  required
                  error={contact.formState.errors.address?.city?.message}
                >
                  <Input
                    {...contact.register("address.city")}
                    placeholder="Cebu City"
                    className="h-8 text-sm"
                  />
                </Field>
                <Field
                  label="Province"
                  required
                  error={contact.formState.errors.address?.province?.message}
                >
                  <Input
                    {...contact.register("address.province")}
                    placeholder="Cebu"
                    className="h-8 text-sm"
                  />
                </Field>
                <Field
                  label="ZIP Code"
                  required
                  error={contact.formState.errors.address?.zip_code?.message}
                >
                  <Input
                    {...contact.register("address.zip_code")}
                    placeholder="6000"
                    className="h-8 text-sm"
                  />
                </Field>
              </div>
            </>
          )}

          {/* Step 2 — Employment */}
          {step === 2 && (
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Employer / Company"
                error={employment.formState.errors.employer?.message}
              >
                <Input
                  {...employment.register("employer")}
                  placeholder="ABC Company"
                  className="h-8 text-sm"
                />
              </Field>
              <Field
                label="Occupation / Position"
                error={employment.formState.errors.occupation?.message}
              >
                <Input
                  {...employment.register("occupation")}
                  placeholder="Engineer"
                  className="h-8 text-sm"
                />
              </Field>
              <Field
                label="Monthly Income (₱)"
                error={employment.formState.errors.monthly_income?.message}
              >
                <Input
                  {...employment.register("monthly_income")}
                  type="number"
                  placeholder="25000"
                  className="h-8 text-sm"
                />
              </Field>
            </div>
          )}

          {/* Step 3 — Cooperative */}
          {step === 3 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Membership Type"
                  required
                  error={coop.formState.errors.membership_type?.message}
                >
                  <Select
                    onValueChange={(v) =>
                      coop.setValue(
                        "membership_type",
                        v as "Regular" | "Associate"
                      )
                    }
                    defaultValue={
                      (formData.membership_type as string) ?? "Regular"
                    }
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Regular">Regular</SelectItem>
                      <SelectItem value="Associate">Associate</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field
                  label="Government ID Type"
                  error={coop.formState.errors.id_type?.message}
                >
                  <Input
                    {...coop.register("id_type")}
                    placeholder="SSS, PhilHealth, etc."
                    className="h-8 text-sm"
                  />
                </Field>
                <Field
                  label="ID Number"
                  error={coop.formState.errors.id_number?.message}
                >
                  <Input
                    {...coop.register("id_number")}
                    placeholder="12-3456789-0"
                    className="h-8 text-sm"
                  />
                </Field>
              </div>

              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide pt-2">
                Nominee / Beneficiary
              </p>

              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Nominee Full Name"
                  error={coop.formState.errors.nominee?.name?.message}
                >
                  <Input
                    {...coop.register("nominee.name")}
                    placeholder="Maria Dela Cruz"
                    className="h-8 text-sm"
                  />
                </Field>
                <Field
                  label="Relationship"
                  error={coop.formState.errors.nominee?.relationship?.message}
                >
                  <Input
                    {...coop.register("nominee.relationship")}
                    placeholder="Spouse, Parent, Child"
                    className="h-8 text-sm"
                  />
                </Field>
                <Field
                  label="Nominee Phone"
                  error={coop.formState.errors.nominee?.phone?.message}
                >
                  <Input
                    {...coop.register("nominee.phone")}
                    placeholder="09281234567"
                    className="h-8 text-sm"
                  />
                </Field>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ── Navigation ── */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={step === 0 ? () => router.back() : handleBack}
          className="gap-1.5"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          {step === 0 ? "Cancel" : "Back"}
        </Button>

        {step < STEPS.length - 1 ? (
          <Button
            size="sm"
            onClick={handleNext}
            className="bg-indigo-600 hover:bg-indigo-700 gap-1.5"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isPending}
            className="bg-indigo-600 hover:bg-indigo-700 gap-1.5"
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Registering…
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5" />
                Register Member
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}