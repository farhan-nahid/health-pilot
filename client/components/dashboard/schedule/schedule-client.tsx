"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAvailability } from "@/hooks/use-availability";
import { showError, showSuccess } from "@/lib/notifications";
import { Clock, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export function ScheduleClient() {
  const { availability, isLoading, updateAvailability, deleteSlot } = useAvailability();

  console.log(availability);

  const [newDay, setNewDay] = useState<string>("monday");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");

  const handleAddSlot = async () => {
    try {
      await updateAvailability.mutateAsync([
        {
          day_of_week: newDay as any,
          start_time: startTime,
          end_time: endTime,
          is_available: true,
        },
      ]);
      showSuccess("Availability slot added!");
    } catch (err: any) {
      showError(err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteSlot.mutateAsync(id);
      showSuccess("Slot removed.");
    } catch (err: any) {
      showError(err);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Schedule</h1>
        <p className="text-muted-foreground">
          Manage your weekly availability for patient appointments.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add New Slot</CardTitle>
            <CardDescription>
              Configure a new recurring availability slot.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Day of Week</Label>
              <Select value={newDay} onValueChange={setNewDay}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map((day) => (
                    <SelectItem key={day} value={day} className="capitalize">
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            <Button
              className="w-full"
              onClick={handleAddSlot}
              loading={updateAvailability.isPending}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Slot
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Slots</CardTitle>
            <CardDescription>Your current weekly schedule.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <p className="text-center py-4 text-muted-foreground">Loading slots...</p>
              ) : availability.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed rounded-lg bg-muted/30">
                  <Clock className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No slots configured yet.
                  </p>
                </div>
              ) : (
                availability.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-bold capitalize">{slot.day_of_week}</p>
                      <p className="text-xs text-muted-foreground">
                        {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(slot.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
