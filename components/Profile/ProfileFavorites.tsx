"use client";

import { Heart } from "lucide-react";
import LoadingSpinner from "../LoadingSpinner";
import { useFavorites } from "@/lib/queries/favorites";
import ProductCard from "../Products/ProductCard";

export default function ProfileFavorites() {
  const { data: favorites = [], isLoading, error } = useFavorites();

  if (isLoading) {
    return (
      <div className="bg-nsanity-white rounded-xl shadow p-6">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-nsanity-white rounded-xl shadow p-6">
        <h2 className="font-semibold text-lg flex items-center gap-2 mb-4 text-red-600">
          <Heart className="w-5 h-5" /> Error Loading Favorites
        </h2>
        <div className="text-red-500">Failed to load favorites</div>
      </div>
    );
  }

  if (!favorites.length) {
    return (
      <div className="bg-nsanity-white rounded-xl shadow p-6">
        <h2 className="font-semibold text-lg flex items-center gap-2 mb-4">
          <Heart className="w-5 h-5" /> Favorites
        </h2>
        <div className="text-gray-500">You have no favorites yet.</div>
      </div>
    );
  }

  return (
    <div className="bg-nsanity-white rounded-xl shadow p-6">
      <h2 className="font-semibold text-lg flex items-center gap-2 mb-4">
        <Heart className="w-5 h-5" /> Favorites ({favorites.length})
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
