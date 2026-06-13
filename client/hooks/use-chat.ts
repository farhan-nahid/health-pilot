"use client";

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { ChatMessage, PaginatedResponse, SendMessagePayload } from "@/types";

export function useChatMessages(appointmentId: number | string | null) {
  return useInfiniteQuery({
    queryKey: ["chat-messages", appointmentId],
    queryFn: async ({ pageParam = 1 }) => {
      if (!appointmentId) return { count: 0, next: null, previous: null, results: [] };
      const { data } = await api.get<PaginatedResponse<ChatMessage>>(
        `/chat/${appointmentId}/messages/?page=${pageParam}`,
      );
      return data;
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
    enabled: !!appointmentId,
    refetchInterval: 5000,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SendMessagePayload) => {
      const { data } = await api.post("/chat/send/", payload);
      return data as ChatMessage;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["chat-messages", variables.appointment],
      });
    },
  });
}
