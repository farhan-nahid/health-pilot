"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useUser } from "@/hooks/use-user";
import { ReviewList } from "./_components/review-list";

export default function PatientReviewsPage() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-bold text-2xl tracking-tight">
            {
              user?.patient_profile?.id
                ? "My Reviews"
                : "Patient Reviews"
            }
          </h1>
          <p className="text-muted-foreground">
            {
              user?.patient_profile?.id
                ? "Manage reviews you have written for doctors."
                : "See what patients are saying about you."
          }
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {user?.patient_profile?.id ? "Your Reviews" : "Recent Reviews"}
          </CardTitle>
          <CardDescription>
            {user?.patient_profile?.id
              ? "You can edit or delete your reviews here."
              : "Feedback from your patients."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {user?.patient_profile?.id ? (
            <ReviewList patientId={user.patient_profile.id} />
          ) : user?.doctor_profile?.id ? (
            <ReviewList doctorId={user.doctor_profile.id} />
          ) : null}
          {!user?.patient_profile?.id && !user?.doctor_profile?.id && (
            <div className="text-center">Profile not loaded.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
