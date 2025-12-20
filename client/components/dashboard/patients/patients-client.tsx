"use client"

import { Input } from "@/components/ui/input";
import { usePatients } from "@/hooks/use-patient";
import { Search } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";
import { useState } from "react";
import { PatientList } from "./patient-list";

export function PatientsClient() {
  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ shallow: false })
  );
  const { patients, count, isLoading } = usePatients(page);
  const [search, setSearch] = useState("");

  const filteredPatients = patients.filter(patient => {
    const fullName = `${patient.user.first_name} ${patient.user.last_name}`.toLowerCase();
    const email = patient.user.email.toLowerCase();
    const query = search.toLowerCase();
    return fullName.includes(query) || email.includes(query);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Patients</h1>
          <p className="text-muted-foreground">
            Manage and view details of all registered patients.
          </p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search patients by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <PatientList 
        patients={filteredPatients} 
        isLoading={isLoading} 
        count={count}
        page={page}
        onPageChange={setPage}
      />
    </div>
  );
}
