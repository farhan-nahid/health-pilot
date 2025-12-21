"use client";

import { format } from "date-fns";
import { Eye, FileText } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DataTablePagination } from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUser } from "@/hooks/use-user";
import type { MedicalReport } from "@/types";
import { ViewReportDialog } from "./view-report-dialog";

export function ReportList({
  reports,
  isLoading,
  count,
  page,
  onPageChange,
}: {
  reports: MedicalReport[];
  isLoading: boolean;
  count: number;
  page: number;
  onPageChange: (page: number) => void;
}) {
  const { user } = useUser();
  const isDoctor = user?.user_type === "doctor";
  const [selectedReport, setSelectedReport] = useState<MedicalReport | null>(null);

  if (isLoading) {
    return (
      <div className="rounded-md border border-border bg-card p-8 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-primary border-b-2"></div>
        <p className="mt-4 text-muted-foreground text-sm">Loading reports...</p>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-border border-dashed bg-card/50 p-12">
        <FileText className="mb-4 h-10 w-10 text-muted-foreground" />
        <p className="font-medium text-muted-foreground">No medical reports found.</p>
        <p className="mt-1 text-muted-foreground text-sm">
          Upload your first PDF report for AI analysis.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead>Date Uploaded</TableHead>
            {isDoctor && <TableHead>Patient</TableHead>}
            <TableHead>Symptoms</TableHead>
            <TableHead>AI Specialization</TableHead>
            <TableHead className="w-[100px] text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id} className="cursor-default">
              <TableCell className="font-medium" suppressHydrationWarning>
                {format(new Date(report.uploaded_at), "PPP")}
              </TableCell>
              {isDoctor && (
                <TableCell className="font-semibold">{report.patient_name}</TableCell>
              )}
              <TableCell className="max-w-[300px] truncate">{report.symptoms}</TableCell>
              <TableCell>
                <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 font-bold text-[10px] text-primary uppercase">
                  {report.ai_specialization || "Processing..."}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedReport(report)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedReport && (
        <ViewReportDialog
          report={selectedReport}
          open={!!selectedReport}
          onOpenChange={(open) => !open && setSelectedReport(null)}
        />
      )}
      <DataTablePagination
        page={page}
        pageSize={10}
        totalCount={count}
        onPageChange={onPageChange}
      />
    </div>
  );
}
