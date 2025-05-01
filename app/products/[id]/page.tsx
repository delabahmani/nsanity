import ProductCarousel from "@/components/Products/ProductCarousel";
import QuantitySelector from "@/components/Products/QuantitySelector";
import Button from "@/components/ui/Button";
import { getProductById } from "@/lib/utils/product-utils";
import { ArrowLeft, Heart, ShoppingBag } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type ProductPageProps = {
  params: {
    id: string;
  };
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) return { title: "Product not found" };

  return {
    title: `${product.name} | nsanity`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-16 nav-pad">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <Button asChild>
            <Link
              href="/products"
              className="text-black font-bold flex items-center mt-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <ProductCarousel images={product.images} productName={product.name} />

          {/* Product Details    */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-black">{product.name}</h1>
              <p className="text-2xl font-semibold text-nsanity-darkorange">
                ${product.price.toFixed(2)}
              </p>
            </div>

            <p className="text-black/70">{product.description}</p>

            {/* Sizes */}
            <div>
              <h3 className="text-lg font-medium mb-3">Sizes</h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <Button
                    key={size}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:border-nsanity-orange focus:outline-none focus:ring-2 focus:ring-nsanity-orange transition-all duration-200"
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
                initialValue={1}
                min={1}
                max={product.inStock ? 10 : 0}
              />
            </div>

            {/* Add to Cart */}
            <div className="flex space-x-4 pt-6">
              <Button className="gap-3" variant="primary">
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
