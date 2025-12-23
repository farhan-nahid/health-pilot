import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import api from "@/lib/api";
import type { PaginatedResponse, Review } from "@/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Star, User } from "lucide-react";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { ReviewDialog } from "./review-dialog";

interface DoctorReviewsDialogProps {
  doctorId: number;
  doctorName: string;
  children?: React.ReactNode;
}

export function DoctorReviewsDialog({ doctorId, doctorName, children }: DoctorReviewsDialogProps) {
  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage, 
    isLoading 
  } = useInfiniteQuery({
    queryKey: ["reviews", doctorId],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.get<PaginatedResponse<Review>>(`/reviews/?doctor_id=${doctorId}&page=${pageParam}`);
      return response.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.next) {
        const url = new URL(lastPage.next);
        const page = url.searchParams.get("page");
        return page ? parseInt(page) : undefined;
      }
      return undefined;
    },
  });

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage]);

  const reviews = data?.pages.flatMap((page: any) => page.results) || [];

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || <Button variant="link">View Reviews</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Reviews for {doctorName}</DialogTitle>
              <DialogDescription>
                See what patients are saying about their experience.
              </DialogDescription>
            </div>
            <ReviewDialog doctorId={doctorId} doctorName={doctorName}>
              <Button size="sm">Write a Review</Button>
            </ReviewDialog>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[400px] pr-4">
          {isLoading ? (
            <div className="flex justify-center p-8 text-muted-foreground">Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <p>No reviews yet.</p>
              <p className="text-sm">Be the first to share your experience!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="flex gap-4">
                  <Avatar className="h-10 w-10 border">
                    <AvatarImage src={review.patient_image || ""} />
                    <AvatarFallback>
                      <User className="h-5 w-5 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm">{review.patient_name}</h4>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="flex items-center text-yellow-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${i < review.rating ? "fill-current" : "text-gray-200"}`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                </div>
              ))}
              
              {hasNextPage && (
                <div ref={ref} className="flex justify-center p-4">
                  {isFetchingNextPage ? (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  ) : (
                    <span className="text-sm text-muted-foreground">Load more</span>
                  )}
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
