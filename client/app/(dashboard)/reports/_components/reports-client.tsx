"use client";

import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { parseAsInteger, useQueryState } from "nuqs";
import { useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSymptomAssessments } from "@/hooks/use-medical-reports";
import { useUser } from "@/hooks/use-user";
import { ReportList } from "./report-list";
import { UploadReportDialog } from "./upload-report-dialog";

export function ReportsClient() {
  const router = useRouter();
  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ shallow: false }),
  );
  const { user } = useUser();
  const isDoctor = user?.user_type === "doctor";
  const { reports, count, isLoading, refresh, error } = useSymptomAssessments(page);

  useEffect(() => {
    if (isDoctor) {
      router.replace("/dashboard");
    }
  }, [isDoctor, router]);

  if (isDoctor) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-3xl tracking-tight">AI Symptom Analyzer</h2>
          <p className="text-muted-foreground">
            Describe symptoms and receive AI-powered possible conditions, medicine
            guidance, and care suggestions.
          </p>
        </div>
        <UploadReportDialog onSuccess={refresh} />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <ReportList
          reports={reports}
          isLoading={isLoading}
          count={count}
          page={page}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
