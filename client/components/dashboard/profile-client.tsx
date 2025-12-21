"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
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
import { useDoctorProfile, useUpdateDoctorProfile } from "@/hooks/use-doctors";
import { usePatientProfile, useUpdatePatientProfile } from "@/hooks/use-patient";
import { useUpdateUser, useUser } from "@/hooks/use-user";
import { showError, showSuccess } from "@/lib/notifications";
import { type ProfileValues, profileSchema } from "@/schemas/profile";

const SPECIALIZATIONS = [
  { value: "cardiologist", label: "Cardiologist" },
  { value: "neurologist", label: "Neurologist" },
  { value: "dermatologist", label: "Dermatologist" },
  { value: "orthopedic", label: "Orthopedic" },
  { value: "pediatrician", label: "Pediatrician" },
  { value: "psychiatrist", label: "Psychiatrist" },
  { value: "gynecologist", label: "Gynecologist" },
  { value: "oncologist", label: "Oncologist" },
  { value: "gastroenterologist", label: "Gastroenterologist" },
  { value: "general_physician", label: "General Physician" },
];

export function ProfileClient() {
  const { user, isLoading: userLoading } = useUser();
  const isPatient = user?.user_type === "patient";
  const isDoctor = user?.user_type === "doctor";

  const { profile: patientProfile, isLoading: patientLoading } = usePatientProfile();
  const { profile: doctorProfile, isLoading: doctorLoading } = useDoctorProfile();

  const updateUserMutation = useUpdateUser();
  const updatePatientMutation = useUpdatePatientProfile();
  const updateDoctorMutation = useUpdateDoctorProfile();

  const [error, setError] = useState<string | null>(null);

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema) as any,
    defaultValues: {
      first_name: "",
      last_name: "",
      phone: "",
      date_of_birth: "",
      blood_group: "",
      address: "",
      emergency_contact: "",
      specialization: "",
      bio: "",
      experience_years: 0,
      consultation_fee: "0.00",
    },
  });

  useEffect(() => {
    if (user) {
      const defaultValues: Partial<ProfileValues> = {
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone: user.phone || "",
      };

      if (isPatient && patientProfile) {
        defaultValues.date_of_birth = patientProfile.date_of_birth || "";
        defaultValues.blood_group = patientProfile.blood_group || "";
        defaultValues.address = patientProfile.address || "";
        defaultValues.emergency_contact = patientProfile.emergency_contact || "";
      }

      if (isDoctor && doctorProfile) {
        defaultValues.specialization = doctorProfile.specialization?.toLowerCase() || "";
        defaultValues.bio = doctorProfile.bio || "";
        defaultValues.experience_years = doctorProfile.experience_years || 0;
        defaultValues.consultation_fee = doctorProfile.consultation_fee || "0.00";
      }

      form.reset(defaultValues);
    }
  }, [user, patientProfile, doctorProfile, isPatient, isDoctor, form]);

  const onSubmit = async (values: ProfileValues) => {
    setError(null);

    try {
      const promises = [
        updateUserMutation.mutateAsync({
          first_name: values.first_name,
          last_name: values.last_name,
          phone: values.phone,
        }),
      ];

      if (isPatient) {
        promises.push(
          updatePatientMutation.mutateAsync({
            date_of_birth: values.date_of_birth || null,
            blood_group: values.blood_group || null,
            address: values.address || null,
            emergency_contact: values.emergency_contact || null,
          }),
        );
      } else if (isDoctor) {
        promises.push(
          updateDoctorMutation.mutateAsync({
            specialization: values.specialization as any,
            bio: values.bio || null,
            experience_years: values.experience_years || 0,
            consultation_fee: values.consultation_fee || "0.00",
          }),
        );
      }

      await Promise.all(promises);
      showSuccess("Profile updated successfully!");
    } catch (err: any) {
      showError(err);
      setError(err.response?.data?.message || err.message || "Failed to update profile");
    }
  };

  const isLoading =
    userLoading || (isPatient && patientLoading) || (isDoctor && doctorLoading);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-primary border-b-2"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Basic identity and contact details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>

        {isPatient && (
          <Card>
            <CardHeader>
              <CardTitle>Clinical Profile</CardTitle>
              <CardDescription>
                Detailed medical information for better care.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  control={form.control}
                  name="date_of_birth"
                  label="Date of Birth"
                  type="date"
                />
                <FormSelect
                  control={form.control}
                  name="blood_group"
                  label="Blood Group"
                  placeholder="Select blood group"
                >
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                    <SelectItem key={bg} value={bg}>
                      {bg}
                    </SelectItem>
                  ))}
                </FormSelect>
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
            </CardContent>
          </Card>
        )}

        {isDoctor && (
          <Card>
            <CardHeader>
              <CardTitle>Professional Profile</CardTitle>
              <CardDescription>Credentials and professional background.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {error && (
            <div className="rounded border border-destructive/20 bg-destructive/10 p-2 font-medium text-destructive text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full font-semibold"
            loading={
              updateUserMutation.isPending ||
              updatePatientMutation.isPending ||
              updateDoctorMutation.isPending
            }
          >
            {updateUserMutation.isPending ||
            updatePatientMutation.isPending ||
            updateDoctorMutation.isPending
              ? "Saving Changes..."
              : "Update Profile"}
          </Button>
        </div>
      </form>
    </div>
  );
}
