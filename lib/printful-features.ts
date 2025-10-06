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
