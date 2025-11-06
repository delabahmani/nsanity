import ProductsContainer from "@/components/Products/ProductsContainer";
import { getAllProducts } from "@/lib/utils/product-utils";

export const metadata = {
  title: "products | nsanity",
  description: "browse our collection of products",
};

export default async function Products() {
  const products = await getAllProducts();

  if (!products) {
    return <div>products not found</div>;
  }

  return (
    <div className="flex flex-col min-h-screen nav-pad bg-[#fffbf8] max-md:max-w-7xl max-md:mx-auto px-4">
      <div>
        <h1 className="text-black font-bold text-3xl text-center py-6 ">
          products
        </h1>
      </div>

      <ProductsContainer products={products} />
    </div>
  );
}
