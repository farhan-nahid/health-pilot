export interface SymptomCondition {
  name: string;
  likelihood: "low" | "medium" | "high";
  reasoning: string;
}

export interface MedicationGuidance {
  name: string;
  purpose: string;
  dosage_note: string;
  warning: string;
}

export interface SymptomAssessment {
  id: number;
  patient: number;
  patient_name: string;
  dependent: number | null;
  symptoms: string;
  recommended_specialization: string | null;
  probable_conditions: SymptomCondition[];
  medication_guidance: MedicationGuidance[];
  home_care_suggestions: string[];
  red_flags: string[];
  ai_summary: string | null;
  disclaimer: string | null;
  created_at: string;
}

export interface CreateSymptomAssessmentPayload {
  symptoms: string;
  dependent_id?: number;
}
