const API_BASE_URL = "http://localhost:8080/api";

export interface Product {
  sku: string;
  productName: string;
  price: number;
  stockLevel: number;
  category: string;
  lowStockThreshold: number;
}

export async function fetchProducts(token: string): Promise<Product[]> {
  const response = await fetch(`${API_BASE_URL}/products`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to load products");
  }

  return response.json();
}

export interface ProductUpdatePayload {
  productName: string;
  price: number;
  stockLevel: number;
  category: string;
  lowStockThreshold: number;
}

export async function updateProduct(
  token: string,
  sku: string,
  payload: ProductUpdatePayload,
): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/products/${sku}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to update product");
  }

  return response.json();
}
