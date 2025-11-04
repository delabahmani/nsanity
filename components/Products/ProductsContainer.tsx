"use client";

import { useCallback, useState } from "react";
import { Product } from "@/lib/utils/product-utils";
import ProductFilters from "./ProductFilters";
import ProductGrid from "./ProductGrid";
import { X } from "lucide-react";

interface ProductsContainerProps {
  products: Product[];
}

export default function ProductsContainer({
  products,
}: ProductsContainerProps) {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const [activeFilters, setActiveFilters] = useState<{
    categories: string[];
    sizes: string[];
  }>({
    categories: [],
    sizes: [],
  });

  const handleFilterChange = useCallback(
    (
      filtered: Product[],
      filters: { categories: string[]; sizes: string[] }
    ) => {
      setFilteredProducts(filtered);
      setActiveFilters(filters);
    },
    []
  );

  const removeFilter = (type: "categories" | "sizes", value: string) => {
    const newFilters = {
      ...activeFilters,
      [type]: activeFilters[type].filter((v) => v !== value),
    };
    setActiveFilters(newFilters);
  };

  const clearAllFilters = () => {
    setActiveFilters({ categories: [], sizes: [] });
    setFilteredProducts(products);
  };

  const hasActiveFilters =
    activeFilters.categories.length > 0 || activeFilters.sizes.length > 0;

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      {/* Filter bar + result count */}
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

      {/* Active filter chips */}
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
