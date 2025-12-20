"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
import { Patient } from "@/types";
import { format } from "date-fns";
import { Calendar, Mail, Phone } from "lucide-react";
import Link from "next/link";

export function PatientList({
  patients,
  isLoading,
  count,
  page,
  onPageChange,
}: {
  patients: Patient[];
  isLoading: boolean;
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

  if (patients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 rounded-lg border-2 border-dashed border-border bg-card/50">
        <p className="text-muted-foreground font-medium">No patients found.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-[300px]">Patient</TableHead>
            <TableHead>Contact Information</TableHead>
            <TableHead>Blood Group</TableHead>
            <TableHead>Date of Birth</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient) => {
            const fullName = `${patient.user.first_name} ${patient.user.last_name}`;
            const initials = `${patient.user.first_name[0]}${patient.user.last_name[0]}`;
            
            return (
              <TableRow key={patient.id} className="group hover:bg-muted/30 transition-colors">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-border group-hover:border-primary/50 transition-colors">
                      <AvatarFallback className="bg-primary/5 text-primary font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">{fullName}</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Patient #{patient.id}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Mail className="h-3 w-3 mr-2 text-primary/70" />
                      {patient.user.email}
                    </div>
                    {patient.user.phone && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Phone className="h-3 w-3 mr-2 text-primary/70" />
                        {patient.user.phone}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                   {patient.blood_group ? (
                     <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-100 uppercase">
                       {patient.blood_group}
                     </span>
                   ) : (
                     <span className="text-xs text-muted-foreground italic">Not specified</span>
                   )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-2 text-primary/70" />
                    {patient.date_of_birth ? format(new Date(patient.date_of_birth), "PP") : "Not specified"}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={`/dashboard/appointments?patient_id=${patient.id}`}>
                      View Appointments
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
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
