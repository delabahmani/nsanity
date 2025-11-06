/* eslint-disable @typescript-eslint/no-unused-vars */
import { getProductFeatures } from "../printful-features";
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
  printfulTemplateId: number | null;
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
    if (!product) return null;

    return {
      ...product,
      features: product.printfulTemplateId
        ? getProductFeatures(product.printfulTemplateId)
        : [],
    } as Product;
  } catch (error) {
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
        printfulTemplateId: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return products.map((p) => ({
      ...p,
      features: p.printfulTemplateId
        ? getProductFeatures(p.printfulTemplateId)
        : [],
    })) as Product[];
  } catch (error) {
    return [];
  }
}

export const COLOR_HEX_MAP: Record<string, string> = {
  Ash: "#B2BEB5",
  Black: "#25282a",
  "Carolina Blue": "#4B9CD3",
  Charcoal: "#66676c",
  "Dark Chocolate": "#382f2d",
  "Dark Heather": "#425563",
  "Forest Green": "#273b33",
  Gold: "#eead1a",
  "Graphite Heather": "#707372",
  "Heather Deep Royal": "#4169E1",
  Heliconia: "#db3e79",
  "Indigo Blue": "#486d87",
  "Irish Green": "#00a74a",
  "Light Blue": "#a4c8e1",
  "Light Pink": "#e4c6d4",
  Maroon: "#5b2b42",
  "Military Green": "#5e7461",
  Navy: "#263147",
  Orange: "#f4633a",
  Purple: "#464e7e",
  Red: "#d50032",
  Royal: "#224d8f",
  Sand: "#cabfad",
  "Sport Grey": "#97999b",
  White: "white",
  "Tropical Blue": "#00859b",
  Sky: "#71c5e8",
  Cardinal: "#8a1538",
  Daisy: "#fed101",
  "Yellow Haze": "#f5e1a4",
  Azalea: "#dd74a1",
};

export function mapColorToCss(color: string): string {
  return COLOR_HEX_MAP[color] ?? "#D3D3D3";
}
