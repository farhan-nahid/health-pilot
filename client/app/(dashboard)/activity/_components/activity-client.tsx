"use client";

import { formatDistanceToNow } from "date-fns";
import { Calendar, Clock, FileText } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { DataTablePagination } from "@/components/ui/pagination";
import { useDashboardActivity } from "@/hooks/use-dashboard";
import { useUser } from "@/hooks/use-user";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

export function ActivityClient() {
  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ shallow: false }),
  );

  const { user } = useUser();
  const isDoctor = user?.user_type === "doctor";
  const { activities, count, isLoading, error } = useDashboardActivity(
    user?.user_type,
    page,
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-bold text-3xl tracking-tight">All Activity</h2>
        <p className="text-muted-foreground">
          {isDoctor
            ? "Track your complete timeline of appointment updates."
            : "Track your complete timeline of appointments and report activity."}
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="border-border bg-card/50 backdrop-blur-sm">
        <CardContent className="space-y-6 p-6">
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">
              Loading activity...
            </div>
          ) : activities.length > 0 ? (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-center">
                <div
                  className={cn(
                    "mr-4 rounded-full p-2",
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
                  <p className="font-medium text-sm leading-none">{activity.title}</p>
                  <p className="text-muted-foreground text-sm">{activity.detail}</p>
                </div>

                <div className="ml-auto flex items-center font-medium text-muted-foreground text-xs">
                  <Clock className="mr-1 h-3 w-3" />
                  {formatDistanceToNow(new Date(activity.date), { addSuffix: true })}
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No activity found.
            </div>
          )}

          {count > 0 && (
            <DataTablePagination
              page={page}
              pageSize={PAGE_SIZE}
              totalCount={count}
              onPageChange={setPage}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
