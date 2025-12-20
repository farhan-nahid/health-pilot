"use client"

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { MedicalReport } from "@/hooks/use-medical-reports";
import { format } from "date-fns";
import { Download, FileText, Info, Stethoscope } from "lucide-react";

export function ViewReportDialog({ 
  report, 
  open, 
  onOpenChange 
}: { 
  report: MedicalReport; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Medical Report Analysis
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border bg-primary/10 text-primary border-primary/20">
              AI Processed
            </span>
          </DialogTitle>
          <DialogDescription suppressHydrationWarning>
            Uploaded on {format(new Date(report.uploaded_at), "PPP")}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 space-y-2">
              <div className="flex items-center text-xs font-bold text-primary uppercase">
                <Stethoscope className="h-3 w-3 mr-2" /> Recommended Specialization
              </div>
              <p className="text-lg font-bold text-primary">{report.ai_specialization || "General Physician"}</p>
            </div>
            
            <div className="p-4 rounded-lg bg-accent/30 border border-border space-y-2">
              <div className="flex items-center text-xs font-bold text-muted-foreground uppercase">
                <FileText className="h-3 w-3 mr-2" /> Symptoms Provided
              </div>
              <p className="text-sm italic">"{report.symptoms}"</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center text-xs font-bold text-muted-foreground uppercase">
              <Info className="h-3 w-3 mr-2" /> AI Summary
            </div>
            <div className="text-sm p-4 rounded-lg border border-border bg-card leading-relaxed">
              {report.ai_summary || "Summary generation in progress..."}
            </div>
          </div>

          {report.extracted_text && (
            <div className="space-y-2">
              <div className="flex items-center text-xs font-bold text-muted-foreground uppercase">
                <FileText className="h-3 w-3 mr-2" /> Extracted Text (OCR)
              </div>
              <div className="text-[12px] p-4 rounded-lg border border-border bg-muted/30 max-h-[200px] overflow-y-auto font-mono whitespace-pre-wrap">
                {report.extracted_text}
              </div>
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-muted-foreground">
              Report ID: #{report.id}
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href={report.report_file} target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
