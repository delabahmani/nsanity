export const orderKeys = {
  all: ["orders"] as const,
};

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  color: string;
  size: string;
  price: number;
  product?: {
    id: string;
    name: string;
    images: string[];
  };
}

export interface Order {
  id: string;
  orderCode?: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
}

export async function fetchOrders(): Promise<Order[]> {
  const res = await fetch("/api/user/orders", { credentials: "include" });

  if (res.status === 401) return [];

  if (!res.ok) throw new Error("Failed to fetch orders");

  const data = await res.json();
  return Array.isArray(data.orders) ? data.orders : [];
}
