export interface DoctorDocument {
  id: number;
  document_type:
    | "bmdc_registration"
    | "medical_degree"
    | "internship"
    | "identity"
    | "specialist_qualification"
    | "additional_degree";
  document_type_display: string;
  file: string;
  status: "pending" | "approved" | "rejected";
  status_display: string;
  reviewer_notes: string | null;
  reviewed_at: string | null;
  uploaded_at: string;
  updated_at: string;
}

export interface DoctorUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
}

export interface Doctor {
  id: number;
  user?: DoctorUser;
  doctor_name?: string;
  specialization: string;
  bio: string | null;
  profile_picture: string | null;
  experience_years: number;
  consultation_fee: string;
  availabilities?: AvailabilitySlot[];
  average_rating?: number;
  total_reviews?: number;
  reviews?: Review[];
  created_at?: string;
  updated_at?: string;
}

export interface Review {
  id: number;
  doctor: number;
  patient: number;
  patient_name: string;
  patient_image: string | null;
  rating: number;
  comment: string;
  created_at: string;
  updated_at?: string;
}

export interface AvailabilitySlot {
  id: number;
  doctor?: number;
  day_of_week:
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";
  start_time: string;
  end_time: string;
  is_available: boolean;
}
