export type UserRole = "user" | "admin";

export type FieldType = "text" | "textarea" | "date" | "radio" | "select" | "email" | "url";

export type RequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "in_progress"
  | "completed";

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  created_at: string;
}

export interface FormField {
  id: number;
  name: string;
  label: string;
  field_type: FieldType;
  placeholder?: string | null;
  options?: string[] | null;
  is_required: boolean;
  sort_order: number;
  is_active: boolean;
}

export interface FormSchema {
  fields: FormField[];
  title: string;
  description: string;
}

export interface RequestFieldValue {
  field_id: number;
  field_name: string;
  field_label: string;
  field_type: FieldType;
  value: string | null;
  options?: string[] | null;
}

export interface DeploymentRequest {
  id: number;
  submitter_id: number;
  submitter_name: string;
  submitter_email: string;
  status: RequestStatus;
  admin_notes: string | null;
  values: RequestFieldValue[];
  created_at: string;
  updated_at: string;
}

export interface RequestValueInput {
  field_id: number;
  value: string | null;
}
