export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  categories: string[];
  sizes: string[];
  colors: string[];
  inStock: boolean;
  featured?: boolean;
};

// Dummy product data for clothing items
export const products: Product[] = [
  {
    id: "1",
    name: "Type Classic Tee",
    description:
      "Premium cotton t-shirt with minimalist design and perfect fit. A wardrobe essential for everyday style.",
    price: 29.99,
    images: [
      "/images/products/tshirt-1.webp",
      "/images/products/tshirt-2.webp",
      "/images/products/tshirt-3.webp",
    ],
    categories: ["t-shirts", "men"],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "White", "Navy"],
    inStock: true,
    featured: true,
  },
  {
    id: "2",
    name: "Retro Streetwear Hoodie",
    description:
      "Oversized hoodie with vintage graphics. Perfect for casual outings or lounging at home.",
    price: 59.99,
    images: [
      "/images/products/hoodie-1.webp",
      "/images/products/hoodie-1.webp",
    ],
    categories: ["hoodies", "unisex"],
    sizes: ["M", "L", "XL", "XXL"],
    colors: ["Gray", "Black"],
    inStock: true,
  },
  {
    id: "3",
    name: "High-Rise Cargo Pants",
    description:
      "Modern cargo pants with multiple pockets. Versatile design suitable for streetwear or casual settings.",
    price: 79.99,
    images: [],
    categories: ["pants", "unisex"],
    sizes: ["28", "30", "32", "34", "36"],
    colors: ["Khaki", "Black", "Olive"],
    inStock: true,
    featured: true,
  },
  {
    id: "4",
    name: "Structured Denim Jacket",
    description:
      "Classic denim jacket with modern fit. Durable construction that gets better with age.",
    price: 89.99,
    images: [
      "/images/products/hoodie-1.webp",
      "/images/products/hoodie-1.webp",
    ],
    categories: ["jackets", "unisex"],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Blue", "Black"],
    inStock: true,
  },
  {
    id: "5",
    name: "Essential Crew Socks",
    description:
      "Pack of 3 comfortable cotton blend socks. Perfect for everyday wear.",
    price: 19.99,
    images: [],
    categories: ["accessories", "unisex"],
    sizes: ["One Size"],
    colors: ["Mixed Pack"],
    inStock: true,
  },
  {
    id: "6",
    name: "Vintage Graphic Tee",
    description:
      "Cotton t-shirt with retro graphic print. Perfect for a casual, stylish look.",
    price: 34.99,
    images: [
      "/images/products/crewneck-1.webp",
      "/images/products/crewneck-1.webp",
    ],
    categories: ["t-shirts", "unisex"],
    sizes: ["S", "M", "L", "XL"],
    colors: ["White", "Black"],
    inStock: true,
  },
];
