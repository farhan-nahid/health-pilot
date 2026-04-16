"use client";

import { format } from "date-fns";
import { AlertTriangle, FileText, Info, Pill, Stethoscope } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { SymptomAssessment } from "@/types";

export function ViewReportDialog({
  report,
  open,
  onOpenChange,
}: {
  report: SymptomAssessment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-150">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Symptom Analysis
            <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 font-bold text-[10px] text-primary uppercase">
              AI Guidance
            </span>
          </DialogTitle>
          <DialogDescription suppressHydrationWarning>
            Created on {format(new Date(report.created_at), "PPP")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2 rounded-lg border border-primary/10 bg-primary/5 p-4">
              <div className="flex items-center font-bold text-primary text-xs uppercase">
                <Stethoscope className="mr-2 h-3 w-3" /> Recommended Specialization
              </div>
              <p className="font-bold text-lg text-primary">
                {report.recommended_specialization || "General Physician"}
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

          {report.probable_conditions.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center font-bold text-muted-foreground text-xs uppercase">
                <Stethoscope className="mr-2 h-3 w-3" /> Probable Conditions
              </div>
              <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-4">
                {report.probable_conditions.map((condition, index) => (
                  <div
                    key={`${condition.name}-${index}`}
                    className="rounded-md border bg-card p-3"
                  >
                    <p className="font-semibold text-sm">{condition.name}</p>
                    <p className="text-muted-foreground text-xs uppercase">
                      Likelihood: {condition.likelihood}
                    </p>
                    <p className="mt-1 text-sm">{condition.reasoning}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {report.medication_guidance.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center font-bold text-muted-foreground text-xs uppercase">
                <Pill className="mr-2 h-3 w-3" /> Medication Guidance
              </div>
              <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-4">
                {report.medication_guidance.map((med, index) => (
                  <div
                    key={`${med.name}-${index}`}
                    className="rounded-md border bg-card p-3"
                  >
                    <p className="font-semibold text-sm">{med.name}</p>
                    <p className="text-sm">{med.purpose}</p>
                    <p className="text-muted-foreground text-xs">{med.dosage_note}</p>
                    <p className="mt-1 text-destructive text-xs">{med.warning}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(report.home_care_suggestions.length > 0 || report.red_flags.length > 0) && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2 rounded-lg border border-border bg-card p-4">
                <div className="font-bold text-muted-foreground text-xs uppercase">
                  Home Care Suggestions
                </div>
                <ul className="list-disc space-y-1 pl-5 text-sm">
                  {report.home_care_suggestions.map((item, index) => (
                    <li key={`${item}-${index}`}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                <div className="flex items-center font-bold text-destructive text-xs uppercase">
                  <AlertTriangle className="mr-2 h-3 w-3" /> Red Flags
                </div>
                <ul className="list-disc space-y-1 pl-5 text-sm">
                  {report.red_flags.map((item, index) => (
                    <li key={`${item}-${index}`}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {report.disclaimer && (
            <div className="rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-amber-950 text-xs dark:border-amber-700/40 dark:bg-amber-900/30 dark:text-amber-200">
              {report.disclaimer}
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between pt-2 text-muted-foreground text-xs">
            <div>Assessment ID: #{report.id}</div>
            <div>For educational use only</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
