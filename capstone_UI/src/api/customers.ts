const API_BASE_URL = "http://localhost:8080/api";

export interface Customer {
  customerId: number;
  name: string;
  email: string;
  phone: string;
  rewardPointsBalance: number;
}

export async function fetchCustomers(token: string): Promise<Customer[]> {
  const response = await fetch(`${API_BASE_URL}/customers`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to load customers");
  }

  return response.json();
}
