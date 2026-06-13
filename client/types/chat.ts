export interface ChatMessage {
  id: number;
  appointment: number;
  patient: number | null;
  doctor: number | null;
  message: string;
  created_at: string;
}

export interface SendMessagePayload {
  appointment: number;
  message: string;
}
