"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Appointment } from "@/types";
import { format } from "date-fns";
import { Activity, Calendar, Clock, FileText, StickyNote, User } from "lucide-react";

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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between pr-6">
            Appointment Details
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${statusVariants[appointment.status]}`}
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
              <span className="text-xs text-muted-foreground flex items-center">
                <User className="h-3 w-3 mr-1" /> {isDoctor ? "Patient" : "Doctor"}
              </span>
              {isDoctor ? (
                <>
                  <p className="text-sm font-semibold">{appointment.patient_name}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">
                    {appointment.patient_details?.user?.phone || "No phone"}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold">
                    {appointment.doctor_details.doctor_name}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase">
                    {appointment.doctor_details.specialization}
                  </p>
                </>
              )}
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground flex items-center">
                <Calendar className="h-3 w-3 mr-1" /> Schedule
              </span>
              <p className="text-sm font-medium" suppressHydrationWarning>
                {format(new Date(appointment.appointment_date), "PPP")}
              </p>
              <p className="text-xs text-muted-foreground flex items-center font-medium">
                <Clock className="h-3 w-3 mr-1" /> {appointment.appointment_time}
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <span className="text-xs text-muted-foreground flex items-center">
              <Activity className="h-3 w-3 mr-1" /> Symptoms
            </span>
            <p className="text-sm bg-accent/30 p-3 rounded-lg border border-border italic text-muted-foreground">
              "{appointment.symptoms}"
            </p>
          </div>

          {appointment.doctor_notes && (
            <div className="space-y-2">
              <span className="text-xs text-muted-foreground flex items-center">
                <StickyNote className="h-3 w-3 mr-1" /> Doctor's Notes
              </span>
              <p className="text-sm p-3 rounded-lg border border-border bg-emerald-500/5">
                {appointment.doctor_notes}
              </p>
            </div>
          )}

          {appointment.rejection_reason && (
            <div className="space-y-2">
              <span className="text-xs text-muted-foreground flex items-center">
                <FileText className="h-3 w-3 mr-1 text-rose-500" /> Rejection Reason
              </span>
              <p className="text-sm p-3 rounded-lg border border-rose-500/20 bg-rose-500/5 text-rose-600">
                {appointment.rejection_reason}
              </p>
            </div>
          )}

          <div className="pt-4 border-t flex justify-between items-center text-[10px] text-muted-foreground">
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
