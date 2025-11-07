import { getProductById } from "@/lib/utils/product-utils";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import ProductClient from "@/components/Products/ProductClient";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(
  props: ProductPageProps
): Promise<Metadata> {
  const { id } = await props.params;
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
  if (!product) notFound();

  return <ProductClient product={product} />;
}
