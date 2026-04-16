"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTablePagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import type { Doctor } from "@/types";
import { Award, Briefcase, Star, User } from "lucide-react";
import { BookAppointmentDialog } from "../../appointments/_components/book-appointment-dialog";
import { DoctorReviewsDialog } from "./doctor-reviews-dialog";

interface DoctorListProps {
  doctors: Doctor[];
  isLoading: boolean;
  count?: number;
  page?: number;
  onPageChange?: (page: number) => void;
}

const ITEMS_PER_PAGE = 12;

export function DoctorList({
  doctors,
  isLoading,
  count = 0,
  page = 1,
  onPageChange,
}: DoctorListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="p-0">
              <Skeleton className="h-48 w-full" />
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (doctors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <div className="rounded-full bg-primary/10 p-4">
          <User className="h-8 w-8 text-primary" />
        </div>
        <h3 className="mt-4 font-semibold text-xl">No doctors found</h3>
        <p className="mt-2 text-muted-foreground">Try adjusting your search criteria.</p>
      </div>
    );
  }

  const totalPages = Math.ceil(count / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {doctors.map((doctor) => (
          <Card
            key={doctor.id}
            className="group flex flex-col overflow-hidden pt-0 transition-all hover:shadow-lg"
          >
            <CardHeader className="relative h-48 overflow-hidden bg-muted p-0">
              <Avatar className="h-full w-full rounded-none">
                <AvatarImage
                  src={doctor.profile_picture || ""}
                  alt={doctor.doctor_name}
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <AvatarFallback className="rounded-none">
                  <div className="flex h-full w-full items-center justify-center bg-muted">
                    <User className="h-12 w-12 text-muted-foreground/50" />
                  </div>
                </AvatarFallback>
              </Avatar>
              <div className="absolute right-4 bottom-4">
                <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                  ${doctor.consultation_fee} / session
                </Badge>
              </div>
            </CardHeader>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{doctor.doctor_name}</CardTitle>
                  <CardDescription className="font-medium text-primary">
                    {doctor.specialization}
                  </CardDescription>
                </div>
                <DoctorReviewsDialog doctorId={doctor.id} doctorName={doctor.doctor_name}>
                  <div className="flex cursor-pointer items-center rounded-md p-1 text-yellow-500 transition-colors hover:bg-muted/50">
                    <Star
                      className={`mr-1 h-4 w-4 ${doctor.average_rating ? "fill-current" : "text-gray-300"}`}
                    />
                    <span className="font-bold text-foreground text-sm">
                      {doctor.average_rating ? doctor.average_rating.toFixed(1) : "New"}
                    </span>
                    {doctor.total_reviews ? (
                      <span className="ml-1 text-muted-foreground text-xs">
                        ({doctor.total_reviews})
                      </span>
                    ) : null}
                  </div>
                </DoctorReviewsDialog>
              </div>
            </CardHeader>
            <CardContent className="flex-1 pb-4">
              <div className="grid grid-cols-2 gap-4 text-muted-foreground text-sm">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  <span>{doctor.experience_years} years exp.</span>
                </div>
                {(doctor?.average_rating ?? 0) > 4.5 && (
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    <span>Top Rated</span>
                  </div>
                )}
              </div>
              {doctor.bio && (
                <p className="mt-4 line-clamp-2 text-muted-foreground text-sm leading-relaxed">
                  {doctor.bio}
                </p>
              )}
            </CardContent>
            <CardFooter className="pt-0">
              <BookAppointmentDialog doctorId={doctor.id.toString()}>
                <Button className="w-full">Book Appointment</Button>
              </BookAppointmentDialog>
            </CardFooter>
          </Card>
        ))}
      </div>

      {totalPages > 1 && onPageChange && (
        <DataTablePagination
          page={page}
          pageSize={ITEMS_PER_PAGE}
          totalCount={count}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
