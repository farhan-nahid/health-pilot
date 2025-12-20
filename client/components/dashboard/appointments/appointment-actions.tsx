"use client"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Appointment } from "@/hooks/use-appointments";
import api from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit, Eye, MoreHorizontal, Trash2, XCircle } from "lucide-react";
import { useState } from "react";
import { EditAppointmentDialog } from "./edit-appointment-dialog";
import { ViewAppointmentDialog } from "./view-appointment-dialog";

export function AppointmentActions({ 
  appointment, 
  onRefresh 
}: { 
  appointment: Appointment; 
  onRefresh: () => void;
}) {
  const [showView, setShowView] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showCancelAlert, setShowCancelAlert] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  const queryClient = useQueryClient();

  const cancelMutation = useMutation({
    mutationFn: async () => {
      return api.patch(`/appointments/${appointment.id}/`, { status: "cancelled" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      setShowCancelAlert(false);
      onRefresh();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return api.delete(`/appointments/${appointment.id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      setShowDeleteAlert(false);
      onRefresh();
    },
  });

  const isCancellable = ["pending", "accepted"].includes(appointment.status);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setShowView(true)}>
            <Eye className="mr-2 h-4 w-4" /> View details
          </DropdownMenuItem>
          {isCancellable && (
            <DropdownMenuItem onClick={() => setShowEdit(true)}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
          )}
          {isCancellable && (
            <DropdownMenuItem 
              onClick={() => setShowCancelAlert(true)}
              className="text-rose-600 focus:text-rose-600 focus:bg-rose-50"
            >
              <XCircle className="mr-2 h-4 w-4" /> Cancel
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => setShowDeleteAlert(true)}
            className="text-rose-600 focus:text-rose-600 focus:bg-rose-50"
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ViewAppointmentDialog 
        appointment={appointment} 
        open={showView} 
        onOpenChange={setShowView} 
      />

      <EditAppointmentDialog 
        appointment={appointment} 
        open={showEdit} 
        onOpenChange={setShowEdit} 
        onSuccess={onRefresh}
      />

      {/* Cancel Alert */}
      <AlertDialog open={showCancelAlert} onOpenChange={setShowCancelAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel your appointment with {appointment.doctor_details.doctor_name}. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Go Back</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                cancelMutation.mutate();
              }}
              className="bg-rose-600 hover:bg-rose-700"
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? "Cancelling..." : "Yes, Cancel"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Alert */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Appointment?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this appointment from your history. 
              This action is irreversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                deleteMutation.mutate();
              }}
              className="bg-rose-600 hover:bg-rose-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
