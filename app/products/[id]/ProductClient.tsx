"use client";
import { useState } from "react";
import { useCart } from "@/components/CartContext";
import ProductCarousel from "@/components/Products/ProductCarousel";
import QuantitySelector from "@/components/Products/QuantitySelector";
import Button from "@/components/ui/Button";
import { ArrowLeft, Heart, ShoppingBag } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

type ProductClientProps = {
  product: any;
};

export default function ProductClient({ product }: ProductClientProps) {
  const { addToCart } = useCart();
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    undefined
  );
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    undefined
  );

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
            <div>
              <h1 className="text-3xl font-bold text-black">{product.name}</h1>
              <p className="text-2xl font-semibold text-nsanity-darkorange">
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
                  style={{ backgroundColor: color.toLowerCase() }}
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
            <div className="flex space-x-4 pt-6">
              <Button
                className="gap-3"
                variant="primary"
                onClick={handleAddToCart}
              >
                <ShoppingBag size={20} />
                Add to Cart
              </Button>
              {/* Favorite Button */}
              <Button variant="ghost">
                <Heart size={20} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
