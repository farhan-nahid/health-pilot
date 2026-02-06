"use client";

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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field";
import { Form, FormControl } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TIME_SLOTS } from "@/constants";
import { useDependents } from "@/hooks/use-dependents";
import { useDoctors } from "@/hooks/use-doctors";
import api from "@/lib/api";
import { showError, showSuccess } from "@/lib/notifications";
import { cn } from "@/lib/utils";
import { type AppointmentValues, appointmentSchema } from "@/schemas/appointment";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Plus } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { DoctorCombobox } from "./doctor-combobox";

export function BookAppointmentDialog({
  onSuccess,
  doctorId,
  children,
}: {
  onSuccess?: () => void;
  doctorId?: string;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const { doctors, isLoading: loadingDoctors } = useDoctors();
  const { dependents } = useDependents();

  const form = useForm<AppointmentValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      doctor: doctorId || "",
      symptoms: "",
      appointment_time: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      return api.post("/appointments/", payload);
    },
    onSuccess: () => {
      showSuccess("Appointment booked successfully! Waiting for doctor's approval.");
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      setOpen(false);
      form.reset();
      if (onSuccess) onSuccess();
    },
    onError: (err: any) => {
      showError(err);
      setError(
        err.response?.data?.non_field_errors?.[0] ||
          err.message ||
          "Failed to book appointment",
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
      dependent_id: values.dependent_id ? parseInt(values.dependent_id) : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="font-semibold">
            <Plus className="mr-2 h-4 w-4" />
            Book Appointment
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Book a New Appointment</DialogTitle>
          <DialogDescription>
            Choose a doctor and pick a time slot for your consultation.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <Controller
              control={form.control}
              name="doctor"
              render={({ field }) => (
                <div className="space-y-2">
                   <Controller
                    control={form.control}
                    name="dependent_id"
                    render={({ field }) => (
                      <div className="space-y-2">
                        <Label>For Family Member</Label>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                         <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Booking for myself" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Myself</SelectItem>
                            {dependents.map((dep) => (
                              <SelectItem key={dep.id} value={dep.id.toString()}>
                                {dep.name} ({dep.relationship})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  />

                  <Label>Select Doctor</Label>
                  <DoctorCombobox
                    value={field.value}
                    onChange={field.onChange}
                    modal={true}
                  />
                  {form.formState.errors.doctor && (
                    <p className="font-medium text-destructive text-sm">
                      {form.formState.errors.doctor.message}
                    </p>
                  )}
                </div>
              )}
            />

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
                  placeholder="Select an slot"
                >
                  {TIME_SLOTS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </FormSelect>
              </div>
            </div>

            <FormTextarea
              control={form.control}
              name="symptoms"
              label="Symptoms"
              placeholder="Briefly describe what you're feeling..."
            />

            {error && (
              <div className="rounded border border-destructive/20 bg-destructive/10 p-2 font-medium text-destructive text-sm">
                {error}
              </div>
            )}
            <DialogFooter>
              <Button type="submit" className="w-full" loading={mutation.isPending}>
                Confirm Booking
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
