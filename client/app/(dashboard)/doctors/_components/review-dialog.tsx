"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FormTextarea } from "@/components/form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import { showError, showSuccess } from "@/lib/notifications";
import { type ReviewValues, reviewSchema } from "@/schemas/review";

interface ReviewDialogProps {
  doctorId: number;
  doctorName: string;
  children?: React.ReactNode;
}

export function ReviewDialog({ doctorId, doctorName, children }: ReviewDialogProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<ReviewValues>({
    resolver: zodResolver(reviewSchema) as any,
    defaultValues: {
      rating: 5,
      comment: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: ReviewValues) => {
      return api.post("/reviews/", {
        doctor: doctorId,
        rating: values.rating,
        comment: values.comment,
      });
    },
    onSuccess: () => {
      showSuccess("Review submitted successfully!");
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["reviews", doctorId] });
      setOpen(false);
      form.reset();
    },
    onError: (err: any) => {
      showError(err);
    },
  });

  const onSubmit = (values: any) => {
    mutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            Leave a Review
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Review {doctorName}</DialogTitle>
          <DialogDescription>
            Share your experience with this doctor to help other patients.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="rating">Rating</Label>
            <Controller
              control={form.control}
              name="rating"
              render={({ field }) => (
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => field.onChange(star)}
                      className={`transition-colors focus:outline-none ${
                        star <= field.value ? "text-yellow-500" : "text-gray-300"
                      }`}
                    >
                      <Star className="h-6 w-6 fill-current" />
                    </button>
                  ))}
                </div>
              )}
            />
          </div>

          <FormTextarea
            control={form.control}
            name="comment"
            label="Your Review"
            placeholder="Tell us about your experience..."
            className="min-h-[100px]"
          />

          <DialogFooter>
            <Button
              type="submit"
              disabled={mutation.isPending}
              loading={mutation.isPending}
            >
              Submit Review
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
