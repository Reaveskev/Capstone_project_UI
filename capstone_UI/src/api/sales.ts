const API_BASE_URL = "http://localhost:8080/api";

export interface SaleItem {
  sku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Sale {
  saleId: number;
  customerId: number;
  customerName: string;
  saleDate: string;
  totalAmount: number;
  pointsRedeemed: number;
  items: SaleItem[];
}

export interface CreateSaleItemPayload {
  sku: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateSalePayload {
  customerId: number;
  items: CreateSaleItemPayload[];
  pointsRedeemed: number;
}

export async function fetchSales(token: string): Promise<Sale[]> {
  const response = await fetch(`${API_BASE_URL}/sales`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error("Failed to load sales");
  }

  return response.json();
}

export async function createSale(
  token: string,
  payload: CreateSalePayload,
): Promise<Sale> {
  const response = await fetch(`${API_BASE_URL}/sales`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Failed to create sale");
  }

  return response.json();
}
