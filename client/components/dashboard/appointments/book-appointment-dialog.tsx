"use client"

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
import {
    Field,
    FieldContent,
    FieldError, FieldLabel
} from "@/components/ui/field";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { SelectItem } from "@/components/ui/select";
import { useDoctors } from "@/hooks/use-doctors";
import api from "@/lib/api";
import { showError, showSuccess } from "@/lib/notifications";
import { cn } from "@/lib/utils";
import { appointmentSchema, AppointmentValues } from "@/schemas/appointment";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Plus } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00"
];

export function BookAppointmentDialog({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const { doctors, isLoading: loadingDoctors } = useDoctors();

  const form = useForm<AppointmentValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      doctor: "",
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
      setError(err.response?.data?.non_field_errors?.[0] || err.message || "Failed to book appointment");
    },
  });

  const onSubmit = async (values: AppointmentValues) => {
    setError(null);
    mutation.mutate({
      doctor: parseInt(values.doctor),
      appointment_date: format(values.appointment_date, "yyyy-MM-dd"),
      appointment_time: `${values.appointment_time}:00`,
      symptoms: values.symptoms,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="font-semibold">
          <Plus className="mr-2 h-4 w-4" />
          Book Appointment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Book a New Appointment</DialogTitle>
          <DialogDescription>
            Choose a doctor and pick a time slot for your consultation.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <FormSelect
            control={form.control}
            name="doctor"
            label="Select Doctor"
            placeholder={loadingDoctors ? "Loading doctors..." : "Select a doctor"}
          >
            {doctors.map((doc) => (
              <SelectItem key={doc.id} value={doc.id.toString()}>
                {doc.doctor_name} ({doc.specialization})
              </SelectItem>
            ))}
          </FormSelect>

          <div className="grid grid-cols-2 gap-4">
            <Controller
              control={form.control}
              name="appointment_date"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Date</FieldLabel>
                  <FieldContent>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            <span suppressHydrationWarning>{format(field.value, "PPP")}</span>
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
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </FieldContent>
                </Field>
              )}
            />

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

          <FormTextarea
            control={form.control}
            name="symptoms"
            label="Symptoms"
            placeholder="Briefly describe what you're feeling..."
          />

          {error && (
            <div className="text-destructive text-sm font-medium bg-destructive/10 p-2 rounded border border-destructive/20">
              {error}
            </div>
          )}
          <DialogFooter>
            <Button type="submit" className="w-full" loading={mutation.isPending}>
              Confirm Booking
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
