"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import { Product } from "@/lib/utils/product-utils";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import EditProductForm from "@/components/Admin/EditProductForm";
import Button from "@/components/ui/Button";
import AdminProductCard from "@/components/Admin/AdminProductCard";

export default function EditProductPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/admin/products");
        if (!res.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await res.json();
        setProducts(data.products);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleSuccessfulEdit = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/products");
      if (!res.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = await res.json();
      setProducts(data);
      setSelectedProduct(null);
    } catch (err) {
      console.error("Error refreshing products:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }

  // If a product is selected, show the edit form
  if (selectedProduct) {
    return (
      <div className="min-h-screen nav-pad">
        <div className="max-w-7xl mx-auto px-4">
          <Button
            onClick={() => setSelectedProduct(null)}
            className="mb-6 mt-6"
          >
            ← Back to Products
          </Button>
          <EditProductForm
            initialData={selectedProduct}
            onSuccess={handleSuccessfulEdit}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 nav-pad">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Edit Products</h1>
        <Button
          onClick={() => router.push("/admin/products")}
          className="bg-nsanity-darkorange text-white"
        >
          Back to Dashboard
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl mb-4">No products available to edit</p>
          <Button
            onClick={() => router.push("/admin/products/addProduct")}
            className="bg-nsanity-darkorange text-white"
          >
            Add New Product
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <AdminProductCard
              key={product.id}
              product={product}
              onClick={() => setSelectedProduct(product)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
