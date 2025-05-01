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
};

// Helper function to get product by ID
export async function getProductById(id: string): Promise<Product | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/products/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

// Helper function to get all products
export async function getAllProducts(): Promise<Product[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/products`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch products: ${res.statusText}`);
    }

    return await res.json();
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
