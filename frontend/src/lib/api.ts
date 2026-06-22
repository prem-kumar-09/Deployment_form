const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

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
  login: (email: string, password: string) =>
    request<{ access_token: string }>("/auth/login/json", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }, false),

  register: (email: string, name: string, password: string, role: import("./types").UserRole) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, name, password, role }),
    }, false),

  me: () => request<import("./types").User>("/auth/me"),

  getFormSchema: () =>
    request<import("./types").FormSchema>("/form/schema", {}, false),

  getRequests: () => request<import("./types").DeploymentRequest[]>("/requests"),

  getRequest: (id: number) =>
    request<import("./types").DeploymentRequest>(`/requests/${id}`),

  submitRequest: (values: import("./types").RequestValueInput[]) =>
    request<import("./types").DeploymentRequest>("/requests", {
      method: "POST",
      body: JSON.stringify({ values }),
    }),

  updateRequest: (
    id: number,
    data: {
      values?: import("./types").RequestValueInput[];
      status?: import("./types").RequestStatus;
      admin_notes?: string | null;
    }
  ) =>
    request<import("./types").DeploymentRequest>(`/requests/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  getFormFields: () => request<import("./types").FormField[]>("/form/fields"),

  createFormField: (data: Partial<import("./types").FormField> & {
    name: string;
    label: string;
    field_type: import("./types").FieldType;
  }) =>
    request<import("./types").FormField>("/form/fields", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateFormField: (id: number, data: Partial<import("./types").FormField>) =>
    request<import("./types").FormField>(`/form/fields/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};
