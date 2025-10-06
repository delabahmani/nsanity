"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useCart } from "@/components/CartContext";
import ProductCarousel from "@/components/Products/ProductCarousel";
import QuantitySelector from "@/components/Products/QuantitySelector";
import Button from "@/components/ui/Button";
import { ArrowLeft, Heart, ShoppingBag } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Product } from "@/lib/utils/product-utils";

type ProductClientProps = {
  product: Product;
};

export default function ProductClient({ product }: ProductClientProps) {
  const { data: session } = useSession();
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState<"details" | "shipping">("details");
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    undefined
  );
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    undefined
  );
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoritesLoading, setFavoritesLoading] = useState(false);

  // Check if product is favorited on mount
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!session?.user?.email) return;

      try {
        const response = await fetch("/api/user/favorites");
        if (response.ok) {
          const data = await response.json();
          const isProductFavorited = data.products.some(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (p: any) => p.id === product.id
          );
          setIsFavorited(isProductFavorited);
        }
      } catch (error) {
        console.error("Error checking favorite status:", error);
      }
    };

    checkFavoriteStatus();
  }, [session, product.id]);

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      toast.error("Please choose a color and size");
      return;
    }
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: selectedQuantity,
      size: selectedSize,
      color: selectedColor,
      image: product.images[0],
    });
  };

  const handleToggleFavorite = async () => {
    if (!session?.user?.email) {
      toast.error("Please sign in to add favorites");
      return;
    }

    setFavoritesLoading(true);

    try {
      const method = isFavorited ? "DELETE" : "POST";
      const response = await fetch("/api/user/favorites", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });

      if (response.ok) {
        setIsFavorited(!isFavorited);
        toast.success(
          isFavorited ? "Removed from favorites" : "Added to favorites"
        );
      } else {
        throw new Error("Failed to update favorites");
      }
    } catch (error) {
      console.error("Error updating favorites:", error);
      toast.error("Failed to update favorites");
    } finally {
      setFavoritesLoading(false);
    }
  };

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
    return colorMap[color] || "#D3D3D3"; // Fallback to light gray
  };

  return (
    <div className="container mx-auto px-4 py-16 nav-pad">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <Link
            href="/products"
            className="text-black font-bold flex items-center mt-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <ProductCarousel images={product.images} productName={product.name} />
          <div className="space-y-6">
            <div className="space-y-3">
              <h1 className="text-3xl font-bold text-black">{product.name}</h1>
              <p className="text-2xl font-bold text-nsanity-darkorange">
                ${product.price.toFixed(2)}
              </p>
            </div>
            <p className="text-black/70">{product.description}</p>

            {/* Colors */}
            <div className="flex mt-3 space-x-2">
              {product.colors.slice(0, 3).map((color: string) => (
                <Button
                  key={color}
                  className={`w-4 h-4 rounded-full border border-gray-300 ${
                    selectedColor === color
                      ? "border-nsanity-darkorange border-2"
                      : "border-none"
                  }`}
                  style={{ backgroundColor: mapColorToCss(color) }}
                  title={color}
                  aria-label={color}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
              {product.colors.length > 3 && (
                <span className="text-xs text-black/70 ml-1">
                  {product.colors.length - 3} more
                </span>
              )}
            </div>
            {selectedColor && (
              <p className="text-sm text-nsanity-black/70 mt-2">
                Selected:{" "}
                <span className="text-nsanity-black">{selectedColor}</span>
              </p>
            )}

            {/* Sizes */}
            <div>
              <h3 className="text-lg font-medium mb-3">Sizes</h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size: string) => (
                  <Button
                    key={size}
                    className={`px-4 py-2 border border-gray-300 rounded-md hover:border-nsanity-orange focus:outline-none focus:ring-2 focus:ring-nsanity-orange transition-all duration-200 ${
                      selectedSize === size
                        ? "bg-nsanity-orange text-white"
                        : ""
                    }`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div>
              <h3 className="text-lg font-medium mb-3">Quantity</h3>
              <QuantitySelector
                initialValue={selectedQuantity}
                min={1}
                max={product.inStock ? 10 : 0}
                onChange={setSelectedQuantity}
              />
            </div>

            {/* Add to Cart */}
            <div className="flex space-x-4 pt-6 items-center">
              <Button
                className="gap-3"
                variant="primary"
                size="xl"
                onClick={handleAddToCart}
              >
                <ShoppingBag size={20} />
                Add to Cart
              </Button>

              {/* Favorite Button */}
              <Button
                variant="default"
                size="lg"
                onClick={handleToggleFavorite}
                disabled={favoritesLoading}
                className={`${isFavorited ? "text-red-500" : "text-gray-500"} transition-colors`}
              >
                <Heart
                  size={20}
                  className={isFavorited ? "fill-current" : ""}
                />
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-12 border-t border-nsanity-gray pt-8">
          <div className="flex space-x-8 border-b border-nsanity-gray">
            <button
              onClick={() => setActiveTab("details")}
              className={`p-4 text-lg font-medium transition-colors ${activeTab === "details" ? "text-nsanity-darkorange border-b-2 border-nsanity-darkorange" : "text-gray-500 hover:text-gray-700"}`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab("shipping")}
              className={`p-4 text-lg font-medium transition-colors ${
                activeTab === "shipping"
                  ? "text-nsanity-darkorange border-b-2 border-nsanity-darkorange"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Shipping
            </button>
          </div>

          <div className="mt-6">
            {activeTab === "details" && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-nsanity-black">
                  Product Details
                </h3>
                <ul className="space-y-2 text-gray-700">
                  {product.features && product.features.length > 0 ? (
                    product.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-nsanity-darkorange mr-2">•</span>
                        {feature}
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500">No features available.</li>
                  )}
                </ul>
              </div>
            )}

            {activeTab === "shipping" && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-nsanity-black">
                  Shipping Information
                </h3>
                <p className="text-gray-700">
                  Free standard shipping on orders over $75. Express shipping
                  available at checkout. Orders typically ship within 1-2
                  business days.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
