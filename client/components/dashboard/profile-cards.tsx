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
import { BLOOD_GROUPS, DOCTOR_DOCUMENT_TYPES, SPECIALIZATIONS } from "@/constants";
import {
  useDeleteDoctorDocument,
  useDoctorDocuments,
  useUpdateDoctorProfile,
  useUploadDoctorDocument,
} from "@/hooks/use-doctors";
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
import type { Doctor, DoctorDocument } from "@/types";
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Trash2,
  Upload,
  XCircle,
} from "lucide-react";

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

export function DoctorProfileCard({ profile }: { profile: Doctor }) {
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

export function DoctorDocumentsCard() {
  const { documents, isLoading } = useDoctorDocuments();
  const uploadMutation = useUploadDoctorDocument();
  const deleteMutation = useDeleteDoctorDocument();

  const [documentType, setDocumentType] = useState<string>("bmdc_registration");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please select a document file to upload.");
      return;
    }

    setError(null);
    const formData = new FormData();
    formData.append("document_type", documentType);
    formData.append("file", selectedFile);

    try {
      await uploadMutation.mutateAsync(formData);
      showSuccess("Document uploaded successfully!");
      setSelectedFile(null);
      const fileInput = document.getElementById("document_file") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (err: any) {
      showError(err);
      setError(err.response?.data?.message || err.message || "Failed to upload document");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      showSuccess("Document deleted!");
    } catch (err: any) {
      showError(err);
    }
  };

  const getStatusBadge = (status: string, display: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 font-medium text-green-800 text-xs dark:bg-green-950 dark:text-green-300">
            <CheckCircle2 className="h-3 w-3" />
            {display || "Approved"}
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 font-medium text-red-800 text-xs dark:bg-red-950 dark:text-red-300">
            <XCircle className="h-3 w-3" />
            {display || "Rejected"}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 font-medium text-amber-800 text-xs dark:bg-amber-950 dark:text-amber-300">
            <Clock className="h-3 w-3" />
            {display || "Pending"}
          </span>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Verification Documents
        </CardTitle>
        <CardDescription>
          Upload and manage your medical licenses and verification documents.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleUpload} className="space-y-4 rounded-lg border p-4 bg-muted/30">
          <h4 className="font-semibold text-sm">Upload New Document</h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="font-medium text-sm">Document Type</label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {DOCTOR_DOCUMENT_TYPES.map((dt) => (
                  <option key={dt.value} value={dt.value}>
                    {dt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="font-medium text-sm">File (PDF, PNG, JPG)</label>
              <input
                id="document_file"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:font-medium file:text-sm"
              />
            </div>
          </div>

          {error && <p className="font-medium text-destructive text-sm">{error}</p>}

          <Button type="submit" size="sm" loading={uploadMutation.isPending}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        </form>

        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Uploaded Documents</h4>

          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <div className="h-6 w-6 animate-spin rounded-full border-primary border-b-2"></div>
            </div>
          ) : documents.length === 0 ? (
            <p className="text-center py-6 text-muted-foreground text-sm">
              No verification documents uploaded yet.
            </p>
          ) : (
            <div className="divide-y rounded-lg border">
              {documents.map((doc: DoctorDocument) => (
                <div
                  key={doc.id}
                  className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {doc.document_type_display || doc.document_type}
                      </span>
                      {getStatusBadge(doc.status, doc.status_display)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Uploaded on {new Date(doc.uploaded_at).toLocaleDateString()}
                    </p>
                    {doc.reviewer_notes && (
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        Notes: {doc.reviewer_notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-2 sm:pt-0">
                    {doc.file && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={doc.file} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-1 h-3.5 w-3.5" />
                          View
                        </a>
                      </Button>
                    )}

                    {doc.status !== "approved" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(doc.id)}
                        loading={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
