"use client";

import { ReviewDialog } from "@/app/(dashboard)/doctors/_components/review-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import api from "@/lib/api";
import { showError, showSuccess } from "@/lib/notifications";
import type { PaginatedResponse, Review } from "@/types";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Pencil, Star, Trash2, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

interface ReviewListProps {
  doctorId?: number; // Filter by doctor
  patientId?: number; // Filter by patient
  doctorName?: string; // For adding reviews
}

export function ReviewList({ doctorId, patientId, doctorName }: ReviewListProps) {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["reviews", { doctorId, patientId }],
      queryFn: async ({ pageParam = 1 }) => {
        const params = new URLSearchParams();
        if (doctorId) params.append("doctor_id", doctorId.toString());
        if (patientId) params.append("patient_id", patientId.toString());
        params.append("page", pageParam.toString());

        const response = await api.get<PaginatedResponse<Review>>(
          `/reviews/?${params.toString()}`,
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

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/reviews/${id}/`);
    },
    onSuccess: () => {
      showSuccess("Review deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      setDeleteId(null);
    },
    onError: (err: any) => {
      showError(err);
      setDeleteId(null);
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
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex justify-center p-8 text-muted-foreground">
          Loading reviews...
        </div>
      ) : reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <p>No reviews found.</p>
          <p className="text-sm">Be the first to share your experience!</p>
        </div>
      ) : (
        <>
          {reviews.map((review) => (
            <div key={review.id} className="flex gap-4 border-b pb-4 last:border-0">
              <Avatar className="h-10 w-10 border">
                <AvatarImage src={review.patient_image || ""} />
                <AvatarFallback>
                  <User className="h-5 w-5 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm">{review.patient_name}</h4>
                  <span className="text-muted-foreground text-xs">
                    {formatDistanceToNow(new Date(review.created_at), {
                      addSuffix: true,
                    })}
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
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {review.comment}
                </p>

                {/* Edit/Delete Actions */}
                {user?.patient_profile?.id === review.patient && (
                  <div className="flex gap-2 pt-2">
                    {/* We need doctorName and doctorId to open the dialog. 
                                Ideally review object should have doctor info if we are listing ALL reviews.
                                But for now, if we are in doctor context we have props. 
                                If we are in patient context, we might lack doctor info in this specific review object unless we expand serializer. 
                                Assuming patient can only edit in doctor context or if we solve this.
                                
                                Wait, if I am listing MY reviews, I need to know which doctor it was for to edit it?
                                The ReviewDialog expects doctorId.
                                The Review object currently has 'doctor' ID field. 
                                It DOES NOT have doctor name in current serializer.
                            */}

                    <ReviewDialog
                      doctorId={review.doctor || doctorId!}
                      doctorName={doctorName || "Doctor"} // Fallback if listing all
                      existingReview={review}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="mr-1 h-3 w-3" /> Edit
                      </Button>
                    </ReviewDialog>

                    <AlertDialog
                      open={deleteId === review.id}
                      onOpenChange={(open) => setDeleteId(open ? review.id : null)}
                    >
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 text-destructive hover:text-destructive/80"
                        >
                          <Trash2 className="mr-1 h-3 w-3" /> Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete
                            your review.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate(review.id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            {deleteMutation.isPending ? "Deleting..." : "Delete"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
            </div>
          ))}

          {hasNextPage && (
            <div ref={ref} className="flex justify-center p-4">
              {isFetchingNextPage ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <span className="text-muted-foreground text-sm">Load more</span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
