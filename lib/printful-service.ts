interface PrintfulSyncProduct {
  sync_product: {
    name: string;
    thumbnail?: string;
  };
  sync_variants: Array<{
    retail_price: string;
    variant_id: number;
    files?: Array<{
      url: string;
      type: string;
    }>;
  }>;
}

class PrintfulService {
  private apiKey: string;
  private storeId: string;
  private baseUrl = "https://api.printful.com";

  constructor() {
    this.apiKey = process.env.PRINTFUL_API_KEY!;
    this.storeId = process.env.PRINTFUL_STORE_ID!;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Printful API error: ${res.status} - ${errorText}`);
    }

    return res.json();
  }

  // Create product in Printful
  async createSyncProduct(productData: {
    name: string;
    images: string[];
    variants: Array<{
      size: string;
      color: string;
      price: number;
    }>;
    templateId: number;
  }) {
    const printfulProduct: PrintfulSyncProduct = {
      sync_product: {
        name: productData.name,
        thumbnail: productData.images[0],
      },
      sync_variants: productData.variants.map((variant) => ({
        retail_price: variant.price.toFixed(2),
        variant_id: this.getVariantId(
          productData.templateId,
          variant.size,
          variant.color
        ),
        files: productData.images.map((img) => ({
          url: img,
          type: "front",
        })),
      })),
    };

    const res = await this.request("/store/products", {
      method: "POST",
      body: JSON.stringify(printfulProduct),
    });
    return res.result;
  }

  // Update product in Printful
  async updateSyncProduct(printfulProductId: number, productData: any) {
    const res = await this.request(`/store/products/${printfulProductId}`, {
      method: "DELETE",
    });
  }

  // Delete product in Printful
  async deleteSyncProduct(printfulProductId: number) {
    await this.request(`/store/products/${printfulProductId}`, {
      method: "DELETE",
    });
  }

  // Get available templates
  async getProductTemplates() {
    const res = await this.request("/products");
    return res.result;
  }

  // Helper to map size/color to Printful variant ID
  private getVariantId(
    templateId: number,
    size: string,
    color: string
  ): number {
    // This mapping depends on Printful's variant system
    // You'll need to fetch available variants for each template
    // For now, returning a placeholder
    return 1; // You'll replace this with actual mapping logic
  }
}

export const printfulService = new PrintfulService();
