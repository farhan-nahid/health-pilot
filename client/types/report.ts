export interface MedicalReport {
  id: number;
  patient: number;
  patient_name: string;
  report_file: string;
  symptoms: string;
  ai_specialization: string | null;
  ai_summary: string | null;
  extracted_text: string | null;
  uploaded_at: string;
}

export interface UploadReportPayload {
  report_file: File;
  symptoms: string;
  dependent_id?: number;
}
