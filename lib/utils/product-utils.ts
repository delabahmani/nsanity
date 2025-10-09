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

export const COLOR_HEX_MAP: Record<string, string> = {
  Ash: "#B2BEB5",
  Black: "black",
  "Carolina Blue": "#4B9CD3",
  Charcoal: "dimgray",
  "Dark Chocolate": "saddlebrown",
  "Dark Heather": "darkgray",
  "Forest Green": "forestgreen",
  Gold: "gold",
  "Graphite Heather": "gray",
  "Heather Deep Royal": "#4169E1",
  Heliconia: "hotpink",
  "Indigo Blue": "indigo",
  "Irish Green": "green",
  "Light Blue": "lightblue",
  "Light Pink": "lightpink",
  Maroon: "maroon",
  "Military Green": "darkolivegreen",
  Navy: "navy",
  Orange: "orange",
  Purple: "purple",
  Red: "red",
  Royal: "royalblue",
  Sand: "sandybrown",
  "Sport Grey": "lightgray",
  White: "white",
};

export function mapColorToCss(color: string): string {
  return COLOR_HEX_MAP[color] ?? "#D3D3D3";
}
