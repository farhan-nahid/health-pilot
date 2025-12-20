"use client"

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUploadReport } from "@/hooks/use-medical-reports";
import { showError, showSuccess } from "@/lib/notifications";
import { CheckCircle2, Plus, Upload } from "lucide-react";
import { useState } from "react";

export function UploadReportDialog({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [symptoms, setSymptoms] = useState("");
  const [error, setError] = useState<string | null>(null);

  const uploadMutation = useUploadReport();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        setError("Only PDF files are allowed.");
        setFile(null);
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("File size cannot exceed 10MB.");
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !symptoms) return;

    setError(null);
    uploadMutation.mutate({
      report_file: file,
      symptoms: symptoms,
    }, {
      onSuccess: () => {
        showSuccess("Report uploaded successfully. AI analysis is in progress.");
        setOpen(false);
        resetForm();
        if (onSuccess) onSuccess();
      },
      onError: (err: any) => {
        showError(err);
        setError(err.response?.data?.report_file?.[0] || err.message || "Failed to upload report");
      }
    });
  };

  const resetForm = () => {
    setFile(null);
    setSymptoms("");
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="font-semibold">
          <Plus className="mr-2 h-4 w-4" />
          Upload Report
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Medical Report</DialogTitle>
          <DialogDescription>
            Upload your PDF report and provide your symptoms for AI analysis.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="report">PDF Report</Label>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Input
                  id="report"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                />
                <Button variant="outline" className="w-full justify-start font-normal">
                  <Upload className="mr-2 h-4 w-4" />
                  {file ? file.name : "Choose PDF file"}
                </Button>
              </div>
              {file && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
            </div>
            <p className="text-[10px] text-muted-foreground uppercase">Max size: 10MB. PDF only.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="report-symptoms">Symptoms & Context</Label>
            <Textarea
              id="report-symptoms"
              placeholder="What symptoms were you feeling when you got this report?"
              className="resize-none h-32"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="text-destructive text-sm font-medium bg-destructive/10 p-2 rounded border border-destructive/20">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={!file || !symptoms || uploadMutation.isPending}
              loading={uploadMutation.isPending}
            >
              Start AI Analysis
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
