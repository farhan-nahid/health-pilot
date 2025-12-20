"use client"

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api";
import { showError, showSuccess } from "@/lib/notifications";
import { Appointment } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";

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
  const [notes, setNotes] = useState(appointment.doctor_notes || "");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      return api.post(`/appointments/${appointment.id}/complete/`, {
        doctor_notes: notes
      });
    },
    onSuccess: () => {
      showSuccess("Appointment marked as completed.");
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      onOpenChange(false);
      if (onSuccess) onSuccess();
    },
    onError: (err: any) => showError(err),
  });

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
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="notes">Final Clinical Notes</Label>
            <Textarea
              id="notes"
              placeholder="Treatment plan, diagnosis, or recommendations..."
              className="h-32 resize-none"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={() => mutation.mutate()}
            loading={mutation.isPending}
          >
            Mark as Completed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
