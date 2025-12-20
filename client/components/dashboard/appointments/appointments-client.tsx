"use client"

import { useAppointments } from "@/hooks/use-appointments";
import { useUser } from "@/hooks/use-user";
import { AppointmentList } from "./appointment-list";
import { BookAppointmentDialog } from "./book-appointment-dialog";

import { useSearchParams } from "next/navigation";

export function AppointmentsClient() {
  const searchParams = useSearchParams();
  const patientId = searchParams.get("patient_id");
  const { user } = useUser();
  const { appointments, isLoading, refresh } = useAppointments(patientId);

  const isPatient = user?.user_type === "patient";

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Appointments</h2>
          <p className="text-muted-foreground">
            {isPatient 
              ? "Manage your doctor consultations and health sessions."
              : "View and manage your upcoming consultations with patients."}
          </p>
        </div>
        {isPatient && <BookAppointmentDialog onSuccess={refresh} />}
      </div>

      <div className="space-y-4">
        <AppointmentList 
          appointments={appointments} 
          isLoading={isLoading} 
          onRefresh={refresh}
          userType={user?.user_type}
        />
      </div>
    </div>
  );
}
