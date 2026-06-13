"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import * as React from "react";
import { useInView } from "react-intersection-observer";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useDebounce } from "@/hooks/use-debounce";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Doctor, PaginatedResponse } from "@/types";

interface DoctorComboboxProps {
  value?: string;
  onChange: (value: string) => void;
  modal?: boolean;
  specialization?: string;
  disabled?: boolean;
}

export function DoctorCombobox({
  value,
  onChange,
  modal = false,
  specialization,
  disabled = false,
}: DoctorComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const { ref, inView } = useInView();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["doctors", "infinite", debouncedSearch, specialization],
      queryFn: async ({ pageParam = 1 }) => {
        const params = new URLSearchParams({
          page: pageParam.toString(),
        });
        if (debouncedSearch) {
          params.append("search", debouncedSearch);
        }
        if (specialization && specialization !== "all") {
          params.append("specialization", specialization);
        }
        const response = await api.get<PaginatedResponse<Doctor>>(
          `/doctors/?${params.toString()}`,
        );
        return response.data;
      },
      initialPageParam: 1,
      getNextPageParam: (lastPage) => {
        if (lastPage.next) {
          const url = new URL(lastPage.next);
          const page = url.searchParams.get("page");
          return page ? parseInt(page, 10) : undefined;
        }
        return undefined;
      },
    });

  React.useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage]);

  const doctors = data?.pages.flatMap((page) => page.results) || [];
  const selectedDoctor = doctors.find((doctor) => doctor.id.toString() === value);

  // If we have a value but the doctor isn't in the loaded list (e.g. initial load),
  // we might want to fetch that specific doctor or handle it.
  // For now, we'll just display the ID or wait until it loads if possible,
  // but ideally the parent should provide the initial doctor object or we fetch it.
  // However, for booking new appointment, usually we start empty.

  return (
    <Popover open={open} onOpenChange={setOpen} modal={modal}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedDoctor
            ? `${selectedDoctor.doctor_name} (${selectedDoctor.specialization})`
            : value
              ? "Loading doctor..." // Fallback if selected but not in list yet
              : "Select doctor..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="popover-trigger-width p-0" align="start">
        <Command shouldFilter={false}>
          {/* shouldFilter={false} because we filter on server */}
          <CommandInput
            placeholder="Search doctor..."
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            <CommandEmpty>No doctor found.</CommandEmpty>
            <CommandGroup>
              {doctors.map((doctor) => (
                <CommandItem
                  key={doctor.id}
                  value={doctor.id.toString()} // CommandItem expects string value
                  // disabled={false}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === doctor.id.toString() ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{doctor.doctor_name}</span>
                    <span className="text-muted-foreground text-xs">
                      {doctor.specialization} • ${doctor.consultation_fee}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>

            {/* Loading / Infinite scroll indicator */}
            <div ref={ref} className="p-2 text-center text-muted-foreground text-xs">
              {isFetchingNextPage ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" /> Loading more...
                </div>
              ) : hasNextPage ? (
                "Load more"
              ) : null}
            </div>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
