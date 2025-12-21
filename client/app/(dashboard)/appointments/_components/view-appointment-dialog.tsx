"use client";

import { format } from "date-fns";
import { Activity, Calendar, Clock, FileText, StickyNote, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { Appointment } from "@/types";

const statusVariants: Record<string, string> = {
  pending:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  accepted:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  rejected:
    "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800",
  completed:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  cancelled:
    "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800",
};

export function ViewAppointmentDialog({
  appointment,
  open,
  onOpenChange,
  userType,
}: {
  appointment: Appointment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userType?: "doctor" | "patient";
}) {
  const isDoctor = userType === "doctor";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between pr-6">
            Appointment Details
            <span
              className={`rounded-full border px-2 py-0.5 font-bold text-[10px] uppercase ${statusVariants[appointment.status]}`}
            >
              {appointment.status}
            </span>
          </DialogTitle>
          <DialogDescription>
            Detailed information about{" "}
            {isDoctor ? "the patient consultation" : "your consultation"}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="flex items-center text-muted-foreground text-xs">
                <User className="mr-1 h-3 w-3" /> {isDoctor ? "Patient" : "Doctor"}
              </span>
              {isDoctor ? (
                <>
                  <p className="font-semibold text-sm">{appointment.patient_name}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">
                    {appointment.patient_details?.user?.phone || "No phone"}
                  </p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-sm">
                    {appointment.doctor_details.doctor_name}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase">
                    {appointment.doctor_details.specialization}
                  </p>
                </>
              )}
            </div>
            <div className="space-y-1">
              <span className="flex items-center text-muted-foreground text-xs">
                <Calendar className="mr-1 h-3 w-3" /> Schedule
              </span>
              <p className="font-medium text-sm" suppressHydrationWarning>
                {format(new Date(appointment.appointment_date), "PPP")}
              </p>
              <p className="flex items-center font-medium text-muted-foreground text-xs">
                <Clock className="mr-1 h-3 w-3" /> {appointment.appointment_time}
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <span className="flex items-center text-muted-foreground text-xs">
              <Activity className="mr-1 h-3 w-3" /> Symptoms
            </span>
            <p className="rounded-lg border border-border bg-accent/30 p-3 text-muted-foreground text-sm italic">
              "{appointment.symptoms}"
            </p>
          </div>

          {appointment.doctor_notes && (
            <div className="space-y-2">
              <span className="flex items-center text-muted-foreground text-xs">
                <StickyNote className="mr-1 h-3 w-3" /> Doctor's Notes
              </span>
              <p className="rounded-lg border border-border bg-emerald-500/5 p-3 text-sm">
                {appointment.doctor_notes}
              </p>
            </div>
          )}

          {appointment.rejection_reason && (
            <div className="space-y-2">
              <span className="flex items-center text-muted-foreground text-xs">
                <FileText className="mr-1 h-3 w-3 text-rose-500" /> Rejection Reason
              </span>
              <p className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-3 text-rose-600 text-sm">
                {appointment.rejection_reason}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between border-t pt-4 text-[10px] text-muted-foreground">
            <span>ID: #{appointment.id}</span>
            <span suppressHydrationWarning>
              Created on {format(new Date(appointment.created_at), "MMM d, yyyy")}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
