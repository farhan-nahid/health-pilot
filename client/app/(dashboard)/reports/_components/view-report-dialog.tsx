"use client";

import { format } from "date-fns";
import { Download, FileText, Info, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { MedicalReport } from "@/types";

export function ViewReportDialog({
  report,
  open,
  onOpenChange,
}: {
  report: MedicalReport;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-150">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Medical Report Analysis
            <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 font-bold text-[10px] text-primary uppercase">
              AI Processed
            </span>
          </DialogTitle>
          <DialogDescription suppressHydrationWarning>
            Uploaded on {format(new Date(report.uploaded_at), "PPP")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2 rounded-lg border border-primary/10 bg-primary/5 p-4">
              <div className="flex items-center font-bold text-primary text-xs uppercase">
                <Stethoscope className="mr-2 h-3 w-3" /> Recommended Specialization
              </div>
              <p className="font-bold text-lg text-primary">
                {report.ai_specialization || "General Physician"}
              </p>
            </div>

            <div className="space-y-2 rounded-lg border border-border bg-accent/30 p-4">
              <div className="flex items-center font-bold text-muted-foreground text-xs uppercase">
                <FileText className="mr-2 h-3 w-3" /> Symptoms Provided
              </div>
              <p className="text-sm italic">"{report.symptoms}"</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center font-bold text-muted-foreground text-xs uppercase">
              <Info className="mr-2 h-3 w-3" /> AI Summary
            </div>
            <div className="rounded-lg border border-border bg-card p-4 text-sm leading-relaxed">
              {report.ai_summary || "Summary generation in progress..."}
            </div>
          </div>

          {report.extracted_text && (
            <div className="space-y-2">
              <div className="flex items-center font-bold text-muted-foreground text-xs uppercase">
                <FileText className="mr-2 h-3 w-3" /> Extracted Text (OCR)
              </div>
              <div className="max-h-50 overflow-y-auto whitespace-pre-wrap rounded-lg border border-border bg-muted/30 p-4 font-mono text-[12px]">
                {report.extracted_text}
              </div>
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between pt-2">
            <div className="text-muted-foreground text-xs">Report ID: #{report.id}</div>
            <Button variant="outline" size="sm" asChild>
              <a href={report.report_file} target="_blank" rel="noopener noreferrer">
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
