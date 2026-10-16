const TOKEN_KEY = "stackpulse_token";
const BASE_URL = import.meta.env.VITE_API_URL ?? "/api";

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export interface FieldError {
  field: string;
  message: string;
}

export class ApiError extends Error {
  status: number;
  details?: FieldError[];

  constructor(status: number, message: string, details?: FieldError[]) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = tokenStore.get();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, data?.error ?? "Request failed", data?.details);
  return data as T;
}