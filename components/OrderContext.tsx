"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { useSession } from "next-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchOrders, orderKeys, type Order } from "@/lib/queries/orders";

type OrderContextValue = {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  refreshOrders: () => Promise<void>;
};

const OrderContext = createContext<OrderContextValue | undefined>(undefined);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const queryClient = useQueryClient();

  const { data, isPending, error, refetch } = useQuery({
    queryKey: orderKeys.all,
    queryFn: fetchOrders,
    enabled: status === "authenticated",
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      queryClient.removeQueries({ queryKey: orderKeys.all });
    }
  }, [status, queryClient]);

  const refreshOrders = useCallback(async () => {
    if (status === "authenticated") await refetch();
  }, [status, refetch]);

  const value = useMemo<OrderContextValue>(() => {
    if (status === "unauthenticated") {
      return { orders: [], isLoading: false, error: null, refreshOrders };
    }

    return {
      orders: data ?? [],
      isLoading: status === "loading" || isPending,
      error: error instanceof Error ? error.message : null,
      refreshOrders,
    };
  }, [status, data, isPending, error, refreshOrders]);

  return (
    <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
  );
}

export function useOrderContext() {
  const ctx = useContext(OrderContext);
  if (!ctx)
    throw new Error("useOrderContext must be used within an OrderProvider");
  return ctx;
}
