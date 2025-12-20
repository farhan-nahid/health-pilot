export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  user_type: "doctor" | "patient";
  phone: string;
}
