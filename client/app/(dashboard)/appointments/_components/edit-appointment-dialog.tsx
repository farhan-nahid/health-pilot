"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FormSelect, FormTextarea } from "@/components/form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SelectItem } from "@/components/ui/select";
import { TIME_SLOTS } from "@/constants";
import { useDoctors } from "@/hooks/use-doctors";
import api from "@/lib/api";
import { showError, showSuccess } from "@/lib/notifications";
import { cn } from "@/lib/utils";
import { type AppointmentValues, appointmentSchema } from "@/schemas/appointment";
import type { Appointment } from "@/types";

export function EditAppointmentDialog({
  appointment,
  open,
  onOpenChange,
  onSuccess,
}: {
  appointment: Appointment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [error, setError] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const { doctors, isLoading: loadingDoctors } = useDoctors();

  const form = useForm<AppointmentValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      doctor: appointment.doctor.toString(),
      appointment_date: new Date(appointment.appointment_date),
      appointment_time: appointment.appointment_time.substring(0, 5),
      symptoms: appointment.symptoms,
    },
  });

  // Reset form when appointment changes or dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        doctor: appointment.doctor.toString(),
        appointment_date: new Date(appointment.appointment_date),
        appointment_time: appointment.appointment_time.substring(0, 5),
        symptoms: appointment.symptoms,
      });
    }
  }, [appointment, open, form]);

  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      return api.patch(`/appointments/${appointment.id}/`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      showSuccess("Appointment updated successfully!");
      onOpenChange(false);
      onSuccess();
    },
    onError: (err: any) => {
      showError(err);
      setError(
        err.response?.data?.non_field_errors?.[0] ||
          err.message ||
          "Failed to update appointment",
      );
    },
  });

  const onSubmit = async (values: AppointmentValues) => {
    setError(null);
    mutation.mutate({
      doctor: parseInt(values.doctor, 10),
      appointment_date: format(values.appointment_date, "yyyy-MM-dd"),
      appointment_time: `${values.appointment_time}:00`,
      symptoms: values.symptoms,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Edit Appointment</DialogTitle>
          <DialogDescription>
            Modify your consultation details or reschedule.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <FormSelect
            control={form.control}
            name="doctor"
            label="Doctor"
            placeholder={loadingDoctors ? "Loading..." : "Select doctor"}
          >
            {doctors.map((doc: any) => (
              <SelectItem key={doc.id} value={doc.id.toString()}>
                {doc.doctor_name} ({doc.specialization})
              </SelectItem>
            ))}
          </FormSelect>
          <div className="grid grid-cols-6 gap-4">
            <Controller
              control={form.control}
              name="appointment_date"
              render={({ field, fieldState }) => (
                <Field className="col-span-4" data-invalid={fieldState.invalid}>
                  <FieldLabel>Date</FieldLabel>
                  <FieldContent>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            <span suppressHydrationWarning>
                              {format(field.value, "PPP")}
                            </span>
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          disabled={(date) => date < new Date() || date.getDay() === 0}
                        />
                      </PopoverContent>
                    </Popover>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </FieldContent>
                </Field>
              )}
            />

            <div className="col-span-2">
              <FormSelect
                control={form.control}
                name="appointment_time"
                label="Time Slot"
              >
                {TIME_SLOTS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </FormSelect>
            </div>
          </div>
          <FormTextarea control={form.control} name="symptoms" label="Symptoms" />
          {error && (
            <div className="rounded border border-destructive/20 bg-destructive/10 p-2 font-medium text-destructive text-sm">
              {error}
            </div>
          )}
          <DialogFooter>
            <Button type="submit" className="w-full" loading={mutation.isPending}>
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
