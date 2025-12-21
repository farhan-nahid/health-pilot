"use client";

import { useDoctorProfile } from "@/hooks/use-doctors";
import { usePatientProfile } from "@/hooks/use-patient";
import { useUser } from "@/hooks/use-user";
import { AccountInfoCard, DoctorProfileCard, PatientProfileCard } from "./profile-cards";

export function ProfileClient() {
  const { user, isLoading: userLoading } = useUser();
  const isPatient = user?.user_type === "patient";
  const isDoctor = user?.user_type === "doctor";

  const { profile: patientProfile, isLoading: patientLoading } = usePatientProfile();
  const { profile: doctorProfile, isLoading: doctorLoading } = useDoctorProfile();

  const isLoading =
    userLoading || (isPatient && patientLoading) || (isDoctor && doctorLoading);

  if (isLoading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-primary border-b-2"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-8">
      <AccountInfoCard user={user} />

      {isPatient && patientProfile && <PatientProfileCard profile={patientProfile} />}

      {isDoctor && doctorProfile && <DoctorProfileCard profile={doctorProfile} />}
    </div>
  );
}
