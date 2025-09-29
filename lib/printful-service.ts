// ✅ NEW: Interface for createSyncProduct parameters (replaces the inline object)
interface CreateSyncProductParams {
  name: string;
  images: string[];
  templateId: number;
  variants: Array<{
    size: string;
    color: string;
    price: number;
  }>;
  // ✅ NEW: Optional design data for positioned designs
  designData?: {
    designFile: string;
    position: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    printArea: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    templateInfo: any;
  };
}

// ✅ UPDATED: Extended the existing interface to support design files
interface PrintfulSyncProduct {
  sync_product: {
    name: string;
    thumbnail?: string;
  };
  sync_variants: Array<{
    retail_price: string;
    variant_id: number;
    files?: Array<{
      url?: string; // ✅ UPDATED: Made optional
      id?: number; // ✅ NEW: For uploaded design files
      type: string;
      position?: {
        // ✅ NEW: For design positioning
        area_width: number;
        area_height: number;
        width: number;
        height: number;
        top: number;
        left: number;
      };
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
      throw new Error(`Printful API error`);
    }

    return res.json();
  }

  async getTemplateVariants(templateId: number) {
    try {
      const response = await this.request(`/products/${templateId}`);
      return response.result.variants || [];
    } catch (error) {
      console.error("Error fetching template variants: ", error);
      throw new Error("Failed to fetch variants");
    }
  }

  // Updated to use new interface and handle design data
  async createSyncProduct(
    params: CreateSyncProductParams
  ): Promise<{ success: boolean; id?: number; message?: string }> {
    try {
      const { name, images, variants, templateId, designData } = params;

      let designFileId = null;

      if (designData) {
        try {
          designFileId = await this.uploadDesignFile(designData.designFile);
        } catch (error) {
          console.error("❌ Failed to upload design file: ", error);
          throw new Error("Design upload failed");
        }
      }

      // Update to use async variant lookup
      const syncVariants = await Promise.all(
        variants.map(async (variant) => {
          const variantId = await this.getVariantId(
            templateId,
            variant.size,
            variant.color
          );

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const variantData: any = {
            retail_price: variant.price.toFixed(2),
            variant_id: variantId,
          };

          if (designFileId && designData) {
            variantData.files = [
              {
                id: designFileId,
                type: "front",
                position: {
                  area_width: designData.position.width,
                  area_height: designData.position.height,
                  width: designData.position.width,
                  height: designData.position.height,
                  top: designData.position.y,
                  left: designData.position.x,
                },
              },
            ];
          } else if (images.length > 0) {
            variantData.files = images.map((img) => ({
              url: img,
              type: "front",
            }));
          }

          return variantData;
        })
      );

      const printfulProduct: PrintfulSyncProduct = {
        sync_product: {
          name,
          thumbnail: images[0],
        },
        sync_variants: syncVariants,
      };

      const response = await this.request("/store/products", {
        method: "POST",
        body: JSON.stringify(printfulProduct),
      });

      console.log("Printful product created successfully");
      return {
        success: true,
        id: response.result?.sync_product?.id as number,
        message: "Product created",
      };
    } catch (error) {
      console.error("Printful product creation failed: ", error);
      return { success: false, message: "Product creation failed" };
    }
  }

  async uploadDesignFile(designFileUrl: string): Promise<number> {
    // Handle blob URLs by throwing an error (we'll handle this in the component)
    if (designFileUrl.startsWith("blob:")) {
      throw new Error(
        "Design file must be uploaded to server first. Blob URLs cannot be accessed by Printful."
      );
    }

    const fileData = {
      type: "default",
      url: designFileUrl, // This should now be a public URL
      filename: `design_${Date.now()}.png`,
    };

    const res = await this.request("/files", {
      method: "POST",
      body: JSON.stringify(fileData),
    });

    return res.result.id;
  }

  // Update product in Printful
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async updateSyncProduct(printfulProductId: number, productData: any) {
    await this.request(`/store/products/${printfulProductId}`, {
      method: "PUT",
      body: JSON.stringify(productData),
    });
    console.log("Printful product updated");
  }

  // Delete product in Printful
  async deleteSyncProduct(printfulProductId: number) {
    await this.request(`/store/products/${printfulProductId}`, {
      method: "DELETE",
    });
    console.log("Printful product deleted");
  }

  // Get available templates
  async getProductTemplates() {
    const res = await this.request("/products");
    return res.result;
  }

  // Helper to map size/color to Printful variant ID
  private async getVariantId(
    templateId: number,
    size: string,
    color: string
  ): Promise<number> {
    try {
      // Get available variants for this template
      const res = await this.request(`/products/${templateId}`);
      const variants = res.result?.variants || [];

      // Find matching variant with flexible color matching
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const variant = variants.find((v: any) => {
        const sizeMatch = v.size?.toLowerCase() === size.toLowerCase();
        const colorMatch =
          v.color?.toLowerCase() === color.toLowerCase() ||
          v.color?.toLowerCase().includes(color.toLowerCase()) ||
          color.toLowerCase().includes(v.color?.toLowerCase());

        return sizeMatch && colorMatch;
      });

      if (variant) {
        return variant.id;
      } else {
        throw new Error(`No matching variant found for ${size} ${color}`);
      }
    } catch (error) {
      console.error("Error fetching variants: ", error);
      throw new Error("Failed to fetch variants");
    }
  }
}

export const printfulService = new PrintfulService();
