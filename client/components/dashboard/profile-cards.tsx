"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FormInput, FormSelect, FormTextarea } from "@/components/form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SelectItem } from "@/components/ui/select";
import { BLOOD_GROUPS, SPECIALIZATIONS } from "@/constants";
import { useUpdateDoctorProfile } from "@/hooks/use-doctors";
import { useUpdatePatientProfile } from "@/hooks/use-patient";
import { useUpdateUser } from "@/hooks/use-user";
import { showError, showSuccess } from "@/lib/notifications";
import {
  type AccountValues,
  accountSchema,
  type DoctorProfileValues,
  doctorProfileSchema,
  type PatientProfileValues,
  patientProfileSchema,
} from "@/schemas/profile";

export function AccountInfoCard({ user }: { user: any }) {
  const mutation = useUpdateUser();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<AccountValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      phone: user?.phone || "",
    },
  });

  const onSubmit = async (values: AccountValues) => {
    setError(null);
    try {
      await mutation.mutateAsync({
        first_name: values.first_name,
        last_name: values.last_name,
        phone: values.phone || "",
      });
      showSuccess("Account information updated!");
    } catch (err: any) {
      showError(err);
      setError(err.response?.data?.message || err.message || "Failed to update account");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Information</CardTitle>
        <CardDescription>Basic identity and contact details.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              control={form.control}
              name="first_name"
              label="First Name"
              placeholder="John"
            />
            <FormInput
              control={form.control}
              name="last_name"
              label="Last Name"
              placeholder="Doe"
            />
          </div>
          <div className="space-y-2">
            <label className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Email Address
            </label>
            <div className="flex h-10 w-full cursor-not-allowed rounded-md border border-input bg-muted px-3 py-2 text-muted-foreground text-sm">
              {user?.email || ""}
            </div>
            <p className="text-[10px] text-muted-foreground uppercase">
              Email cannot be changed.
            </p>
          </div>
          <FormInput
            control={form.control}
            name="phone"
            label="Phone Number"
            placeholder="+1 234 567 890"
          />

          {error && <p className="font-medium text-destructive text-sm">{error}</p>}

          <Button type="submit" className="w-full" loading={mutation.isPending}>
            Update Account
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function PatientProfileCard({ profile }: { profile: any }) {
  const mutation = useUpdatePatientProfile();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<PatientProfileValues>({
    resolver: zodResolver(patientProfileSchema),
    defaultValues: {
      date_of_birth: profile?.date_of_birth || "",
      blood_group: profile?.blood_group || "",
      address: profile?.address || "",
      emergency_contact: profile?.emergency_contact || "",
    },
  });

  const onSubmit = async (values: PatientProfileValues) => {
    setError(null);
    try {
      await mutation.mutateAsync({
        date_of_birth: values.date_of_birth || null,
        blood_group: values.blood_group || null,
        address: values.address || null,
        emergency_contact: values.emergency_contact || null,
      });
      showSuccess("Clinical profile updated!");
    } catch (err: any) {
      showError(err);
      setError(err.response?.data?.message || err.message || "Failed to update profile");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Clinical Profile</CardTitle>
        <CardDescription>Detailed medical information for better care.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-6 gap-4">
            <div className="col-span-4">
              <FormInput
                control={form.control}
                name="date_of_birth"
                label="Date of Birth"
                type="date"
              />
            </div>
            <div className="col-span-2">
              <FormSelect
                control={form.control}
                name="blood_group"
                label="Blood Group"
                placeholder="Select blood group"
              >
                {BLOOD_GROUPS.map((bg) => (
                  <SelectItem key={bg} value={bg}>
                    {bg}
                  </SelectItem>
                ))}
              </FormSelect>
            </div>
          </div>
          <FormInput
            control={form.control}
            name="emergency_contact"
            label="Emergency Contact"
            placeholder="Name and Phone Number"
          />
          <FormTextarea
            control={form.control}
            name="address"
            label="Residential Address"
            placeholder="Detailed address..."
            className="h-24 resize-none"
          />

          {error && <p className="font-medium text-destructive text-sm">{error}</p>}

          <Button type="submit" className="w-full" loading={mutation.isPending}>
            Update Clinical Profile
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function DoctorProfileCard({ profile }: { profile: any }) {
  const mutation = useUpdateDoctorProfile();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<DoctorProfileValues>({
    resolver: zodResolver(doctorProfileSchema) as any,
    defaultValues: {
      specialization:
        profile?.specialization?.toLowerCase().trim().replace(/\s+/g, "_") || "",
      bio: profile?.bio || "",
      experience_years: profile?.experience_years || 0,
      consultation_fee: profile?.consultation_fee || "0.00",
    },
  });

  const onSubmit = async (values: DoctorProfileValues) => {
    setError(null);
    try {
      await mutation.mutateAsync({
        specialization: values.specialization as any,
        bio: values.bio || null,
        experience_years: values.experience_years || 0,
        consultation_fee: values.consultation_fee || "0.00",
      });
      showSuccess("Professional profile updated!");
    } catch (err: any) {
      showError(err);
      setError(err.response?.data?.message || err.message || "Failed to update profile");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Professional Profile</CardTitle>
        <CardDescription>Credentials and professional background.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormSelect
              control={form.control}
              name="specialization"
              label="Specialization"
              placeholder="Select specialization"
            >
              {SPECIALIZATIONS.map((spec) => (
                <SelectItem key={spec.value} value={spec.value}>
                  {spec.label}
                </SelectItem>
              ))}
            </FormSelect>
            <FormInput
              control={form.control}
              name="experience_years"
              label="Experience (Years)"
              type="number"
              placeholder="5"
            />
          </div>
          <FormInput
            control={form.control}
            name="consultation_fee"
            label="Consultation Fee ($)"
            type="number"
            step="0.01"
          />
          <FormTextarea
            control={form.control}
            name="bio"
            label="Professional Bio"
            placeholder="Tell patients about your background and expertise..."
            className="h-32 resize-none"
          />

          {error && <p className="font-medium text-destructive text-sm">{error}</p>}

          <Button type="submit" className="w-full" loading={mutation.isPending}>
            Update Professional Profile
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
