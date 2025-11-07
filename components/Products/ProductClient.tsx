"use client";
import { useState, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useCart } from "@/components/CartContext";
import ProductCarousel from "@/components/Products/ProductCarousel";
import QuantitySelector from "@/components/Products/QuantitySelector";
import Button from "@/components/ui/Button";
import { ArrowLeft, Heart, ShoppingBag } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { mapColorToCss, Product } from "@/lib/utils/product-utils";
import SizeGuideModal from "@/components/Products/SizeGuideModal";
import { pickGuideCategory } from "@/lib/printful-features";
import { useRouter } from "next/navigation";
import { useFavorites, useToggleFavorite } from "@/lib/queries/favorites";

type ProductClientProps = {
  product: Product;
};

export default function ProductClient({ product }: ProductClientProps) {
  const { data: session } = useSession();
  const { addToCart } = useCart();
  const router = useRouter();
  const { data: favorites = [] } = useFavorites();
  const toggleFavoriteMutation = useToggleFavorite();

  const [activeTab, setActiveTab] = useState<"details" | "shipping">("details");
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    undefined
  );
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    undefined
  );
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const guideCategory = useMemo(
    () => pickGuideCategory(product.categories || []) ?? "tshirt",
    [product.categories]
  );

  const isFavorited = useMemo(
    () => favorites.some((fav) => fav.id === product.id),
    [favorites, product.id]
  );

  const handleAddToCart = useCallback(() => {
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
    toast.success("Item added to cart!");
  }, [selectedSize, selectedColor, selectedQuantity, product, addToCart]);

  const handleToggleFavorite = useCallback(async () => {
    if (!session?.user?.email) {
      router.push("/auth/sign-in");
      return;
    }

    toggleFavoriteMutation.mutate(
      { productId: product.id, isFavorited },
      {
        onSuccess: () => {
          toast.success(
            isFavorited ? "Removed from favorites" : "Added to favorites"
          );
        },
        onError: () => {
          toast.error("Failed to update favorites");
        },
      }
    );
  }, [session, router, product.id, isFavorited, toggleFavoriteMutation]);

  return (
    <div className="min-h-screen nav-pad bg-linear-to-br from-[#fffbf8] via-white to-orange-50/20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/products"
            className="text-black font-semibold flex items-center py-4 w-fit hover:text-nsanity-darkorange transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Products
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          <ProductCarousel images={product.images} productName={product.name} />

          <div className="bg-white/80 rounded-2xl p-8 shadow-md border border-nsanity-darkorange/5">
            <div className="space-y-6">
              <div className="space-y-3">
                <h1 className="text-4xl font-bold text-gray-900">
                  {product.name}
                </h1>
                <p className="text-3xl font-bold text-nsanity-darkorange">
                  ${product.price.toFixed(2)}
                </p>
              </div>
              <p className="text-gray-600 leading-relaxed text-lg">
                {product.description}
              </p>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Color {selectedColor && `• ${selectedColor}`}
                </h3>
                <div className="flex gap-2.5">
                  {product.colors.map((color: string) => (
                    <button
                      key={color}
                      className={`w-10 h-10 rounded-lg shadow-md hover:scale-110 transition-transform ${
                        selectedColor === color
                          ? "ring-2 ring-nsanity-darkorange ring-offset-2 scale-110"
                          : "hover:shadow-lg"
                      }`}
                      style={{ backgroundColor: mapColorToCss(color) }}
                      title={color}
                      aria-label={color}
                      onClick={() => setSelectedColor(color)}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Size
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSizeGuide(true)}
                    className="text-nsanity-darkorange hover:text-nsanity-orange text-sm font-medium"
                  >
                    Size Guide
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size: string) => (
                    <Button
                      key={size}
                      className={`px-5 py-2.5 border-2 rounded-lg font-medium transition-colors ${
                        selectedSize === size
                          ? "bg-nsanity-darkorange text-white border-nsanity-darkorange shadow-md"
                          : "border-gray-200 hover:border-nsanity-orange bg-white text-gray-700 hover:bg-orange-50"
                      }`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>

              {showSizeGuide && (
                <SizeGuideModal
                  category={guideCategory}
                  isOpen={showSizeGuide}
                  onClose={() => setShowSizeGuide(false)}
                />
              )}

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Quantity
                </h3>
                <QuantitySelector
                  initialValue={selectedQuantity}
                  min={1}
                  max={product.inStock ? 10 : 0}
                  onChange={setSelectedQuantity}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  className="flex-1 gap-3 py-4 text-lg font-semibold shadow-md hover:shadow-lg"
                  variant="primary"
                  onClick={handleAddToCart}
                >
                  <ShoppingBag size={22} />
                  Add to Cart
                </Button>

                <Button
                  variant="default"
                  onClick={handleToggleFavorite}
                  disabled={toggleFavoriteMutation.isPending}
                  className={`p-4 ${
                    isFavorited
                      ? "text-red-500 bg-red-50"
                      : "text-gray-500 bg-gray-50"
                  } hover:bg-gray-100 transition-colors shadow-md`}
                >
                  <Heart
                    size={22}
                    className={isFavorited ? "fill-current" : ""}
                  />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* REMOVED backdrop-blur-sm */}
        <div className="bg-white/80 rounded-2xl shadow-md border border-nsanity-darkorange/5 overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex gap-8 px-8">
              <button
                onClick={() => setActiveTab("details")}
                className={`py-5 text-base font-semibold transition-colors ${
                  activeTab === "details"
                    ? "text-nsanity-darkorange border-b-2 border-nsanity-darkorange"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Details
              </button>
              <button
                onClick={() => setActiveTab("shipping")}
                className={`py-5 text-base font-semibold transition-colors ${
                  activeTab === "shipping"
                    ? "text-nsanity-darkorange border-b-2 border-nsanity-darkorange"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Shipping
              </button>
            </div>
          </div>

          <div className="p-8">
            {activeTab === "details" && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Product Details
                </h3>
                <ul className="space-y-3 text-gray-700">
                  {product.features && product.features.length > 0 ? (
                    product.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-nsanity-darkorange text-xl">
                          •
                        </span>
                        <span>{feature}</span>
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
                <h3 className="text-xl font-bold text-gray-900">
                  Shipping Information
                </h3>
                <p className="text-gray-700 leading-relaxed">
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
