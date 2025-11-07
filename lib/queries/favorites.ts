import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Product } from "@/lib/utils/product-utils";
import { useSession } from "next-auth/react";

export const favoriteKeys = {
  all: ["favorites"] as const,
};

async function fetchFavorites(): Promise<Product[]> {
  const res = await fetch("/api/user/favorites");
  if (!res.ok) {
    if (res.status === 401) return [];
    throw new Error("Failed to fetch favorites");
  }
  const data = await res.json();
  return data.products || [];
}

async function toggleFavorite(productId: string, isFavorited: boolean) {
  const res = await fetch("/api/user/favorites", {
    method: isFavorited ? "DELETE" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId }),
  });
  if (!res.ok) throw new Error("Failed to update favorite");
  return { productId, isFavorited: !isFavorited };
}

export function useFavorites() {
  const { data: session } = useSession();

  return useQuery({
    queryKey: favoriteKeys.all,
    queryFn: fetchFavorites,
    staleTime: 30 * 1000,
    enabled: !!session?.user,
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      isFavorited,
    }: {
      productId: string;
      isFavorited: boolean;
    }) => toggleFavorite(productId, isFavorited),
    onMutate: async ({ productId, isFavorited }) => {
      await queryClient.cancelQueries({ queryKey: favoriteKeys.all });
      const previous = queryClient.getQueryData<Product[]>(favoriteKeys.all);

      queryClient.setQueryData<Product[]>(favoriteKeys.all, (old) =>
        isFavorited ? old?.filter((p) => p.id !== productId) || [] : old || []
      );

      return { previous };
    },
    onError: (_err, _variables, context) => {
      queryClient.setQueryData(favoriteKeys.all, context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: favoriteKeys.all });
    },
  });
}
