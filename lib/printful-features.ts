export const PRINTFUL_PRODUCT_FEATURES: Record<number, string[]> = {
  // Gildan 18500 - Heavy Blend Hoodie
  146: [
    "50% pre-shrunk cotton, 50% polyester",
    "Fabric weight: 8.0 oz./yd² (271.25 g/m²)",
    "Air-jet spun yarn with soft feel and reduced pilling",
    "Double-lined hood with matching drawcord",
    "Quarter-turned body to avoid crease down middle",
    "1 x 1 athletic rib-knit cuffs and waistband with spandex",
    "Front pouch pocket",
    "Double-needle stitched collar, shoulders, armholes, cuffs, and hem",
  ],

  // Gildan 18000 - Heavy Blend Crewneck Sweatshirt
  145: [
    "50% cotton, 50% polyester",
    "Medium-heavy fabric (8.0 oz/yd²)",
    "Classic fit with crew neckline",
    "1x1 athletic rib knit collar with spandex",
    "Air-jet spun yarn with soft feel",
    "Double-needle stitching at shoulders, armholes, neck, waistband and cuffs",
    "Quarter-turned to eliminate center crease",
    "Machine washable",
  ],

  // Gildan 5000 - Unisex Classic Tee
  438: [
    "100% Cotton",
    "Sport Grey is 90% cotton, 10% polyester",
    "Ash Grey is 99% cotton, 1% polyester",
    "Heather colors are 50% cotton, 50% polyester",
    "Fabric weight: 5.0–5.3 oz/yd² (170–180 g/m²)",
    "Pre-shrunk jersey knit",
    "Open-end yarn",
    "Taped neck and shoulders",
    "Double seam at sleeves and bottom hem",
    "Tear-away tag",
  ],

  // Bella + Canvas 3483 - Unisex Muscle Shirt
  365: [
    "100% airlume combed ring-spun cotton",
    "Fabric weight: 4.2 oz/y² (142 g/m²)",
    "32 singles",
    "Relaxed fit",
    "Side-seamed construction",
    "Wide, low-cut armholes",
    "Open-end yarn",
    "Tear-away tag",
  ],

  // Vintage Corduroy Cap
  662: [
    "100% cotton corduroy",
    "Unstructured, 6-panel, low-profile crown",
    "Cotton twill sweatband and taping",
    "6 embroidered eyelets",
    "Adjustable strap with a gold-colored metal buckle",
  ],
};

export function getProductFeatures(templateId: number): string[] {
  return (
    PRINTFUL_PRODUCT_FEATURES[templateId] || [
      "Premium quality fabric",
      "Comfortable classic fit",
      "Durable construction",
      "Machine washable",
    ]
  );
}

export type SizeGuideEntry = {
  size: string;
  measurements: Record<string, string>;
  label?: string;
};

