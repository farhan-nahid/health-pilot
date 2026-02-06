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
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field";
import { FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { useDependents } from "@/hooks/use-dependents";
import { useUploadReport } from "@/hooks/use-medical-reports";
import { showError, showSuccess } from "@/lib/notifications";
import { type UploadReportValues, uploadReportSchema } from "@/schemas/report";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Plus, Upload } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

export function UploadReportDialog({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { dependents } = useDependents();
  const uploadMutation = useUploadReport();

  const form = useForm<UploadReportValues>({
    resolver: zodResolver(uploadReportSchema),
    defaultValues: {
      symptoms: "",
    },
  });

  const onSubmit = async (values: UploadReportValues) => {
    setError(null);
    uploadMutation.mutate(
      {
        report_file: values.report_file,
        symptoms: values.symptoms,
        dependent_id: values.dependent_id ? parseInt(values.dependent_id) : undefined,
      },
      {
        onSuccess: () => {
          showSuccess("Report uploaded successfully. AI analysis is in progress.");
          setOpen(false);
          form.reset();
          if (onSuccess) onSuccess();
        },
        onError: (err: any) => {
          showError(err);
          setError(
            err.response?.data?.report_file?.[0] ||
              err.message ||
              "Failed to upload report",
          );
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="font-semibold">
          <Plus className="mr-2 h-4 w-4" />
          Upload Report
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Upload Medical Report</DialogTitle>
          <DialogDescription>
            Upload your PDF report and provide your symptoms for AI analysis.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <Controller
            control={form.control}
            name="report_file"
            render={({ field: { onChange, value }, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="report">PDF Report</FieldLabel>
                <FieldContent>
                  <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                      <Input
                        id="report"
                        type="file"
                        accept=".pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) onChange(file);
                        }}
                        className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                      />
                      <Button
                        variant="outline"
                        className="w-full justify-start font-normal"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        {value ? value.name : "Choose PDF file"}
                      </Button>
                    </div>
                    {value && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                  </div>
                  <p className="text-[10px] text-muted-foreground uppercase">
                    Max size: 10MB. PDF only.
                  </p>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </FieldContent>
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="dependent_id"
            render={({ field }) => (
              <Field>
                <FieldLabel>Family Member (Optional)</FieldLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select member (Defaults to You)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">Me (Primary)</SelectItem>
                    {dependents.map((dep) => (
                      <SelectItem key={dep.id} value={dep.id.toString()}>
                        {dep.name} ({dep.relationship})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />

          <FormTextarea
            control={form.control}
            name="symptoms"
            label="Symptoms & Context"
            placeholder="What symptoms were you feeling when you got this report?"
            className="h-32 resize-none"
          />

          {error && (
            <div className="rounded border border-destructive/20 bg-destructive/10 p-2 font-medium text-destructive text-sm">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button type="submit" className="w-full" loading={uploadMutation.isPending}>
              Start AI Analysis
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
