"use client"

import { FormTextarea } from "@/components/form";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import api from "@/lib/api";
import { showError, showSuccess } from "@/lib/notifications";
import { completeAppointmentSchema, CompleteAppointmentValues } from "@/schemas/appointment";
import { Appointment } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

export function CompleteAppointmentDialog({
  appointment,
  open,
  onOpenChange,
  onSuccess
}: {
  appointment: Appointment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();

  const form = useForm<CompleteAppointmentValues>({
    resolver: zodResolver(completeAppointmentSchema),
    defaultValues: {
      doctor_notes: appointment.doctor_notes || "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        doctor_notes: appointment.doctor_notes || "",
      });
    }
  }, [appointment, open, form]);

  const mutation = useMutation({
    mutationFn: async (values: CompleteAppointmentValues) => {
      return api.post(`/appointments/${appointment.id}/complete/`, values);
    },
    onSuccess: () => {
      showSuccess("Appointment marked as completed.");
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      onOpenChange(false);
      if (onSuccess) onSuccess();
    },
    onError: (err: any) => showError(err),
  });

  const onSubmit = (values: CompleteAppointmentValues) => {
    mutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            Complete Appointment
          </DialogTitle>
          <DialogDescription>
            Finish this session with patient <strong>{appointment.patient_name}</strong>. Add any final clinical notes or recommendations.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <FormTextarea
            control={form.control}
            name="doctor_notes"
            label="Final Clinical Notes"
            placeholder="Treatment plan, diagnosis, or recommendations..."
            className="h-32 resize-none"
          />
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700"
              loading={mutation.isPending}
            >
              Mark as Completed
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
