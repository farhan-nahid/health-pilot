import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { AvailabilitySlot } from "@/types";

export function useAvailability() {
  const queryClient = useQueryClient();

  const { data: availability, isLoading } = useQuery<AvailabilitySlot[]>({
    queryKey: ["availability"],
    queryFn: async () => {
      const { data } = await api.get("/doctor-availability/");
      return data?.results;
    },
  });

  const updateAvailability = useMutation({
    mutationFn: async (slots: Partial<AvailabilitySlot>[]) => {
      // If we have IDs, we should update. If not, create.
      // For simplicity in this UI, we might just replace slots or handle individually.
      // The backend supports bulk create if we send a list.
      return api.post("/doctor-availability/", slots);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availability"] });
    },
  });

  const deleteSlot = useMutation({
    mutationFn: async (id: number) => {
      return api.delete(`/doctor-availability/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availability"] });
    },
  });

  return {
    availability: availability || [],
    isLoading,
    updateAvailability,
    deleteSlot,
  };
}
