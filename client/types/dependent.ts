export interface Dependent {
  id: number;
  name: string;
  relationship: 'Son' | 'Daughter' | 'Spouse' | 'Parent' | 'Other';
  date_of_birth: string;
  gender: 'Male' | 'Female' | 'Other';
  blood_group?: string;
  linked_user_id?: number | null;
  created_at: string;
  updated_at: string;
}

export interface DependentCreateData extends Omit<Dependent, 'id' | 'created_at' | 'updated_at' | 'linked_user_id'> {
  email?: string;
  password?: string;
}
export type DependentUpdateData = Partial<DependentCreateData>;
