import { Product } from "@/lib/data/products";
import Image from "next/image";
import Link from "next/link";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.id}`} className="group">
      <div className="bg-nsanity-cream rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl">
        <div className="relative h-96 w-full">
          <Image
            src={product.images[0] || "/images/placeholder.webp"}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300 "
            priority
          />
        </div>

        <div className="p-4">
          <h2 className="font-bold text-2xl">{product.name}</h2>
          <p className="text-nsanity-darkorange font-semibold mt-2 text-xl">
            ${product.price.toFixed(2)}
          </p>

          <div className="flex mt-3 space-x-2">
            {product.colors.slice(0, 3).map((color) => (
              <div
                key={color}
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: color.toLowerCase() }}
                aria-label={color}
              />
            ))}
            {product.colors.length > 3 && (
              <span className="text-xs text-black/70 ml-1">
                {product.colors.length - 3} more
              </span>
            )}
          </div>

          <div className="flex items-center mt-3 space-x-2">
            {product.sizes.slice(0, 4).map((size) => (
              <div
                key={size}
                className="text-xs px-2 py-1 bg-nsanity-gray rounded"
              >
                {size}
              </div>
            ))}
            {product.sizes.length > 4 && (
              <span className="text-xs text-black/70 ml-1">
                {product.sizes.length - 4} more
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
