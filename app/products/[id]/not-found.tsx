import Button from "@/components/ui/Button";
import Link from "next/link";

export default function ProductNotFound() {
  return (
    <div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center text-center max-w-lg">
      <h1 className="text-4xl font-bold">Product Not Found</h1>
      <p className="mt-4 text-gray-600">
        We couldn't find the product you're looking for. It may have been
        removed or is no longer available.
      </p>
      <div className="mt-8">
        <Button variant="primary" size="lg">
          <Link href="/products">Browse All Products</Link>
        </Button>
      </div>
    </div>
  );
}
