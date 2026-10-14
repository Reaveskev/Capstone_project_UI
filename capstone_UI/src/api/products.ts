import { apiFetch } from "./clients";

export interface Product {
  sku: string;
  productName: string;
  price: number;
  stockLevel: number;
  category: string;
  lowStockThreshold: number;
}

export async function fetchProducts(token: string): Promise<Product[]> {
  const response = await apiFetch("/products", token);
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
  const response = await apiFetch(`/products/${sku}`, token, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to update product");
  }

  return response.json();
}
