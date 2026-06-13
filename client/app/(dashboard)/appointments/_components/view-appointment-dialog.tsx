"use client";

import { format } from "date-fns";
import {
  Activity,
  Calendar,
  Clock,
  Download,
  FileText,
  MessageSquare,
  Pill,
  StickyNote,
  User,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChatInterface } from "@/components/chat/chat-interface";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import api from "@/lib/api";
import { showError } from "@/lib/notifications";
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
  const [downloading, setDownloading] = useState(false);
  const canDownloadPrescription = appointment.status === "completed";
  const hasPrescriptionData = (appointment.prescription_data?.length || 0) > 0;

  const downloadPrescription = async () => {
    try {
      setDownloading(true);
      const response = await api.get(
        `/appointments/${appointment.id}/prescription_pdf/`,
        {
          responseType: "blob",
        },
      );
      const blob = response.data as Blob;
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `health-pilot-prescription-${appointment.id}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      showError(error);
    } finally {
      setDownloading(false);
    }
  };

  const canChat = appointment.status === "accepted" || appointment.status === "completed";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[90vh] sm:h-[85vh] max-h-[800px] flex-col overflow-hidden sm:max-w-150">
        <DialogHeader className="shrink-0">
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

        <Tabs
          defaultValue="details"
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <TabsList className="grid w-full shrink-0 grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="chat" disabled={!canChat}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Chat
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="details"
            className="min-h-0 flex-1 overflow-y-auto pt-4 pr-1"
          >
            <div className="pt-1 mb-4">
              <Button
                size="sm"
                variant={canDownloadPrescription ? "default" : "outline"}
                onClick={downloadPrescription}
                disabled={!canDownloadPrescription || downloading}
                loading={downloading}
                className={canDownloadPrescription ? "bg-blue-600 hover:bg-blue-700" : ""}
              >
                {!downloading && <Download className="h-4 w-4" />}
                {downloading
                  ? "Preparing PDF..."
                  : canDownloadPrescription
                    ? "Download Prescription PDF"
                    : "PDF available after completion"}
              </Button>
            </div>

            <div className="space-y-6">
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

              {(hasPrescriptionData || canDownloadPrescription) && (
                <div className="space-y-2">
                  <span className="flex items-center text-muted-foreground text-xs">
                    <Pill className="mr-1 h-3 w-3" /> Prescription Medicines
                  </span>

                  {hasPrescriptionData ? (
                    <div className="space-y-2">
                      {appointment.prescription_data.map((medicine, index) => (
                        <div
                          key={`${medicine.name}-${index}`}
                          className="rounded-lg border border-border bg-accent/20 p-3"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-semibold text-sm">
                              {medicine.name || "Medicine"}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {medicine.dose || "-"}
                            </p>
                          </div>
                          <div className="mt-2 grid grid-cols-1 gap-1 text-xs md:grid-cols-2">
                            <p>
                              <span className="font-medium">When:</span>{" "}
                              {medicine.when_to_take || "-"}
                            </p>
                            <p>
                              <span className="font-medium">Duration:</span>{" "}
                              {medicine.duration || "-"}
                            </p>
                          </div>
                          {medicine.instructions && (
                            <p className="mt-1 text-muted-foreground text-xs">
                              <span className="font-medium text-foreground">
                                Instructions:
                              </span>{" "}
                              {medicine.instructions}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-lg border border-border bg-accent/20 p-3 text-muted-foreground text-sm">
                      This appointment was completed, but no medicine list was recorded.
                    </p>
                  )}
                </div>
              )}

              {(appointment.follow_up_required ||
                appointment.follow_up_date ||
                appointment.follow_up_notes) && (
                <div className="space-y-2">
                  <span className="flex items-center text-muted-foreground text-xs">
                    <Calendar className="mr-1 h-3 w-3" /> Follow-up
                  </span>
                  <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 text-sm">
                    <p className="font-medium text-blue-700 dark:text-blue-300">
                      {appointment.follow_up_required
                        ? "Patient should come again."
                        : "Follow-up note recorded."}
                    </p>
                    {appointment.follow_up_date && (
                      <p className="mt-1 text-blue-700/90 text-xs dark:text-blue-200">
                        Next visit: {format(new Date(appointment.follow_up_date), "PPP")}
                      </p>
                    )}
                    {appointment.follow_up_notes && (
                      <p className="mt-1 text-blue-700/90 text-xs dark:text-blue-200">
                        {appointment.follow_up_notes}
                      </p>
                    )}
                  </div>
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
          </TabsContent>

          <TabsContent
            value="chat"
            className="flex min-h-[400px] flex-1 flex-col overflow-hidden pt-4"
          >
            <ChatInterface appointment={appointment} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
