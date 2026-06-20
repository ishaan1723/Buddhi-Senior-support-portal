export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
};

export type Vendor = {
  id: string;
  name: string;
  phone: string;
  whatsapp?: string;
  address: string;
  locality: string;
  description: string;
  yearsExperience?: number;
  buddhiVerified: boolean;
  averageRating: string | number;
  reviewCount: number;
  category: Category;
};

type ApiInit = RequestInit & {
  token?: string;
  next?: { revalidate?: number };
};

export async function apiFetch<T>(path: string, init?: ApiInit): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("content-type", "application/json");
  if (init?.token) headers.set("authorization", `Bearer ${init.token}`);
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    cache: init?.method && init.method !== "GET" ? "no-store" : "default"
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(body.error || "Request failed");
  }
  return response.json() as Promise<T>;
}

export async function getVendors(category?: string) {
  const query = category ? `?category=${encodeURIComponent(category)}` : "";
  return apiFetch<Vendor[]>(`/api/vendors${query}`, { next: { revalidate: 60 } });
}

export async function getVendor(id: string) {
  return apiFetch<Vendor & { reviews: Array<{ id: string; rating: number; comment?: string; createdAt: string }> }>(`/api/vendors/${id}`, {
    next: { revalidate: 60 }
  });
}
