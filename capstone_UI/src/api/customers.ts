const API_BASE_URL = "http://localhost:8080/api";

export interface Customer {
  customerId: number;
  name: string;
  email: string;
  phone: string;
  rewardPointsBalance: number;
}

export interface CustomerRequest {
  name: string;
  email: string;
  phone: string;
  rewardPointsBalance?: number;
}

export async function fetchCustomers(token: string): Promise<Customer[]> {
  const response = await fetch(`${API_BASE_URL}/customers`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to load customers");
  return response.json();
}

export async function createCustomer(
  token: string,
  data: CustomerRequest,
): Promise<Customer> {
  const response = await fetch(`${API_BASE_URL}/customers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const msg = await response.text();
    throw new Error(msg || "Failed to create customer");
  }
  return response.json();
}

export async function updateCustomer(
  token: string,
  customerId: number,
  data: CustomerRequest,
): Promise<Customer> {
  const response = await fetch(`${API_BASE_URL}/customers/${customerId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const msg = await response.text();
    throw new Error(msg || "Failed to update customer");
  }
  return response.json();
}

export async function deleteCustomer(
  token: string,
  customerId: number,
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/customers/${customerId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to delete customer");
}