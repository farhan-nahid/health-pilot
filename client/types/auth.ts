export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  user_type: "doctor" | "patient";
  phone: string;
  patient_profile?: {
    id: number;
    // Add other fields if needed
  };
  doctor_profile?: {
    id: number;
    // Add other fields if needed
  };
}