export const PRINTFUL_SIZE_GUIDES: Record<number, SizeGuideEntry[]> = {
  // Gildan 18500 - Heavy Blend Hoodie
  146: [
    {
      size: "S",
      measurements: { length: "27", width: "20", sleeveLength: "33 1/2" },
    },
    {
      size: "M",
      measurements: { length: "28", width: "22", sleeveLength: "34 1/2" },
    },
    {
      size: "L",
      measurements: { length: "29", width: "24", sleeveLength: "35 1/2" },
    },
    {
      size: "XL",
      measurements: { length: "30", width: "26", sleeveLength: "36 1/2" },
    },
    {
      size: "2XL",
      measurements: { length: "31", width: "28", sleeveLength: "37 1/2" },
    },
    {
      size: "3XL",
      measurements: { length: "32", width: "30", sleeveLength: "38 1/2" },
    },
    {
      size: "4XL",
      measurements: { length: "33", width: "32", sleeveLength: "39 1/2" },
    },
    {
      size: "5XL",
      measurements: { length: "34", width: "34", sleeveLength: "40 1/2" },
    },
  ],

  // Gildan 18000 - Heavy Blend Crewneck Sweatshirt
  145: [
    {
      size: "S",
      measurements: { length: "27", width: "20", sleeveLength: "33 1/2" },
    },
    {
      size: "M",
      measurements: { length: "28", width: "22", sleeveLength: "34 1/2" },
    },
    {
      size: "L",
      measurements: { length: "29", width: "24", sleeveLength: "35 1/2" },
    },
    {
      size: "XL",
      measurements: { length: "30", width: "26", sleeveLength: "36 1/2" },
    },
    {
      size: "2XL",
      measurements: { length: "31", width: "28", sleeveLength: "37 1/2" },
    },
    {
      size: "3XL",
      measurements: { length: "32", width: "30", sleeveLength: "38 1/2" },
    },
    {
      size: "4XL",
      measurements: { length: "33", width: "32", sleeveLength: "39 1/2" },
    },
    {
      size: "5XL",
      measurements: { length: "34", width: "34", sleeveLength: "40 1/2" },
    },
  ],

  // Gildan 5000 - Unisex Classic Tee
  438: [
    {
      size: "S",
      measurements: { length: "28", width: "18", sleeveLength: "15 5/8" },
    },
    {
      size: "M",
      measurements: { length: "29", width: "20", sleeveLength: "17" },
    },
    {
      size: "L",
      measurements: { length: "30", width: "22", sleeveLength: "18 1/2" },
    },
    {
      size: "XL",
      measurements: { length: "31", width: "24", sleeveLength: "20" },
    },
    {
      size: "2XL",
      measurements: { length: "32", width: "26", sleeveLength: "21 1/2" },
    },
    {
      size: "3XL",
      measurements: { length: "33", width: "28", sleeveLength: "22 3/4" },
    },
    {
      size: "4XL",
      measurements: { length: "34", width: "30", sleeveLength: "24 1/4" },
    },
    {
      size: "5XL",
      measurements: { length: "35", width: "32", sleeveLength: "25 1/4" },
    },
  ],

  // Bella + Canvas 3483 - Unisex Muscle Shirt
  365: [
    {
      size: "S",
      measurements: { length: "26", width: "18" },
    },
    {
      size: "M",
      measurements: { length: "27", width: "20" },
    },
    {
      size: "L",
      measurements: { length: "28", width: "21 5/8" },
    },
    {
      size: "XL",
      measurements: { length: "29", width: "23 5/8" },
    },
    {
      size: "2XL",
      measurements: { length: "30", width: "25 5/8" },
    },
  ],

  // Vintage Corduroy Cap
  662: [
    {
      size: "One Size",
      measurements: {
        A: "20-22", // Circumference
        B: "6", // Crown height
        C: "3", // Bill height
        D: "7", // Bill width
      },
      label: "A: Circumference, B: Crown height, C: Bill height, D: Bill width",
    },
  ],
};

// Category Helper
export const CATEGORY_ALIASES: Record<string, string> = {
  // tees
  tshirt: "T-Shirt",
  tshirts: "T-Shirt",
  tee: "T-Shirt",
  unisextshirt: "T-Shirt",
  unisextee: "T-Shirt",
  tshirtunisex: "T-Shirt",
  // hoodies
  hoodie: "Hoodie",
  hoodies: "Hoodie",
  pulloverhoodie: "Hoodie",
  // crewneck
  crewneck: "Crewneck",
  crewnecks: "Crewneck",
  sweatshirt: "Crewneck",
  crewnecksweatshirt: "Crewneck",
  // muscle
  muscletee: "Muscle-Tee",
  muscleshirt: "Muscle-Tee",
  tank: "Muscle-Tee",
  // caps/hats
  cap: "Cap",
  caps: "Cap",
  hat: "Cap",
  hats: "Cap",
  corduroycap: "Cap",
  vintagecorduroycap: "Cap",
};

export const SUPPORTED_GUIDE_CATEGORIES = [
  "tshirt",
  "hoodie",
  "crewneck",
  "muscletee",
  "cap",
] as const;

export function canonicalizeCategory(raw: string): string {
  const key = raw.toLowerCase().replace(/[^a-z]/g, "");
  return CATEGORY_ALIASES[key] ?? key;
}

export function pickGuideCategory(categories: string[] = []): string | null {
  for (const raw of categories) {
    const c = canonicalizeCategory(raw);
    if ((SUPPORTED_GUIDE_CATEGORIES as readonly string[]).includes(c)) return c;
  }
  return null;
}
