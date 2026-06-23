const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = true
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    let message = "Request failed";
    try {
      const data = await res.json();
      message = data.detail || message;
      if (Array.isArray(message)) {
        message = message.map((e: { msg?: string }) => e.msg).join(", ");
      }
    } catch {
      /* ignore */
    }
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ access_token: string }>("/auth/login/json", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }, false),

  me: () => request<import("./types").User>("/auth/me"),

  // Forms CRUD (admin)
  getForms: () => request<import("./types").FormListItem[]>("/forms"),

  getForm: (id: number) => request<import("./types").Form>(`/forms/${id}`),

  createForm: (data: { title: string; description?: string }) =>
    request<import("./types").Form>("/forms", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateForm: (id: number, data: {
    title?: string;
    description?: string | null;
    theme?: import("./types").ThemeConfig | null;
    is_active?: boolean;
  }) =>
    request<import("./types").Form>(`/forms/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteForm: (id: number) =>
    request<void>(`/forms/${id}`, { method: "DELETE" }),

  regenerateLink: (id: number) =>
    request<import("./types").Form>(`/forms/${id}/regenerate-link`, {
      method: "POST",
    }),

  // Fields CRUD (admin, form-scoped)
  getFormFields: (formId: number) =>
    request<import("./types").FormField[]>(`/forms/${formId}/fields`),

  createFormField: (formId: number, data: Partial<import("./types").FormField> & {
    name: string;
    label: string;
    field_type: import("./types").FieldType;
  }) =>
    request<import("./types").FormField>(`/forms/${formId}/fields`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateFormField: (formId: number, fieldId: number, data: Partial<import("./types").FormField>) =>
    request<import("./types").FormField>(`/forms/${formId}/fields/${fieldId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteFormField: (formId: number, fieldId: number) =>
    request<void>(`/forms/${formId}/fields/${fieldId}`, { method: "DELETE" }),

  reorderFields: (formId: number, fields: { id: number; sort_order: number }[]) =>
    request<import("./types").FormField[]>(`/forms/${formId}/fields/reorder`, {
      method: "PATCH",
      body: JSON.stringify({ fields }),
    }),

  // Public form
  getPublicForm: (token: string) =>
    request<import("./types").FormPublicResponse>(`/public/forms/${token}`, {}, false),

  submitPublicForm: (token: string, values: import("./types").SubmissionValueInput[]) =>
    request<import("./types").Submission>(`/public/forms/${token}/submit`, {
      method: "POST",
      body: JSON.stringify({ values }),
    }, false),

  // Submissions (admin)
  getSubmissions: (formId: number) =>
    request<import("./types").Submission[]>(`/forms/${formId}/submissions`),

  getSubmission: (formId: number, submissionId: number) =>
    request<import("./types").Submission>(`/forms/${formId}/submissions/${submissionId}`),

  updateSubmission: (formId: number, submissionId: number, data: {
    status?: import("./types").SubmissionStatus;
    admin_notes?: string | null;
  }) =>
    request<import("./types").Submission>(`/forms/${formId}/submissions/${submissionId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  // Image upload
  uploadImage: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    const token = getToken();
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_URL}/upload/image`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!res.ok) {
      let message = "Upload failed";
      try {
        const data = await res.json();
        message = data.detail || message;
      } catch { /* ignore */ }
      throw new ApiError(message, res.status);
    }

    const data = await res.json();
    return { url: `${BACKEND_URL}${data.url}` };
  },
};
