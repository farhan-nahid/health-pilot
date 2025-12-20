"use client"
import { format } from "date-fns";

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
import { showError, showSuccess } from "@/lib/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Edit, Eye, MoreHorizontal, Trash2, XCircle } from "lucide-react";
import { useState } from "react";
import { CompleteAppointmentDialog } from "./complete-appointment-dialog";
import { EditAppointmentDialog } from "./edit-appointment-dialog";
import { ViewAppointmentDialog } from "./view-appointment-dialog";

export function AppointmentActions({ 
  appointment, 
  onRefresh,
  userType
}: { 
  appointment: Appointment; 
  onRefresh: () => void;
  userType?: "doctor" | "patient";
}) {
  const [showView, setShowView] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showCancelAlert, setShowCancelAlert] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showAcceptAlert, setShowAcceptAlert] = useState(false);
  const [showRejectAlert, setShowRejectAlert] = useState(false);
  const [showComplete, setShowComplete] = useState(false);

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

  const acceptMutation = useMutation({
    mutationFn: async () => {
      return api.post(`/appointments/${appointment.id}/accept/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      showSuccess("Appointment accepted successfully!");
      setShowAcceptAlert(false);
      onRefresh();
    },
    onError: (err: any) => showError(err),
  });

  const rejectMutation = useMutation({
    mutationFn: async () => {
      return api.post(`/appointments/${appointment.id}/reject/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      showSuccess("Appointment rejected.");
      setShowRejectAlert(false);
      onRefresh();
    },
    onError: (err: any) => showError(err),
  });

  const isCancellable = ["pending", "accepted"].includes(appointment.status);
  const isPending = appointment.status === "pending";
  const isDoctor = userType === "doctor";
  const isPatient = userType === "patient";

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
          
          {isPatient && isCancellable && (
            <DropdownMenuItem onClick={() => setShowEdit(true)}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
          )}

          {isDoctor && isPending && (
            <DropdownMenuItem 
              onClick={() => setShowAcceptAlert(true)}
              className="text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" /> Accept
            </DropdownMenuItem>
          )}

          {isDoctor && appointment.status === "accepted" && (
            <DropdownMenuItem 
              onClick={() => setShowComplete(true)}
              className="text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" /> Mark Completed
            </DropdownMenuItem>
          )}
          
          {isDoctor && isPending && (
            <DropdownMenuItem 
              onClick={() => setShowRejectAlert(true)}
              className="text-rose-600 focus:text-rose-600 focus:bg-rose-50"
            >
              <XCircle className="mr-2 h-4 w-4" /> Reject
            </DropdownMenuItem>
          )}

          {isPatient && isCancellable && (
            <DropdownMenuItem 
              onClick={() => setShowCancelAlert(true)}
              className="text-rose-600 focus:text-rose-600 focus:bg-rose-50"
            >
              <XCircle className="mr-2 h-4 w-4" /> Cancel
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          {isPatient && (
            <DropdownMenuItem 
                onClick={() => setShowDeleteAlert(true)}
                className="text-rose-600 focus:text-rose-600 focus:bg-rose-50"
            >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ViewAppointmentDialog 
        appointment={appointment} 
        open={showView} 
        onOpenChange={setShowView} 
        userType={userType}
      />

      <EditAppointmentDialog 
        appointment={appointment} 
        open={showEdit} 
        onOpenChange={setShowEdit} 
        onSuccess={onRefresh}
      />

      <CompleteAppointmentDialog
        appointment={appointment}
        open={showComplete}
        onOpenChange={setShowComplete}
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

      {/* Accept Alert */}
      <AlertDialog open={showAcceptAlert} onOpenChange={setShowAcceptAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Accept Appointment?</AlertDialogTitle>
            <AlertDialogDescription>
              This will confirm your appointment with {appointment.patient_name} on {format(new Date(appointment.appointment_date), "PPP")} at {appointment.appointment_time}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                acceptMutation.mutate();
              }}
              className="bg-emerald-600 hover:bg-emerald-700 font-semibold"
              disabled={acceptMutation.isPending}
            >
              {acceptMutation.isPending ? "Accepting..." : "Yes, Accept"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Alert */}
      <AlertDialog open={showRejectAlert} onOpenChange={setShowRejectAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Appointment?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject the appointment request from {appointment.patient_name}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Go Back</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                rejectMutation.mutate();
              }}
              className="bg-rose-600 hover:bg-rose-700 font-semibold"
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending ? "Rejecting..." : "Yes, Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
