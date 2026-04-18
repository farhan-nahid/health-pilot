"use client";

import { Search } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { usePatients } from "@/hooks/use-patient";
import { PatientList } from "./patient-list";

export function PatientsClient() {
  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ shallow: false }),
  );
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const { patients, count, isLoading } = usePatients(debouncedSearch, page);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-bold text-2xl tracking-tight">Patients</h1>
          <p className="text-muted-foreground">
            Manage and view details of all registered patients.
          </p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search patients by name or email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="pl-9"
        />
      </div>

      <PatientList
        patients={patients}
        isLoading={isLoading}
        count={count}
        page={page}
        onPageChange={setPage}
      />
    </div>
  );
}
