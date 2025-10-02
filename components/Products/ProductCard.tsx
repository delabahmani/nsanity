"use client";

import { Product } from "@/lib/utils/product-utils";
import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface ProductCardProps {
  product: Product;
}

const mapColorToCss = (color: string): string => {
  const colorMap: Record<string, string> = {
    Ash: "#B2BEB5",
    Black: "black",
    "Carolina Blue": "#4B9CD3",
    Charcoal: "dimgray",
    "Dark Chocolate": "saddlebrown",
    "Dark Heather": "darkgray",
    "Forest Green": "forestgreen",
    Gold: "gold",
    "Graphite Heather": "gray",
    "Heather Deep Royal": "#4169E1",
    Heliconia: "hotpink",
    "Indigo Blue": "indigo",
    "Irish Green": "green",
    "Light Blue": "lightblue",
    "Light Pink": "lightpink",
    Maroon: "maroon",
    "Military Green": "darkolivegreen",
    Navy: "navy",
    Orange: "orange",
    Purple: "purple",
    Red: "red",
    Royal: "royalblue",
    Sand: "sandybrown",
    "Sport Grey": "lightgray",
    White: "white",
  };
  return colorMap[color] || "#D3D3D3";
};

export default function ProductCard({ product }: ProductCardProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!session) return;

    const checkFavorite = async () => {
      try {
        const res = await fetch("/api/user/favorites");
        if (res.ok) {
          const data = await res.json();
          const favorites = data.products || [];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setIsFavorited(favorites.some((fav: any) => fav.id === product.id));
        }
      } catch (error) {
        console.error("Error checking favorites: ", error);
      }
    };

    checkFavorite();
  }, [session, product.id]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!session) {
      router.push("/auth/sign-in");
      toast.error("Please sign in to favorite items.");
      return;
    }

    setIsLoading(true);
    try {
      const method = isFavorited ? "DELETE" : "POST";
      const res = await fetch("/api/user/favorites", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });

      if (res.ok) {
        setIsFavorited(!isFavorited);
        toast.success(
          isFavorited ? "Removed from favorites" : "Added to favorites!"
        );
      } else {
        throw new Error("Failed to update favorites");
      }
    } catch (error) {
      console.error("Error toggling favorites: ", error);
      toast.error("Failed to update favorites. Please try again");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Link href={`/products/${product.id}`} className="group relative">
      <button
        onClick={handleToggleFavorite}
        className="absolute top-2 right-2 z-10 p-2 bg-nsanity-cream/80 rounded-md shadow-md hover:bg-nsanity-cream transition-colors hover:scale-105 hover:cursor-pointer"
        aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="h-5 w-5 animate-spin rounded-md border-2 border-nsanity-gray border-t-red-500" />
        ) : (
          <Heart
            className={`h-5 w-5 ${isFavorited ? "fill-red-500 text-red-500" : "text-gray-500"}`}
          />
        )}
      </button>

      <div className="bg-nsanity-cream rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl">
        <div className="relative h-96 w-full bg-[#FFFFFF] flex items-center justify-center p-6">
          <div className="relative h-full w-full flex items-center justify-center">
            <Image
              src={product.images[0] || "/images/placeholder.webp"}
              alt={product.name}
              fill
              className="object-contain group-hover:scale-105 transition-transform duration-300"
              priority
            />
          </div>
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
