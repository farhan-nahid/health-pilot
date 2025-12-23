"use client";

import { Input } from "@/components/ui/input";
import { useDoctors } from "@/hooks/use-doctors";
import { Search } from "lucide-react";
import { useState } from "react";
import { DoctorList } from "./doctor-list";

export function DoctorsClient() {
  const { doctors, isLoading } = useDoctors();
  const [search, setSearch] = useState("");

  const filteredDoctors = doctors.filter((doctor) => {
    const fullName = doctor.doctor_name.toLowerCase();
    const specialization = doctor.specialization.toLowerCase();
    const query = search.toLowerCase();
    return fullName.includes(query) || specialization.includes(query);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-bold text-2xl tracking-tight">Doctors</h1>
          <p className="text-muted-foreground">
            Find and connect with healthcare specialists.
          </p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or specialization..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <DoctorList doctors={filteredDoctors} isLoading={isLoading} />
    </div>
  );
}
