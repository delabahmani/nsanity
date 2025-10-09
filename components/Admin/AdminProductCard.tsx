import { mapColorToCss, Product } from "@/lib/utils/product-utils";
import Image from "next/image";
import Button from "../ui/Button";

interface AdminProductCardProps {
  product: Product;
  onClick: () => void;
}

export default function AdminProductCard({
  product,
  onClick,
}: AdminProductCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-nsanity-cream rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl cursor-pointer"
    >
      <div className="relative h-96 w-full">
        <Image
          src={product.images[0] || "/images/placeholder.webp"}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300 "
          priority
        />

        {product.isFeatured && (
          <div className="absolute top-3 left-2 bg-nsanity-darkorange text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
            Featured
          </div>
        )}

        {!product.inStock && (
          <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
            Out of Stock
          </div>
        )}
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
              style={{ backgroundColor: mapColorToCss(color) }}
              aria-label={color}
            />
          ))}
          {product.colors.length > 3 && (
            <span>{product.colors.length - 3} more</span>
          )}
        </div>

        <div className="mt-4 flex justify-center">
          <Button>Edit Product</Button>
        </div>
      </div>
    </div>
  );
}
