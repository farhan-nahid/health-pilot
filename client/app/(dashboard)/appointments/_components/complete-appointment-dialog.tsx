"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, CircleMinus, CirclePlus } from "lucide-react";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import type { z } from "zod";
import { FormCheckbox, FormInput, FormTextarea } from "@/components/form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import { showError, showSuccess } from "@/lib/notifications";
import { completeAppointmentSchema } from "@/schemas/appointment";
import type { Appointment } from "@/types";

type CompleteAppointmentFormValues = z.input<typeof completeAppointmentSchema>;
type CompleteAppointmentSubmitValues = z.output<typeof completeAppointmentSchema>;
const DEFAULT_MEDICINE = {
  name: "Paracetamol",
  dose: "500 mg",
  when_to_take: "After meals (morning & night)",
  duration: "5 days",
  instructions: "Take after food with a full glass of water",
};

const getDefaultFormValues = (
  appointment: Appointment,
): CompleteAppointmentFormValues => ({
  doctor_notes:
    appointment.doctor_notes ||
    `Patient evaluated clinically. Vital signs stable at the time of consultation.
Symptoms suggest a mild, self-limiting condition.

Advised adequate rest, proper hydration, and adherence to prescribed medications.
Patient instructed to monitor symptoms closely and maintain a balanced diet.`,

  medicines: appointment.prescription_data.length
    ? appointment.prescription_data.map((medicine) => ({
        name: medicine.name || DEFAULT_MEDICINE.name,
        dose: medicine.dose || DEFAULT_MEDICINE.dose,
        when_to_take: medicine.when_to_take || DEFAULT_MEDICINE.when_to_take,
        duration: medicine.duration || DEFAULT_MEDICINE.duration,
        instructions: medicine.instructions || DEFAULT_MEDICINE.instructions,
      }))
    : [DEFAULT_MEDICINE],

  follow_up_required: appointment.follow_up_required || false,

  follow_up_date: appointment.follow_up_date || "",

  follow_up_notes:
    appointment.follow_up_notes ||
    `Follow-up recommended if symptoms do not improve within 5–7 days.
Seek immediate medical attention if symptoms worsen, fever persists, or new symptoms develop.`,
});

export function CompleteAppointmentDialog({
  appointment,
  open,
  onOpenChange,
  onSuccess,
}: {
  appointment: Appointment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();
  const isEditingCompletedAppointment = appointment.status === "completed";

  const form = useForm<
    CompleteAppointmentFormValues,
    unknown,
    CompleteAppointmentSubmitValues
  >({
    resolver: zodResolver(completeAppointmentSchema),
    defaultValues: getDefaultFormValues(appointment),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "medicines",
  });

  useEffect(() => {
    if (open) {
      form.reset(getDefaultFormValues(appointment));
    }
  }, [appointment, open, form]);

  const mutation = useMutation({
    mutationFn: async (values: CompleteAppointmentSubmitValues) => {
      const medicines = values.medicines
        .map((medicine) => ({
          name: medicine.name.trim(),
          dose: medicine.dose.trim(),
          when_to_take: medicine.when_to_take.trim(),
          duration: medicine.duration.trim(),
          instructions: medicine.instructions.trim(),
        }))
        .filter((medicine) =>
          Object.values(medicine).some((value) => value.trim().length > 0),
        );

      return api.post(`/appointments/${appointment.id}/complete/`, {
        doctor_notes: values.doctor_notes,
        medicines,
        follow_up_required: values.follow_up_required,
        follow_up_date: values.follow_up_required
          ? values.follow_up_date || undefined
          : undefined,
        follow_up_notes: values.follow_up_notes,
      });
    },
    onSuccess: () => {
      showSuccess(
        isEditingCompletedAppointment
          ? "Prescription updated successfully."
          : "Appointment marked as completed.",
      );
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      onOpenChange(false);
      if (onSuccess) onSuccess();
    },
    onError: (err: any) => showError(err),
  });

  const onSubmit = (values: CompleteAppointmentSubmitValues) => {
    mutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col overflow-hidden sm:max-w-190">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            {isEditingCompletedAppointment ? "Edit Prescription" : "Complete Appointment"}
          </DialogTitle>
          <DialogDescription>
            {isEditingCompletedAppointment ? (
              <>
                Update prescription and follow-up details for patient{" "}
                <strong>{appointment.patient_name}</strong>.
              </>
            ) : (
              <>
                Finish this session with patient{" "}
                <strong>{appointment.patient_name}</strong>. Add any final clinical notes
                or recommendations.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="min-h-0 flex-1 space-y-5 overflow-y-auto py-4 pr-1"
        >
          <FormTextarea
            control={form.control}
            name="doctor_notes"
            label="Final Clinical Notes"
            placeholder="Treatment plan, diagnosis, or recommendations..."
            className="h-32 resize-none"
          />

          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-sm">Prescription</h3>
                <p className="text-muted-foreground text-xs">
                  Add one or more medicines with timing and duration.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append(DEFAULT_MEDICINE)}
              >
                <CirclePlus className="mr-2 h-4 w-4" />
                Add Medicine
              </Button>
            </div>

            <div className="mt-4 space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="rounded-lg border border-border bg-background p-4 shadow-sm"
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <p className="font-medium text-sm">Medicine {index + 1}</p>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        className="h-8 px-2 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                      >
                        <CircleMinus className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`medicines.${index}.name`}>Medicine name</Label>
                      <Input
                        id={`medicines.${index}.name`}
                        {...form.register(`medicines.${index}.name`)}
                        placeholder="Paracetamol"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`medicines.${index}.dose`}>Dose</Label>
                      <Input
                        id={`medicines.${index}.dose`}
                        {...form.register(`medicines.${index}.dose`)}
                        placeholder="500 mg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`medicines.${index}.when_to_take`}>
                        When to take
                      </Label>
                      <Input
                        id={`medicines.${index}.when_to_take`}
                        {...form.register(`medicines.${index}.when_to_take`)}
                        placeholder="After breakfast and dinner"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`medicines.${index}.duration`}>Duration</Label>
                      <Input
                        id={`medicines.${index}.duration`}
                        {...form.register(`medicines.${index}.duration`)}
                        placeholder="5 days"
                      />
                    </div>
                  </div>

                  <div className="mt-3 space-y-2">
                    <Label htmlFor={`medicines.${index}.instructions`}>
                      Additional instructions
                    </Label>
                    <Input
                      id={`medicines.${index}.instructions`}
                      {...form.register(`medicines.${index}.instructions`)}
                      placeholder="Drink plenty of water"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border p-4">
            <FormCheckbox
              control={form.control}
              name="follow_up_required"
              label="Patient needs to come again"
              description="Enable this if you want to schedule a follow-up visit."
            />
            {form.watch("follow_up_required") && (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <FormInput
                  control={form.control}
                  name="follow_up_date"
                  label="Follow-up date"
                  type="date"
                />
                <FormInput
                  control={form.control}
                  name="follow_up_notes"
                  label="Follow-up notes"
                  placeholder="Return if symptoms persist or worsen"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700"
              loading={mutation.isPending}
            >
              {isEditingCompletedAppointment
                ? "Save Prescription Changes"
                : "Mark as Completed"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
