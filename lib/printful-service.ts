/* eslint-disable @typescript-eslint/no-explicit-any */
// Interface for createSyncProduct parameters (replaces the inline object)
interface CreateSyncProductParams {
  name: string;
  images: string[];
  templateId: number;
  variants: Array<{
    size: string;
    color: string;
    price: number;
  }>;
  // Optional design data for positioned designs
  designData?: {
    designFile: string;
    position: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    printArea: any;
    templateInfo: any;
  };
}

// Extended the existing interface to support design files
interface PrintfulSyncProduct {
  sync_product: {
    name: string;
    thumbnail?: string;
  };
  sync_variants: Array<{
    retail_price: string;
    variant_id: number;
    files?: Array<{
      url?: string;
      id?: number;
      type: string;
      position?: {
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
      const errorText = await res.text();
      console.error(`Printful API error (${res.status}):`, errorText);
      throw new Error(`Printful API error: ${res.status} - ${errorText}`);
    }

    return res.json();
  }

  async getTemplateVariants(templateId: number) {
    const res = await this.request(
      `/products/${templateId}?include=variant_files`
    );

    return {
      product: res.result?.product ?? null,
      variants: res.result?.variants ?? [],
      variant_files: res.result?.variant_files ?? [],
    };
  }

  // Updated to use new interface and handle design data
  async createSyncProduct(params: CreateSyncProductParams): Promise<{
    success: boolean;
    id?: number;
    message?: string;
  }> {
    try {
      const { name, images, variants, templateId, designData } = params;

      let designFileId = null;

      if (designData) {
        try {
          designFileId = await this.uploadDesignFile(designData.designFile);
        } catch (error) {
          console.error("Failed to upload design file: ", error);
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

          const variantData: any = {
            retail_price: variant.price.toFixed(2),
            variant_id: variantId,
          };

          if (designFileId && designData) {
            variantData.files = [
              {
                id: designFileId,
                type: "default",
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
              type: "default",
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

      const printfulProductId = response.result?.id as number;

      if (!printfulProductId) {
        throw new Error("No product ID returned from Printful");
      }

      return {
        success: true,
        id: printfulProductId,
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
  async updateSyncProduct(printfulProductId: number, productData: any) {
    await this.request(`/store/products/${printfulProductId}`, {
      method: "PUT",
      body: JSON.stringify(productData),
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

  // Fetch mockups from created product
  async generateProductMockups(
    printfulProductId: number,
    maxAttempts: number = 10
  ): Promise<string[]> {
    try {
      // Get the sync product to extract catalog product ID and design file
      const productRes = await this.request(
        `/store/products/${printfulProductId}`
      );
      const variants = productRes.result?.sync_variants || [];

      if (variants.length === 0) {
        throw new Error("No variants found");
      }

      const firstVariant = variants[0];
      const catalogProductId = firstVariant.product?.product_id;
      const files = firstVariant.files || [];

      if (!catalogProductId) {
        throw new Error("No catalog product ID found");
      }

      if (files.length === 0) {
        throw new Error("No design files found");
      }

      const designFile = files.find((f: any) => f.type === "default");

      if (!designFile) {
        throw new Error("No design file found");
      }

      // Create mockup generation task
      const mockupRequest = {
        variant_ids: [firstVariant.variant_id],
        format: "jpg",
        files: [
          {
            placement: "front",
            image_url: designFile.url,
            position: designFile.position || {
              area_width: 1800,
              area_height: 2400,
              width: 1800,
              height: 1800,
              top: 300,
              left: 0,
            },
          },
        ],
      };

      const taskRes = await this.request(
        `/mockup-generator/create-task/${catalogProductId}`,
        {
          method: "POST",
          body: JSON.stringify(mockupRequest),
        }
      );

      const taskKey = taskRes.result?.task_key;

      if (!taskKey) {
        throw new Error("No task key returned");
      }

      // Poll for completion
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 3000));

        const statusRes = await this.request(
          `/mockup-generator/task?task_key=${taskKey}`
        );
        const status = statusRes.result?.status;

        if (status === "completed") {
          const mockups = statusRes.result?.mockups || [];
          const mockupUrls = mockups
            .map((m: any) => m.mockup_url)
            .filter(Boolean);

          if (mockupUrls.length > 0) {
            return mockupUrls;
          }
        } else if (status === "failed") {
          throw new Error("Mockup generation failed");
        }
      }

      throw new Error("Mockup generation timed out");
    } catch (error) {
      console.error("Mockup generation error:", error);
      return [];
    }
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
