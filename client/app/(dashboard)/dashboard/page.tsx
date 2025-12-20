"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/hooks/use-user";
import { cn } from "@/lib/utils";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  FileText,
  Users
} from "lucide-react";

const stats = [
  {
    title: "Total Patients",
    value: "1,284",
    icon: Users,
    description: "+12% from last month",
    trend: "up",
  },
  {
    title: "Appointments",
    value: "42",
    icon: Calendar,
    description: "Scheduled for today",
    trend: "stable",
  },
  {
    title: "Medical Reports",
    value: "856",
    icon: FileText,
    description: "+5% from last week",
    trend: "up",
  },
  {
    title: "Health Score",
    value: "94%",
    icon: Activity,
    description: "Platform average",
    trend: "down",
  },
];

export default function DashboardPage() {
  const { user, isLoading } = useUser();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {isLoading ? "Loading..." : `Welcome back, ${user?.first_name || 'User'}`}
          </h2>
          <p className="text-muted-foreground">
            {isLoading ? "Fetching your health data..." : "Here's what's happening with your health pilot today."}
          </p>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow cursor-default bg-card/50 backdrop-blur-sm border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                {stat.trend === 'up' && <ArrowUpRight className="h-3 w-3 text-emerald-500 mr-1" />}
                {stat.trend === 'down' && <ArrowDownRight className="h-3 w-3 text-rose-500 mr-1" />}
                {stat.description}
              </p>
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
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">New Appointment Scheduled</p>
                    <p className="text-sm text-muted-foreground">
                      Patient John Doe with Dr. Smith - 2 hours ago
                    </p>
                  </div>
                  <div className="ml-auto font-medium text-xs text-muted-foreground">Just now</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3 bg-card/50 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle>Upcoming Tasks</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
              {[
                { label: "Review lab results", priority: "High" },
                { label: "Call patient for followup", priority: "Medium" },
                { label: "Update medical records", priority: "Low" }
              ].map((task) => (
                <div key={task.label} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors">
                  <span className="text-sm">{task.label}</span>
                  <span className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase",
                    task.priority === 'High' ? "bg-rose-500/10 text-rose-500" :
                    task.priority === 'Medium' ? "bg-amber-500/10 text-amber-500" :
                    "bg-blue-500/10 text-blue-500"
                  )}>
                    {task.priority}
                  </span>
                </div>
              ))}
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
