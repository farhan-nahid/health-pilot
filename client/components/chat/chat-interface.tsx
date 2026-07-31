"use client";

import { format } from "date-fns";
import { Loader2, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useChatMessages, useSendMessage } from "@/hooks/use-chat";
import { useUser } from "@/hooks/use-user";
import type { Appointment, ChatMessage } from "@/types";

interface ChatInterfaceProps {
  appointment: Appointment;
}

export function ChatInterface({ appointment }: ChatInterfaceProps) {
  const { user } = useUser();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useChatMessages(appointment.id);
  const sendMessageMutation = useSendMessage();
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Flatten and reverse messages for display (oldest at top, newest at bottom)
  const allMessages =
    data?.pages
      .flatMap((page) => page.results)
      .sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      ) || [];

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  // 1. Initial scroll on load
  useEffect(() => {
    if (!isLoading && allMessages.length > 0) {
      // Immediate scroll and one after a short delay for Firefox
      scrollToBottom();
      const timer = setTimeout(scrollToBottom, 50);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // 2. MutationObserver to handle all content changes (including new messages)
  useEffect(() => {
    if (!scrollRef.current) return;

    const observer = new MutationObserver(() => {
      // We only want to auto-scroll if we're not currently fetching older pages
      if (!isFetchingNextPage) {
        // Double scroll strategy for Firefox: immediate + next frame
        scrollToBottom();
        requestAnimationFrame(scrollToBottom);
      }
    });

    observer.observe(scrollRef.current, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, [isFetchingNextPage]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await sendMessageMutation.mutateAsync({
        appointment: appointment.id,
        message: newMessage,
      });
      setNewMessage("");
      // Force one more scroll after send for good measure
      requestAnimationFrame(scrollToBottom);
    } catch (error: any) {
      console.error("Failed to send message:", error?.response?.data || error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isMyMessage = (msg: ChatMessage) => {
    if (!user) return false;
    if (user.user_type === "patient") {
      return msg.patient !== null;
    }
    return msg.doctor !== null;
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border bg-background">
      <div className="flex shrink-0 items-center gap-3 border-b bg-muted/30 p-4">
        <Avatar className="h-8 w-8">
          {user?.user_type === "doctor" ? (
            <AvatarFallback>{appointment.patient_name[0]}</AvatarFallback>
          ) : (
            <>
              <AvatarImage src={appointment.doctor_details.profile_picture || ""} />
              <AvatarFallback>
                {(appointment.doctor_details?.doctor_name || "D")[0]}
              </AvatarFallback>
            </>
          )}
        </Avatar>
        <div>
          <h3 className="font-semibold text-sm">
            {user?.user_type === "doctor"
              ? appointment.patient_name
              : appointment.doctor_details?.doctor_name
                ? `Dr. ${appointment.doctor_details.doctor_name}`
                : "Doctor"}
          </h3>
          <p className="text-[10px] text-muted-foreground uppercase">
            {user?.user_type === "doctor"
              ? "Patient"
              : appointment.doctor_details?.specialization}
          </p>
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {hasNextPage && (
            <div className="flex justify-center py-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="h-7 text-[10px] text-muted-foreground"
              >
                {isFetchingNextPage ? (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                ) : null}
                Load older messages
              </Button>
            </div>
          )}

          {allMessages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center py-10 text-muted-foreground">
              <p className="text-sm">No messages yet.</p>
              <p className="text-xs">Start the conversation below.</p>
            </div>
          )}
          {allMessages.map((msg) => {
            const mine = isMyMessage(msg);
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${mine ? "flex-row-reverse" : "flex-row"}`}
              >
                {!mine && (
                  <Avatar className="mt-1 h-8 w-8">
                    {msg.doctor ? (
                      <>
                        <AvatarImage
                          src={appointment.doctor_details.profile_picture || ""}
                        />
                        <AvatarFallback>
                          {(appointment.doctor_details?.doctor_name || "D")[0]}
                        </AvatarFallback>
                      </>
                    ) : (
                      <AvatarFallback>{appointment.patient_name[0]}</AvatarFallback>
                    )}
                  </Avatar>
                )}
                <div
                  className={`flex flex-col ${mine ? "items-end" : "items-start"} max-w-[75%]`}
                >
                  <div
                    className={`rounded-2xl p-3 ${
                      mine
                        ? "rounded-tr-none bg-primary text-primary-foreground"
                        : "rounded-tl-none bg-muted text-foreground"
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {msg.message}
                    </p>
                  </div>
                  <span className="mt-1 px-1 text-[10px] text-muted-foreground">
                    {format(new Date(msg.created_at), "p")}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} className="h-px w-full" />
        </div>
      </ScrollArea>

      <div className="shrink-0 border-t bg-background p-4">
        <form onSubmit={handleSend} className="flex flex-col gap-2">
          <div className="flex items-end gap-2">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="max-h-[120px] min-h-[40px] flex-1 border-none bg-muted/50 py-2.5 focus-visible:ring-1 focus-visible:ring-primary"
              rows={1}
            />
            <Button
              type="submit"
              size="icon"
              className="mb-1 shrink-0"
              disabled={!newMessage.trim() || sendMessageMutation.isPending}
            >
              {sendMessageMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
