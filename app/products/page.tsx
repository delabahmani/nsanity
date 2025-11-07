import ProductsContainer from "@/components/Products/ProductsContainer";
export const metadata = {
  title: "products | nsanity",
  description: "browse our collection of products",
};

export default async function Products() {
  return (
    <div className="flex flex-col min-h-screen nav-pad bg-linear-to-br from-[#fffbf8] via-white to-orange-50/20 max-md:max-w-7xl max-md:mx-auto px-4">
      <div>
        <h1 className="text-black font-bold text-3xl text-center py-8 ">
          products
        </h1>
      </div>

      <ProductsContainer />
    </div>
  );
}
