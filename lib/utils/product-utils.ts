import prisma from "../prismadb";

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  colors: string[];
  images: string[];
  categories: string[];
  sizes: string[];
  inStock: boolean;
  isFeatured: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  features: string[];
};

// Helper function to get product by ID
export async function getProductById(id: string): Promise<Product | null> {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
    });
    return product as Product | null;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

// Helper function to get all products
export async function getAllProducts(): Promise<Product[]> {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        colors: true,
        images: true,
        categories: true,
        sizes: true,
        inStock: true,
        isFeatured: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return products as Product[];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

// Helper function to get featured products
// export async function getFeaturedProducts(): Promise<Product[]> {
//   try {
//     const res = await fetch("/api/products?featured=true", {
//       cache: "no-store",
//     });

//     if (!res.ok) {
//       throw new Error(`Failed to fetch featured products: ${res.statusText}`);
//     }

//     return await res.json();
//   } catch (error) {
//     console.error("Error fetching featured products:", error);
//     return [];
//   }
// }
