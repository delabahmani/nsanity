import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import Button from "../ui/Button";
import useImageUpload from "@/hooks/useImageUpload";
import FileUploader from "./FileUploader";
import Image from "next/image";
import DesignCanvas from "./DesignCanvas";
import { canonicalizeCategory } from "@/lib/printful-features";

type ProductFormData = {
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
};

interface PrintArea {
  title: string;
  width: number;
  height: number;
  top?: number;
  left?: number;
  templateWidth?: number;
  templateHeight?: number;
  template_url?: string;
}

interface PrintfulTemplate {
  id: number;
  title: string;
  brand: string;
  model: string;
  image: string;
}

interface PrintfulVariantFile {
  type: string | null;
  position: string | null;
  preview_url: string | null;
  thumbnail_url: string | null;
}

interface PrintfulVariant {
  id: number;
  name: string;
  size: string;
  color: string;
  price: string;
  image: string;
  files: PrintfulVariantFile[];
}

interface PrintfulVariantsData {
  variants: PrintfulVariant[];
  uniqueSizes: string[];
  uniqueColors: string[];
  variantsBySize: Record<string, string[]>;
}

const PRINTFUL_TEMPLATES = [
  { id: 438, name: "Unisex T-Shirt" },
  { id: 146, name: "Unisex Hoodie" },
  { id: 365, name: "Unisex Muscle Tee" },
  { id: 145, name: "Unisex Crew Neck Sweatshirt" },
  { id: 662, name: "Vintage Corduroy Cap" },
];

