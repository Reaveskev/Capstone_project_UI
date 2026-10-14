import { apiFetch } from "./clients";

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
  const response = await apiFetch(`/customers`, token);
  if (!response.ok) throw new Error("Failed to load customers");
  return response.json();
}

export async function createCustomer(
  token: string,
  data: CustomerRequest,
): Promise<Customer> {
  const response = await apiFetch(`/customers`, token, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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
  const response = await apiFetch(`/customers/${customerId}`, token, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
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
  const response = await apiFetch(`/customers/${customerId}`, token, {
    method: "DELETE",
  });

  if (!response.ok) throw new Error("Failed to delete customer");
}
