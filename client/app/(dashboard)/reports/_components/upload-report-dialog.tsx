"use client";

import { FormTextarea } from "@/components/form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDependents } from "@/hooks/use-dependents";
import { useAnalyzeSymptoms } from "@/hooks/use-medical-reports";
import { showError, showSuccess } from "@/lib/notifications";
import { symptomAssessmentSchema, type SymptomAssessmentValues } from "@/schemas/report";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Sparkles } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

export function UploadReportDialog({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { dependents } = useDependents();
  const analyzeMutation = useAnalyzeSymptoms();

  const form = useForm<SymptomAssessmentValues>({
    resolver: zodResolver(symptomAssessmentSchema),
    defaultValues: {
      symptoms: "",
      dependent_id: "self",
    },
  });

  const onSubmit = async (values: SymptomAssessmentValues) => {
    setError(null);
    analyzeMutation.mutate(
      {
        symptoms: values.symptoms,
        dependent_id:
          values.dependent_id && values.dependent_id !== "self"
            ? parseInt(values.dependent_id)
            : undefined,
      },
      {
        onSuccess: () => {
          showSuccess("AI symptom analysis generated successfully.");
          setOpen(false);
          form.reset();
          if (onSuccess) onSuccess();
        },
        onError: (err: any) => {
          showError(err);
          setError(err.response?.data?.error || err.message || "Analysis failed");
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="font-semibold">
          <Plus className="mr-2 h-4 w-4" />
          Analyze Symptoms
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Analyze Symptoms with AI</DialogTitle>
          <DialogDescription>
            Describe symptoms clearly to get possible conditions, medicine guidance, and
            actionable care suggestions.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <Controller
            control={form.control}
            name="dependent_id"
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select member (Defaults to You)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="self">Me (Primary)</SelectItem>
                  {dependents.map((dep) => (
                    <SelectItem key={dep.id} value={dep.id.toString()}>
                      {dep.name} ({dep.relationship})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />

          <FormTextarea
            control={form.control}
            name="symptoms"
            label="Symptoms"
            description="Include duration, severity, and anything that makes symptoms better or worse."
            placeholder="Example: I have had fever, body ache, dry cough, and fatigue for 3 days. Fever is worse at night."
            className="h-40 resize-none"
          />

          {error && (
            <div className="rounded border border-destructive/20 bg-destructive/10 p-2 font-medium text-destructive text-sm">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button type="submit" className="w-full" loading={analyzeMutation.isPending}>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate AI Guidance
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
