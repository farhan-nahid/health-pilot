export interface Doctor {
  id: number;
  doctor_name: string;
  specialization: string;
  bio: string | null;
  profile_picture: string | null;
  experience_years: number;
  consultation_fee: string;
  created_at?: string;
  updated_at?: string;
}

export interface AvailabilitySlot {
  id: number;
  doctor: number;
  day_of_week: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
  start_time: string;
  end_time: string;
  is_available: boolean;
}
