"use client";

import { useCallback, useMemo, useState } from "react";
import { Product } from "@/lib/utils/product-utils";
import ProductFilters from "./ProductFilters";
import ProductGrid from "./ProductGrid";
import { X } from "lucide-react";
import { useProducts } from "@/lib/queries/products";
import LoadingSpinner from "../LoadingSpinner";

export default function ProductsContainer() {
  const { data: products = [], isLoading, error, isError } = useProducts();

  const [activeFilters, setActiveFilters] = useState<{
    categories: string[];
    sizes: string[];
  }>({
    categories: [],
    sizes: [],
  });

  const filteredProducts = useMemo(() => {
    if (!activeFilters.categories.length && !activeFilters.sizes.length) {
      return products;
    }

    return products.filter((product) => {
      const matchesCategory =
        !activeFilters.categories.length ||
        product.categories?.some((cat) =>
          activeFilters.categories.includes(cat)
        );

      const matchesSize =
        !activeFilters.sizes.length ||
        product.sizes?.some((size) => activeFilters.sizes.includes(size));

      return matchesCategory && matchesSize;
    });
  }, [products, activeFilters]);

  const handleFilterChange = useCallback(
    (
      _filtered: Product[],
      filters: { categories: string[]; sizes: string[] }
    ) => {
      setActiveFilters(filters);
    },
    []
  );

  const removeFilter = (type: "categories" | "sizes", value: string) => {
    setActiveFilters((prev) => ({
      ...prev,
      [type]: prev[type].filter((v) => v !== value),
    }));
  };

  const clearAllFilters = () => {
    setActiveFilters({ categories: [], sizes: [] });
  };

  const hasActiveFilters =
    activeFilters.categories.length > 0 || activeFilters.sizes.length > 0;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="large" />
        <p className="ml-4">Loading products...</p>
      </div>
    );
  }

  if (error || isError) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          Failed to load products. Please try again.
        </div>
        <pre className="text-xs text-left bg-gray-100 p-4 rounded max-w-2xl mx-auto overflow-auto">
          {JSON.stringify(error, null, 2)}
        </pre>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-nsanity-black/60 mb-4">
          No products available yet.
        </p>
        <p className="text-sm text-gray-500">
          Debug: Products array is {products ? "empty" : "undefined"}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-nsanity-gray">
        <ProductFilters
          products={products}
          onFilterChange={handleFilterChange}
          activeFilters={activeFilters}
          setActiveFilters={setActiveFilters}
        />

        <span className="text-sm text-nsanity-black/60">
          {filteredProducts.length}{" "}
          {filteredProducts.length === 1 ? "product" : "products"}
        </span>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-sm font-medium">Active filters:</span>
          {activeFilters.categories.map((cat) => (
            <button
              key={cat}
              onClick={() => removeFilter("categories", cat)}
              className="flex items-center gap-1 px-3 py-1 bg-nsanity-orange/10 text-nsanity-orange rounded-full text-sm hover:bg-nsanity-orange/20 transition-colors"
            >
              {cat}
              <X className="h-3 w-3" />
            </button>
          ))}
          {activeFilters.sizes.map((size) => (
            <button
              key={size}
              onClick={() => removeFilter("sizes", size)}
              className="flex items-center gap-1 px-3 py-1 bg-nsanity-orange/10 text-nsanity-orange rounded-full text-sm hover:bg-nsanity-orange/20 transition-colors"
            >
              {size}
              <X className="h-3 w-3" />
            </button>
          ))}
          <button
            onClick={clearAllFilters}
            className="text-sm text-nsanity-black/60 hover:text-nsanity-black underline"
          >
            Clear all
          </button>
        </div>
      )}

      <ProductGrid products={filteredProducts} />
    </div>
  );
}