export default function AddProductContainer() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Design canvas states
  const [designFile, setDesignFile] = useState<string | null>(null);
  const [showDesignCanvas, setShowDesignCanvas] = useState(false);
  const [finalDesignData, setFinalDesignData] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
    designFile: string;
  } | null>(null);

  // Printful variants states
  const [printfulVariants, setPrintfulVariants] =
    useState<PrintfulVariantsData | null>(null);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [mockupUrl, setMockupUrl] = useState<string | null>(null);

  // form state
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: 0,
    colors: [],
    images: [],
    categories: [],
    sizes: [],
    inStock: false,
    isFeatured: false,
    printfulTemplateId: null,
  });

  const [inputs, setInputs] = useState({
    colors: "",
    categories: "",
    sizes: "",
    images: "",
  });

  const [printAreas, setPrintAreas] = useState<PrintArea[] | null>(null);
  const [selectedTemplate, setSelectedTemplate] =
    useState<PrintfulTemplate | null>(null);
  const [loadingPrintAreas, setLoadingPrintAreas] = useState(false);

  const {
    previews,
    isUploading,
    handleFilesSelected,
    handleFilePreviewsGenerated,
    removeFile,
    uploadFiles,
  } = useImageUpload();

  const updateMockupForColor = useCallback(
    (color?: string | null) => {
      if (!printfulVariants?.variants?.length) {
        setMockupUrl(selectedTemplate?.image ?? null);
        return;
      }

      let matchingVariant: PrintfulVariant | undefined;

      if (color) {
        matchingVariant = printfulVariants.variants.find(
          (variant) => variant.color.toLowerCase() === color.toLowerCase()
        );
      }

      const chosenVariant = matchingVariant ?? printfulVariants.variants[0];

      if (!chosenVariant) {
        setMockupUrl(selectedTemplate?.image ?? null);
        return;
      }

      const frontPreview = chosenVariant.files.find(
        (file) => file.type === "preview" && file.position === "front"
      );

      const anyPreview = chosenVariant.files.find(
        (file) => file.type === "preview"
      );

      const newMockupUrl =
        frontPreview?.preview_url ??
        frontPreview?.thumbnail_url ??
        anyPreview?.preview_url ??
        anyPreview?.thumbnail_url ??
        chosenVariant.image ??
        selectedTemplate?.image ??
        null;

      setMockupUrl(newMockupUrl);
    },
    [printfulVariants, selectedTemplate]
  );

  useEffect(() => {
    const fetchPrintAreas = async () => {
      if (!formData.printfulTemplateId) {
        setPrintAreas(null);
        setSelectedTemplate(null);
        setMockupUrl(null);
        return;
      }

      setLoadingPrintAreas(true);
      try {
        const res = await fetch(
          `/api/admin/printful/print-areas/${formData.printfulTemplateId}`
        );
        const data = await res.json();

        if (data.success) {
          setPrintAreas(data.printAreas);
          setSelectedTemplate(data.product);
        } else {
          console.error("Failed to fetch print areas: ", data.error);
          toast.error("Failed to load print areas");
        }
      } catch (error) {
        console.error("Error fetching print areas: ", error);
        toast.error("Error loading print areas");
      } finally {
        setLoadingPrintAreas(false);
      }
    };

    fetchPrintAreas();
  }, [formData.printfulTemplateId]);

  // Fetch Printful variants (keep categories intact)
  useEffect(() => {
    const fetchPrintfulVariants = async () => {
      if (!formData.printfulTemplateId) {
        setPrintfulVariants(null);
        setSelectedSizes([]);
        setSelectedColors([]);
        setMockupUrl(null);
        return;
      }

      setLoadingVariants(true);
      try {
        const res = await fetch(
          `/api/admin/printful/variants/${formData.printfulTemplateId}`
        );
        const data = await res.json();

        if (data.success) {
          setPrintfulVariants(data);
          setSelectedSizes([]);
          setSelectedColors([]);
          setFormData((prev) => ({
            ...prev,
            sizes: [],
            colors: [],
          }));
        } else {
          console.error("Failed to fetch variants:", data.error);
          toast.error("Failed to load product variants");
        }
      } catch (error) {
        console.error("Error fetching variants:", error);
        toast.error("Error loading product variants");
      } finally {
        setLoadingVariants(false);
      }
    };

    fetchPrintfulVariants();
  }, [formData.printfulTemplateId]);

  // Update mockup when selections change
  useEffect(() => {
    if (formData.printfulTemplateId && selectedTemplate) {
      updateMockupForColor(selectedColors[0] ?? null);
    } else if (selectedTemplate) {
      setMockupUrl(selectedTemplate.image);
    } else {
      setMockupUrl(null);
    }
  }, [
    formData.printfulTemplateId,
    selectedTemplate,
    selectedColors,
    updateMockupForColor,
  ]);

  useEffect(() => {
    if (printfulVariants?.variants?.length && !selectedColors.length) {
      updateMockupForColor(printfulVariants.variants[0]?.color ?? null);
    }
  }, [printfulVariants, selectedColors.length, updateMockupForColor]);

  useEffect(() => {
    if (
      formData.printfulTemplateId &&
      selectedSizes.length > 0 &&
      selectedColors.length > 0
    ) {
      setFormData((prev) => ({
        ...prev,
        sizes: selectedSizes,
        colors: selectedColors,
      }));
    }
  }, [selectedSizes, selectedColors, formData.printfulTemplateId]);

  const handleSizeChange = (size: string, checked: boolean) => {
    setSelectedSizes((prev) =>
      checked ? [...prev, size] : prev.filter((s) => s !== size)
    );
  };

  const handleColorChange = (color: string, checked: boolean) => {
    setSelectedColors((prev) => {
      const next = checked
        ? [...prev, color]
        : prev.filter((existingColor) => existingColor !== color);

      const referenceColor = checked ? color : next[0];
      if (referenceColor) {
        updateMockupForColor(referenceColor);
      } else {
        updateMockupForColor(null);
      }

      return next;
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "number") {
      setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = parseInt(e.target.value) || null;
    setFormData((prev) => ({
      ...prev,
      printfulTemplateId: templateId,
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const addItem = (type: "colors" | "categories" | "sizes" | "images") => {
    const value = inputs[type].trim();
    if (!value) return;

    const token = type === "categories" ? canonicalizeCategory(value) : value;

    if (!formData[type].includes(token)) {
      setFormData((prev) => ({
        ...prev,
        [type]: [...prev[type], token],
      }));
    }
    setInputs((prev) => ({ ...prev, [type]: "" }));
  };

  const removeItem = (
    type: "colors" | "categories" | "sizes" | "images",
    item: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [type]: prev[type].filter((i) => i !== item),
    }));
  };

  const convertBlobToBase64 = async (blobUrl: string): Promise<string> => {
    const response = await fetch(blobUrl);
    const blob = await response.blob();

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (formData.printfulTemplateId && !finalDesignData) {
        toast.error("Please position your design on the canvas first!");
        setIsLoading(false);
        return;
      }

      const imageUrls = await uploadFiles();

      let designFileData = null;
      if (finalDesignData && designFile) {
        const base64Design = await convertBlobToBase64(designFile);
        designFileData = {
          ...finalDesignData,
          designFile: base64Design,
          printArea: printAreas?.[0],
          templateInfo: selectedTemplate,
        };
      }

      const productImages =
        formData.printfulTemplateId && mockupUrl
          ? [mockupUrl, ...imageUrls]
          : imageUrls;

      const productData = {
        ...formData,
        images: productImages,
        designData: designFileData,
      };

      if (!formData.name) {
        toast.error("Product name is required!");
        setIsLoading(false);
        return;
      }

      if (formData.price <= 0) {
        toast.error("Price must be greater than 0!");
        setIsLoading(false);
        return;
      }

      if (formData.printfulTemplateId && productImages.length === 0) {
        toast.error("No product image available. Please try again");
        setIsLoading(false);
        return;
      }

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (!res.ok) {
        toast.error("Failed to create product");
        throw new Error("Failed to create product");
      }

      const { product } = await res.json();

      if (formData.printfulTemplateId && product.id) {
        toast.loading("Generating Printful mockups...", { id: "mockups" });

        try {
          const mockupRes = await fetch(
            `/api/admin/printful/mockups/${product.id}`,
            {
              method: "POST",
            }
          );

          const mockupData = await mockupRes.json();

          if (mockupData.success) {
            toast.success("Mockups generated successfuly!", { id: "mockups" });
          } else if (mockupRes.status === 202) {
            toast.success(
              "Product created! Mockups will be available shortly.",
              { id: "mockups" }
            );
          } else {
            toast.error("Mockups not ready yet", { id: "mockups" });
          }
        } catch (mockupError) {
          console.error("Error fetching mockups: ", mockupError);
          toast.error("Product created, but mockups failed ot load", {
            id: "mockups",
          });
        }
      }

      setFormData({
        name: "",
        description: "",
        price: 0,
        colors: [],
        images: [],
        categories: [],
        sizes: [],
        inStock: true,
        isFeatured: false,
        printfulTemplateId: null,
      });

      setDesignFile(null);
      setShowDesignCanvas(false);
      setFinalDesignData(null);
      setPrintAreas(null);
      setSelectedTemplate(null);
      setMockupUrl(null);

      toast.success("Product created successfully!");
      router.push("/admin");
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  // Design file handler
  const handleDesignUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const designUrl = URL.createObjectURL(file);
    setDesignFile(designUrl);
    setShowDesignCanvas(true);
  };

  // UI
  return (
    <div className="max-w-6xl mx-auto min-h-screen">
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
      >
        {/* LEFT COLUMN: Details & Options */}
        <div className="lg:col-span-7 space-y-6">
          {/* Basic Info */}
          <div className="border rounded-lg p-4 bg-white">
            <h3 className="font-semibold mb-4">Basic info</h3>

            <div className="space-y-4">
              <div>
                <label>product name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border border-nsanity-darkorange rounded-md p-2"
                  placeholder="product name"
                  disabled={isLoading || isUploading}
                  required
                />
              </div>

              <div>
                <label>description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full p-2 border border-nsanity-darkorange rounded-md"
                  disabled={isLoading || isUploading}
                  placeholder="product description"
                />
              </div>

              <div>
                <label className="font-medium mb-1">Categories</label>
                <div className="flex">
                  <input
                    type="text"
                    name="categories"
                    value={inputs.categories}
                    onChange={handleInputChange}
                    className="p-2 border border-nsanity-darkorange rounded-md flex-1"
                    placeholder='Add a category (e.g., "tshirt", "hoodie", "cap")'
                    disabled={isLoading || isUploading}
                  />
                  <Button
                    type="button"
                    onClick={() => addItem("categories")}
                    className="ml-2"
                  >
                    Add
                  </Button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.categories.map((category) => (
                    <span
                      key={category}
                      className="bg-nsanity-darkorange text-white px-2 py-1 rounded-md flex items-center"
                    >
                      {category}
                      <button
                        type="button"
                        onClick={() => removeItem("categories", category)}
                        className="ml-1 text-nsanity-red hover:text-red-700"
                        disabled={isLoading || isUploading}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Used for filtering and size guide matching.
                </p>
              </div>

              <div>
                <label>price</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  step={0.01}
                  min={1.0}
                  className="w-full p-2 border border-nsanity-darkorange rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Product options */}
          <div className="border rounded-lg p-4 bg-white">
            <h3 className="font-semibold mb-4">Product options</h3>

            <div>
              <label>Printful Product Type</label>
              <select
                name="printfulTemplateId"
                value={formData.printfulTemplateId || ""}
                onChange={handleTemplateChange}
                className="w-full border border-nsanity-darkorange rounded-md p-2"
                disabled={isLoading || isUploading}
              >
                <option value="">No Print-on-Demand (Manual Product)</option>
                {PRINTFUL_TEMPLATES.map((template) => (
                  <option value={template.id} key={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>

              {loadingVariants && (
                <p className="text-sm text-black/75 mt-3">
                  Loading available options...
                </p>
              )}
              {loadingPrintAreas && (
                <p className="text-sm text-black/75 mt-3">
                  Loading print areas...
                </p>
              )}

              <p className="text-sm text-black/75 mt-3">
                {formData.printfulTemplateId
                  ? "Select sizes and colors from available Printful options below"
                  : "Leave blank for manual product management"}
              </p>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              {formData.printfulTemplateId && printfulVariants ? (
                <>
                  <div>
                    <label className="font-medium mb-3 block">
                      Available Sizes
                    </label>
                    <div className="space-y-2 max-h-40 overflow-y-auto border border-nsanity-darkorange rounded-md p-3">
                      {printfulVariants.uniqueSizes.map((size) => (
                        <label
                          key={size}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="checkbox"
                            checked={selectedSizes.includes(size)}
                            onChange={(e) =>
                              handleSizeChange(size, e.target.checked)
                            }
                            disabled={isLoading || isUploading}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm">{size}</span>
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Selected: {selectedSizes.join(", ") || "None"}
                    </p>
                  </div>

                  <div>
                    <label className="font-medium mb-3 block">
                      Available Colors
                    </label>
                    <div className="space-y-2 max-h-40 overflow-y-auto border border-nsanity-darkorange rounded-md p-3">
                      {printfulVariants.uniqueColors.map((color) => (
                        <label
                          key={color}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="checkbox"
                            checked={selectedColors.includes(color)}
                            onChange={(e) =>
                              handleColorChange(color, e.target.checked)
                            }
                            disabled={isLoading || isUploading}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm">{color}</span>
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Selected: {selectedColors.join(", ") || "None"}
                    </p>
                  </div>
                </>
              ) : !formData.printfulTemplateId ? (
                <>
                  <div>
                    <label className="font-medium mb-1">Colors</label>
                    <div className="flex">
                      <input
                        type="text"
                        name="colors"
                        value={inputs.colors}
                        onChange={handleInputChange}
                        className="border border-nsanity-darkorange rounded-md p-2 flex-1"
                        placeholder="Add a color (e.g., Red)"
                        disabled={isLoading || isUploading}
                      />
                      <Button
                        type="button"
                        onClick={() => addItem("colors")}
                        className="ml-2"
                      >
                        Add
                      </Button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.colors.map((color) => (
                        <span
                          key={color}
                          className="bg-nsanity-darkorange text-white px-2 py-1 rounded-md flex items-center"
                        >
                          {color}
                          <button
                            type="button"
                            onClick={() => removeItem("colors", color)}
                            className="ml-1 text-nsanity-red hover:text-red-700"
                            disabled={isLoading || isUploading}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="font-medium mb-1">Sizes</label>
                    <div className="flex">
                      <input
                        type="text"
                        name="sizes"
                        value={inputs.sizes}
                        onChange={handleInputChange}
                        className="p-2 border border-nsanity-darkorange rounded-md flex-1"
                        placeholder="Add a size (e.g., S, M, L)"
                        disabled={isLoading || isUploading}
                      />
                      <Button
                        type="button"
                        onClick={() => addItem("sizes")}
                        className="ml-2"
                      >
                        Add
                      </Button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.sizes.map((size) => (
                        <span
                          key={size}
                          className="bg-nsanity-darkorange text-white px-2 py-1 rounded-md flex items-center"
                        >
                          {size}
                          <button
                            type="button"
                            onClick={() => removeItem("sizes", size)}
                            className="ml-1 text-nsanity-red hover:text-red-700"
                            disabled={isLoading || isUploading}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="md:col-span-2 text-center py-4">
                  <p>Loading product options...</p>
                </div>
              )}
            </div>
          </div>

          {/* Inventory & visibility (moved to left column) */}
          <div className="border rounded-lg p-4 bg-white">
            <h3 className="font-semibold mb-4">Inventory & visibility</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="inStock"
                  name="inStock"
                  checked={formData.inStock}
                  onChange={handleChange}
                  className="h-4 w-4 text-nsanity-darkorange border-gray-300 rounded focus:ring-nsanity-darkorange"
                  disabled={isLoading || isUploading}
                />
                <span>in stock</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isFeatured"
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                  className="h-4 w-4 text-nsanity-darkorange border-gray-300 rounded focus:ring-nsanity-darkorange"
                  disabled={isLoading || isUploading}
                />
                <span>featured product</span>
              </label>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Media, Design, Print areas (sticky) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24 self-start lg:pb-40">
          {/* Images */}
          <div className="border rounded-lg p-4 bg-white">
            <h3 className="font-semibold mb-4">Images</h3>
            <FileUploader
              onFilesSelected={handleFilesSelected}
              onFilePreviewsGenerated={handleFilePreviewsGenerated}
              onRemoveFile={removeFile}
              existingImagePreviews={previews}
            />
          </div>

          {/* Design placement (Printful only) */}
          {formData.printfulTemplateId && (
            <div className="border rounded-lg p-4 bg-white">
              <h3 className="font-semibold mb-4">design placement</h3>

              {!showDesignCanvas ? (
                <div>
                  <label className="block font-medium mb-3">
                    upload design for canvas
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleDesignUpload}
                    className="w-full p-2 border border-nsanity-darkorange rounded-md"
                    disabled={isLoading || isUploading}
                  />
                  <p className="mt-1 text-sm">
                    upload a design to position on the product mockup
                  </p>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">position your design</h4>
                    <Button
                      type="button"
                      onClick={() => {
                        setShowDesignCanvas(false);
                        setDesignFile(null);
                      }}
                      variant="ghost"
                      className="text-nsanity-red"
                    >
                      remove design
                    </Button>
                  </div>

                  {selectedTemplate &&
                    printAreas &&
                    printAreas.length > 0 &&
                    designFile && (
                      <div className="mt-6">
                        <h4 className="text-md font-semibold mb-3">
                          Design Canvas
                        </h4>
                        <DesignCanvas
                          productMockup={mockupUrl ?? selectedTemplate.image}
                          uploadedDesign={designFile}
                          printArea={{
                            x: printAreas[0].left ?? 0,
                            y: printAreas[0].top ?? 0,
                            width: printAreas[0].width,
                            height: printAreas[0].height,
                          }}
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          onDesignUpdate={(designData: any) => {
                            setFinalDesignData({
                              ...designData,
                              designFile: designFile,
                            });
                          }}
                        />
                      </div>
                    )}

                  <div className="mt-4 text-sm text-gray-600">
                    <p>• Drag the design to position it</p>
                    <p>• Use the corner handles to resize</p>
                    <p>• Design must stay within the red dashed area</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Print areas (info) */}
          {printAreas && selectedTemplate && !showDesignCanvas && (
            <div className="border rounded-lg p-4 bg-white">
              <h3 className="font-semibold mb-2">Print areas</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm">
                    Template: {selectedTemplate.title}
                  </h4>
                  <Image
                    src={mockupUrl ?? selectedTemplate.image}
                    alt={selectedTemplate.title}
                    width={200}
                    height={200}
                    className="w-32 h-32 rounded border object-contain bg-white"
                  />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Areas:</h4>
                  <ul className="text-sm space-y-1">
                    {printAreas.map((area, i) => (
                      <li key={i} className="flex justify-between">
                        <span>{area.title}</span>
                        <span>
                          {area.width}x{area.height}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="lg:col-span-7 flex items-center justify-center gap-4 py-5 relative z-10">
          <Button
            type="button"
            onClick={() => router.back()}
            disabled={isLoading || isUploading}
            variant="danger"
            size="lg"
          >
            cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || isUploading}
            variant="primary"
            size="lg"
          >
            {isLoading || isUploading ? "creating..." : "create product"}
          </Button>
        </div>
      </form>
    </div>
  );
}
