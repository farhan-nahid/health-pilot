export interface Patient {
  id: number;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
  };
  date_of_birth: string | null;
  blood_group: string | null;
  address: string | null;
  emergency_contact: string | null;
  created_at: string;
  updated_at: string;
}
