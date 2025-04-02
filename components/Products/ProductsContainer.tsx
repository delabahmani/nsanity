"use client";

import { useState } from "react";
import { Product } from "@/lib/data/products";
import ProductFilters from "./ProductFilters";
import ProductGrid from "./ProductGrid";
import { SlidersHorizontal } from "lucide-react";

interface ProductsContainerProps {
  products: Product[];
}

export default function ProductsContainer({ products }: ProductsContainerProps) {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);

  return (
    <div className="flex justify-around">
      <div className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-24">
          <section className="lg:w-[40%] max-md:hidden">
            <h3 className="gap-2 text-xl font-semibold text-black flex items-center">
              <SlidersHorizontal className="h-5 w-5" />
              Filters
            </h3>
            <ProductFilters 
              products={products}
              onFilterChange={setFilteredProducts}
            />
          </section>
        </div>
      </div>

      <section className="max-lg:w-full lg:w-[60%] items-center justify-center">
        <ProductGrid products={filteredProducts} />
      </section>
    </div>
  );
}