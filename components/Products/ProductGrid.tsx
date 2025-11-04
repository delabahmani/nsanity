import { Product } from "@/lib/utils/product-utils";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  title?: string;
}

export default function ProductGrid({ products, title }: ProductGridProps) {
  return (
    <div className="space-y-8">
      {title && <h2 className="text-2xl font-bold mb-6">{title}</h2>}

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-nsanity-black/60">
            No products found matching your filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
