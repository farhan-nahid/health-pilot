"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardSummary } from "@/hooks/use-dashboard";
import { useUser } from "@/hooks/use-user";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import {
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  Stethoscope,
  Users,
} from "lucide-react";

export function DashboardClient() {
  const { user } = useUser();
  const isDoctor = user?.user_type === "doctor";
  const { summary, isLoading } = useDashboardSummary(user?.user_type);

  // Stats mapping from summary
  const getStats = () => {
    if (isDoctor) {
      return [
        {
          title: "Total Appointments",
          value: summary?.stats.appointments_total.toString() || "0",
          icon: Calendar,
          description: `${summary?.stats.appointments_pending || 0} pending requests`,
          color: "text-blue-500",
        },
        {
          title: "Unique Patients",
          value: summary?.stats.patients_total?.toString() || "0",
          icon: Users,
          description: "Registered patients",
          color: "text-emerald-500",
        },
        {
          title: "Completed Sessions",
          value: summary?.stats.appointments_completed.toString() || "0",
          icon: CheckCircle2,
          description: "Successfully treated",
          color: "text-purple-500",
        },
        {
          title: "Estimated Revenue",
          value: `$${summary?.stats.revenue_estimated?.toFixed(2) || "0.00"}`,
          icon: DollarSign,
          description: "From completed sessions",
          color: "text-rose-500",
        },
      ];
    }

    return [
      {
        title: "Appointments",
        value: summary?.stats.appointments_total.toString() || "0",
        icon: Calendar,
        description: `${summary?.stats.appointments_accepted || 0} accepted`,
        color: "text-blue-500",
      },
      {
        title: "Medical Reports",
        value: summary?.stats.reports_total.toString() || "0",
        icon: FileText,
        description: `${summary?.stats.reports_analyzed || 0} AI analyzed`,
        color: "text-emerald-500",
      },
      {
        title: "Health Sessions",
        value: summary?.stats.appointments_completed.toString() || "0",
        icon: CheckCircle2,
        description: "Completed consultations",
        color: "text-purple-500",
      },
      {
        title: "Specializations",
        value: summary?.stats.unique_specializations?.length.toString() || "0",
        icon: Stethoscope,
        description: "Recommended experts",
        color: "text-rose-500",
      },
    ];
  };

  const stats = getStats();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {isLoading
              ? "Loading..."
              : `Welcome back, ${summary?.user.first_name || user?.first_name || "User"}`}
          </h2>
          <p className="text-muted-foreground">
            {isLoading
              ? "Fetching your health data..."
              : isDoctor
                ? "Here's an overview of your practice and upcoming patient consultations."
                : "Here's a summary of your health journey with Health Pilot."}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className="hover:shadow-md transition-shadow cursor-default bg-card/50 backdrop-blur-sm border-border"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={cn("h-4 w-4", stat.color)} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "..." : stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-card/50 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {summary && summary.recent_activity.length > 0 ? (
                summary.recent_activity.map((activity) => (
                  <div key={activity.id} className="flex items-center">
                    <div
                      className={cn(
                        "p-2 rounded-full mr-4",
                        activity.id.startsWith("app")
                          ? "bg-blue-500/10"
                          : "bg-emerald-500/10",
                      )}
                    >
                      {activity.id.startsWith("app") ? (
                        <Calendar className="h-4 w-4 text-blue-500" />
                      ) : (
                        <FileText className="h-4 w-4 text-emerald-500" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.detail}</p>
                    </div>
                    <div className="ml-auto font-medium text-xs text-muted-foreground flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDistanceToNow(new Date(activity.date), { addSuffix: true })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {isLoading ? "Updating activity..." : "No recent activity found."}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3 bg-card/50 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle>Upcoming Consultations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {summary && summary.upcoming_consultations.length > 0 ? (
                summary.upcoming_consultations.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-background/50 hover:bg-accent/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {isDoctor
                          ? app.patient_name
                          : `Dr. ${app.doctor_details.doctor_name}`}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase">
                        {app.appointment_time}
                      </p>
                    </div>
                    <div className="text-xs font-bold text-primary">
                      {formatDistanceToNow(new Date(app.appointment_date), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  {isLoading ? "Checking schedule..." : "No upcoming consultations."}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
