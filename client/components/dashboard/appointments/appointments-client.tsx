"use client"

import { useAppointments } from "@/hooks/use-appointments";
import { AppointmentList } from "./appointment-list";
import { BookAppointmentDialog } from "./book-appointment-dialog";

export function AppointmentsClient() {
  const { appointments, isLoading, refresh } = useAppointments();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Appointments</h2>
          <p className="text-muted-foreground">
            Manage your doctor consultations and health sessions.
          </p>
        </div>
        <BookAppointmentDialog onSuccess={refresh} />
      </div>

      <div className="space-y-4">
        <AppointmentList appointments={appointments} isLoading={isLoading} onRefresh={refresh} />
      </div>
    </div>
  );
}
