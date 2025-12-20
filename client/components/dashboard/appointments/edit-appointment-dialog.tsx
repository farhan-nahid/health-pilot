"use client"

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
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Appointment } from "@/hooks/use-appointments";
import { useDoctors } from "@/hooks/use-doctors";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00"
];

export function EditAppointmentDialog({ 
  appointment, 
  open, 
  onOpenChange, 
  onSuccess 
}: { 
  appointment: Appointment; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [date, setDate] = useState<Date | undefined>(new Date(appointment.appointment_date));
  const [doctor, setDoctor] = useState(appointment.doctor.toString());
  const [time, setTime] = useState(appointment.appointment_time.substring(0, 5));
  const [symptoms, setSymptoms] = useState(appointment.symptoms);
  const [error, setError] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const { doctors, isLoading: loadingDoctors } = useDoctors();

  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      return api.patch(`/appointments/${appointment.id}/`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      onOpenChange(false);
      onSuccess();
    },
    onError: (err: any) => {
      setError(err.response?.data?.non_field_errors?.[0] || err.message || "Failed to update appointment");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !doctor || !time || !symptoms) return;

    setError(null);
    mutation.mutate({
      doctor: parseInt(doctor),
      appointment_date: format(date, "yyyy-MM-dd"),
      appointment_time: `${time}:00`,
      symptoms: symptoms,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Appointment</DialogTitle>
          <DialogDescription>
            Modify your consultation details or reschedule.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-doctor">Doctor</Label>
            <Select value={doctor} onValueChange={setDoctor} required>
              <SelectTrigger className="w-full" id="edit-doctor">
                <SelectValue placeholder={loadingDoctors ? "Loading..." : "Select doctor"} />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((doc) => (
                  <SelectItem key={doc.id} value={doc.id.toString()}>
                    {doc.doctor_name} ({doc.specialization})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-6 gap-4">
            <div className="col-span-4 space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? <span suppressHydrationWarning>{format(date, "PPP")}</span> : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    disabled={(date) => date < new Date() || date.getDay() === 0}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="edit-time">Time Slot</Label>
              <Select value={time} onValueChange={setTime} required>
                <SelectTrigger className="w-full" id="edit-time">
                  <SelectValue placeholder="Time" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-symptoms">Symptoms</Label>
            <Textarea
              id="edit-symptoms"
              className="resize-none"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              required
            />
          </div>
          {error && (
            <div className="text-destructive text-sm font-medium bg-destructive/10 p-2 rounded border border-destructive/20">
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
