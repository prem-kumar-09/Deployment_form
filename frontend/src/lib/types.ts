export type FieldType = "text" | "textarea" | "date" | "radio" | "select" | "email" | "url";

export type SubmissionStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "in_progress"
  | "completed";

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  created_at: string;
}

export interface ThemeConfig {
  bg_color: string;
  bg_image_url?: string | null;
  font_family: string;
  primary_color: string;
  text_color: string;
  border_radius: number;
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

export interface Form {
  id: number;
  title: string;
  description: string | null;
  share_token: string;
  theme: ThemeConfig | null;
  is_active: boolean;
  fields: FormField[];
  submission_count: number;
  created_at: string;
  updated_at: string;
}

export interface FormListItem {
  id: number;
  title: string;
  description: string | null;
  share_token: string;
  is_active: boolean;
  field_count: number;
  submission_count: number;
  created_at: string;
  updated_at: string;
}

export interface FormPublicResponse {
  title: string;
  description: string | null;
  theme: ThemeConfig | null;
  fields: FormField[];
}

export interface SubmissionFieldValue {
  field_id: number;
  field_name: string;
  field_label: string;
  field_type: FieldType;
  value: string | null;
  options?: string[] | null;
}

export interface Submission {
  id: number;
  form_id: number;
  submitter_name: string | null;
  submitter_email: string | null;
  status: SubmissionStatus;
  admin_notes: string | null;
  values: SubmissionFieldValue[];
  created_at: string;
  updated_at: string;
}

export interface SubmissionValueInput {
  field_id: number;
  value: string | null;
}
