"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useMedicalReports } from "@/hooks/use-medical-reports";
import { AlertCircle } from "lucide-react";
import { ReportList } from "./report-list";
import { UploadReportDialog } from "./upload-report-dialog";

import { useUser } from "@/hooks/use-user";

export function ReportsClient() {
  const { user } = useUser();
  const isDoctor = user?.user_type === 'doctor';
  const { reports, isLoading, refresh, error } = useMedicalReports();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Medical Reports</h2>
          <p className="text-muted-foreground">
            {isDoctor 
              ? "Review AI-powered summaries of medical reports shared by your patients."
              : "View AI-powered summaries and analyses of your clinical documents."}
          </p>
        </div>
        {!isDoctor && <UploadReportDialog onSuccess={refresh} />}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <ReportList reports={reports} isLoading={isLoading} />
      </div>
    </div>
  );
}
