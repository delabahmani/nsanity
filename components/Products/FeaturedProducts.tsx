import { getAllProducts, Product } from "@/lib/utils/product-utils";
import ProductCard from "./ProductCard";
import Link from "next/link";
import Button from "../ui/Button";

export default async function FeaturedProducts() {
  const products = await getAllProducts();
  const featured: Product[] = products.filter((p) => p.isFeatured).slice(0, 3);

  if (!featured || featured.length === 0) return null;

  return (
    <section className="py-16 relative z-20 mt-16 md:mt-24 lg:mt-40">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center">featured pieces</h2>
        <p className="text-center text-nsanity-black/50 mt-2">
          handpicked selections from our latest collection, designed for those
          who dare to stand out
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href="/products" className="inline-block">
            <Button variant="primary" className="md:px-10">
              view all products
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
