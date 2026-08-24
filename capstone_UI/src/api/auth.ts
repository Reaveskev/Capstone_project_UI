const API_BASE_URL = "http://localhost:8080/api";

export interface LoginResponse {
  token: string;
  role: string;
  firstName: string;
  lastName: string;
}

export async function loginRequest(
  username: string,
  password: string,
): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error("Invalid username or password");
  }

  return response.json();
}

export interface RegisterPayload {
  username: string;
  password: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

export async function registerRequest(
  payload: RegisterPayload,
): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(text || "Registration failed");
  }

  return text;
}
