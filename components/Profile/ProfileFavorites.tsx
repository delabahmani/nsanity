"use client";

import { useEffect, useState } from "react";
import ProductGrid from "../Products/ProductGrid";

export default function ProfileFavorites() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFavorites() {
      setLoading(true);
      const res = await fetch("/api/user/favorites");
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
      setLoading(false);
    }
    fetchFavorites();
  }, []);

  if (loading)
    return <div className="p-6 text-center">Loading favorites....</div>;

  if (!products.length)
    return (
      <div className="bg-nsanity-white rounded-xl shadow p-6">
        <h2 className="font-semibold text-lg mb-4">Your Favorites</h2>
        <div className="text-gray-500">You have no favorite products yet.</div>
      </div>
    );

  return (
    <div className="bg-nsanity-white rounded-xl shadow p-6">
      <ProductGrid
        products={products}
        title={`Your Favorites (${products.length})`}
      />
    </div>
  );
}
