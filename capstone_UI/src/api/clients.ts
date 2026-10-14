import { API_BASE_URL } from "./configs";

export async function apiFetch(
  path: string,
  token: string,
  options?: RequestInit,
) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { ...options?.headers, Authorization: `Bearer ${token}` },
  });

  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem("authUser");
    window.location.href = "/login";
  }

  return response;
}
