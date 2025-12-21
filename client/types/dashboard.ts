import { Appointment } from "./appointment";

export interface DashboardSummary {
  user: {
    name: string;
    first_name: string;
  };
  stats: {
    appointments_total: number;
    appointments_accepted: number;
    appointments_completed: number;
    appointments_pending?: number;
    patients_total?: number;
    revenue_estimated?: number;
    reports_total: number;
    reports_analyzed: number;
    unique_specializations?: string[];
  };
  upcoming_consultations: Appointment[];
  recent_activity: {
    id: string;
    type: "appointment" | "report";
    title: string;
    detail: string;
    date: string;
  }[];
}
