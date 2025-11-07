"use client";
import { mapColorToCss, Product } from "@/lib/utils/product-utils";
import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
import { useToggleFavorite, useFavorites } from "@/lib/queries/favorites";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { data: favorites = [] } = useFavorites();
  const toggleFavorite = useToggleFavorite();

  const isFavorited = favorites.some((fav) => fav.id === product.id);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!session) {
      router.push("/auth/sign-in");
      return;
    }

    toggleFavorite.mutate({ productId: product.id, isFavorited });
  };

  return (
    <div
      onClick={() => router.push(`/products/${product.id}`)}
      className="group cursor-pointer bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg border border-nsanity-darkorange/10 transition-all duration-300 relative"
    >
      <button
        onClick={handleToggleFavorite}
        className="absolute top-3 right-3 z-30 p-2 bg-nsanity-cream/60 backdrop-blur-sm rounded-lg shadow-sm hover:bg-nsanity-orange/10 hover:shadow-md transition-all duration-200 ease-in-out hover:cursor-pointer"
        disabled={toggleFavorite.isPending}
      >
        <Heart
          className={`w-5 h-5 transition-all ${isFavorited ? "fill-red-500 text-red-500 scale-110" : "text-gray-600 group-hover:text-nsanity-darkorange"}`}
        />
      </button>

      {product.isFeatured && (
        <div className="absolute top-3 left-3 z-10 bg-linear-to-r from-nsanity-darkorange to-nsanity-orange text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
          Featured
        </div>
      )}

      <div className="bg-nsanity-cream rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl">
        <div className="relative h-80 w-full bg-[#FFFFFF] flex shrink items-center justify-center p-6">
          <div className="relative h-full w-full flex items-center justify-center">
            <Image
              src={product.images[0] || "/images/placeholder.webp"}
              alt={product.name}
              fill
              className="object-contain group-hover:scale-105 transition-transform duration-300"
              priority
              quality={100}
            />
          </div>
        </div>

        <div className="p-5">
          <h2 className="font-bold text-xl text-gray-900 line-clamp-1 group-hover:text-nsanity-darkorange transition-colors">
            {product.name}
          </h2>
          <p className="text-nsanity-darkorange font-bold mt-2 text-xl">
            ${product.price.toFixed(2)}
          </p>

          <div className="flex mt-4 gap-1.5">
            {product.colors.slice(0, 3).map((color) => (
              <div
                key={color}
                className="w-4 h-4 rounded-full border border-gray-300 shadow-sm hover:scale-110 transition-transform"
                style={{ backgroundColor: mapColorToCss(color) }}
                aria-label={color}
              />
            ))}
            {product.colors.length > 4 && (
              <span className="text-xs text-gray-500 self-center ml-1">
                +{product.colors.length - 4}
              </span>
            )}
          </div>

          <div className="flex items-center mt-3 gap-1.5 flex-wrap">
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
    </div>
  );
}
