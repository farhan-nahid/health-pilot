"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DataTablePagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Appointment } from "@/types";
import { format } from "date-fns";
import { AppointmentActions } from "./appointment-actions";

const statusVariants: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  accepted: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-amber-800",
  rejected: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800",
  completed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  cancelled: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800",
};

export function AppointmentList({
  appointments,
  isLoading,
  onRefresh,
  userType,
  count,
  page,
  onPageChange,
}: {
  appointments: Appointment[];
  isLoading: boolean;
  onRefresh: () => void;
  userType?: "doctor" | "patient";
  count: number;
  page: number;
  onPageChange: (page: number) => void;
}) {
  if (isLoading) {
    return (
      <div className="rounded-md border border-border bg-card">
        <div className="p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 rounded-lg border-2 border-dashed border-border bg-card/50">
        <p className="text-muted-foreground font-medium">No appointments found.</p>
        <p className="text-sm text-muted-foreground mt-1">Book your first session to get started.</p>
      </div>
    );
  }

  const isDoctor = userType === "doctor";

  return (
    <div className="rounded-md border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-[250px]">{isDoctor ? "Patient" : "Doctor"}</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="max-w-[200px]">Symptoms</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map((apt) => (
            <TableRow key={apt.id} className="cursor-default">
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    {isDoctor ? (
                        <AvatarFallback>{apt.patient_name[0]}</AvatarFallback>
                    ) : (
                        <AvatarImage src={apt.doctor_details.profile_picture || ""} />
                    )}
                    {!isDoctor && <AvatarFallback>{apt.doctor_details.doctor_name[0]}</AvatarFallback>}
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">{isDoctor ? apt.patient_name : apt.doctor_details.doctor_name}</span>
                    {!isDoctor && (
                        <span className="text-[10px] text-muted-foreground uppercase">{apt.doctor_details.specialization}</span>
                    )}
                    {isDoctor && (
                         <span className="text-[10px] text-muted-foreground uppercase">{apt.patient_details?.user?.phone || "No phone"}</span>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-sm" suppressHydrationWarning>{format(new Date(apt.appointment_date), "PPP")}</span>
                  <span className="text-xs text-muted-foreground">{apt.appointment_time}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border",
                  statusVariants[apt.status]
                )}>
                  {apt.status}
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground truncate max-w-[200px]">
                {apt.symptoms}
              </TableCell>
              <TableCell>
                <AppointmentActions 
                  appointment={apt} 
                  onRefresh={onRefresh} 
                  userType={userType}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <DataTablePagination
        page={page}
        pageSize={10}
        totalCount={count}
        onPageChange={onPageChange}
      />
    </div>
  );
}
