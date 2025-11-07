import { useQuery } from "@tanstack/react-query";

export const orderKeys = {
  all: ["orders"] as const,
};

interface OrderItem {
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

async function fetchOrders(): Promise<Order[]> {
  const res = await fetch("/api/user/orders");
  if (!res.ok) throw new Error("Failed to fetch orders");
  const data = await res.json();
  return data.orders || [];
}

export function useOrders() {
  return useQuery({
    queryKey: orderKeys.all,
    queryFn: fetchOrders,
    staleTime: 60 * 1000,
  });
}
