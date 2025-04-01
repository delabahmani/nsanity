import ProductGrid from "@/components/Products/ProductGrid";
import { products } from "@/lib/data/products";

export const metadata = {
  title: "Products | nsanity",
  description: "Browse our collection of products",
};

export default function Products() {
  return (
    <div className="flex flex-col min-h-screen nav-pad">
      <h1 className="text-black font-bold text-xl"> all products</h1>

      <section className="flex ">
        <ProductGrid products={products} />
      </section>
    </div>
  );
}
