"use client";

import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { useDoctors } from "@/hooks/use-doctors";
import { Search } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";
import { useState } from "react";
import { DoctorList } from "./doctor-list";

export function DoctorsClient() {
  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ shallow: false }),
  );
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const { doctors, count, isLoading } = useDoctors(debouncedSearch, page);

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
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="pl-9"
        />
      </div>

      <DoctorList
        doctors={doctors}
        isLoading={isLoading}
        count={count}
        page={page}
        onPageChange={setPage}
      />
    </div>
  );
}
