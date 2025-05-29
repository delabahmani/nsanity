import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Button from "../ui/Button";
import useImageUpload from "@/hooks/useImageUpload";
import FileUploader from "./FileUploader";
import { Product } from "@/lib/utils/product-utils";
import Image from "next/image";

interface EditProductFormProps {
  initialData: Product;
  onSuccess?: () => void;
}

export default function EditProductForm({
  initialData,
  onSuccess,
}: EditProductFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: initialData.name,
    description: initialData.description,
    price: initialData.price,
    colors: initialData.colors || [],
    images: initialData.images || [],
    categories: initialData.categories || [],
    sizes: initialData.sizes || [],
    inStock: initialData.inStock,
    isFeatured: initialData.isFeatured,
  });

  const [inputs, setInputs] = useState({
    colors: "",
    categories: "",
    sizes: "",
    images: "",
  });

  // Initialize our custom image upload hook
  const {
    previews,
    isUploading,
    handleFilesSelected,
    handleFilePreviewsGenerated,
    removeFile,
    uploadFiles,
  } = useImageUpload();

  useEffect(() => {
    if (initialData.images && initialData.images.length > 0) {
      console.log("Initial images:", initialData.images);
    }
  }, [initialData.images]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const addItem = (type: "colors" | "categories" | "sizes" | "images") => {
    const value = inputs[type].trim();
    if (!value) return;

    if (!formData[type].includes(value)) {
      setFormData((prev) => ({
        ...prev,
        [type]: [...prev[type], value],
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Only upload new images if there are any
      let imageUrls = [...formData.images];

      // If there are new files selected, upload them
      const newUploadedUrls = await uploadFiles();

      // Combine existing images with newly uploaded ones
      if (newUploadedUrls.length > 0) {
        imageUrls = [...imageUrls, ...newUploadedUrls];
      }

      const productData = {
        ...formData,
        images: imageUrls,
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

      const res = await fetch(`/api/admin/products/${initialData.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (!res.ok) {
        throw new Error("Failed to update product");
      }

      toast.success("Product updated successfully!");

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/admin/products");
        router.refresh();
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto min-h-screen nav-pad flex flex-col">
      <h1 className="text-3xl font-bold mb-6">Edit Product</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic info */}
        <div>
          <label>Product name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border border-nsanity-darkorange rounded-md p-2"
            placeholder="Product name"
            disabled={isLoading || isUploading}
            required
          />
        </div>

        <div>
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full p-2 border border-nsanity-darkorange rounded-md"
            disabled={isLoading || isUploading}
            placeholder="Product description"
          />
        </div>

        <div>
          <label>Price</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            step={0.01}
            min={1.0}
            className="w-full p-2 border border-nsanity-darkorange rounded-md"
            disabled={isLoading || isUploading}
          />
        </div>

        <div className="space-y-2">
          <label className="block font-medium">Product Images</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            {formData.images.map((url, index) => (
              <div key={url} className="relative aspect-square">
                <Image
                  src={url}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-full object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      images: prev.images.filter((img) => img !== url),
                    }));
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center"
                  aria-label="Remove image"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <FileUploader
            onFilesSelected={handleFilesSelected}
            onFilePreviewsGenerated={handleFilePreviewsGenerated}
            onRemoveFile={removeFile}
            existingImagePreviews={previews}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="inStock"
            name="inStock"
            checked={formData.inStock}
            onChange={handleChange}
            className="h-4 w-4 text-nsanity-darkorange border-gray-300 rounded focus:ring-nsanity-darkorange"
            disabled={isLoading || isUploading}
          />
          <label htmlFor="inStock" className="ml-2 text-md">
            In stock
          </label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isFeatured"
            id="isFeatured"
            checked={formData.isFeatured}
            onChange={handleChange}
            className="h-4 w-4 text-nsanity-darkorange border-gray-300 rounded focus:ring-nsanity-darkorange"
            disabled={isLoading || isUploading}
          />
          <label htmlFor="isFeatured">Featured product</label>
        </div>

        {/* Array fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Colors */}
          <div>
            <label className="font-medium mb-1">Colors</label>
            <div className="flex">
              <input
                type="text"
                name="colors"
                value={inputs.colors}
                onChange={handleInputChange}
                className="border border-nsanity-darkorange rounded-md p-2"
                placeholder="Add a color (e.g., Red)"
                disabled={isLoading || isUploading}
              />
              <Button
                type="button"
                onClick={() => addItem("colors")}
                disabled={isLoading || isUploading}
              >
                Add
              </Button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.colors.map((color) => (
                <span
                  key={color}
                  className="bg-nsanity-darkorange text-white px-2 py-1 rounded-md flex items-center justify-between"
                >
                  {color}
                  <Button
                    type="button"
                    onClick={() => removeItem("colors", color)}
                    className="ml-1 text-nsanity-red"
                    disabled={isLoading || isUploading}
                  >
                    ×
                  </Button>
                </span>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="font-medium mb-1">Categories</label>
            <div className="flex">
              <input
                type="text"
                name="categories"
                value={inputs.categories}
                onChange={handleInputChange}
                className="p-2 border border-nsanity-darkorange rounded-md"
                placeholder="Add a category (e.g., shirts)"
                disabled={isLoading || isUploading}
              />
              <Button
                type="button"
                onClick={() => addItem("categories")}
                disabled={isLoading || isUploading}
              >
                Add
              </Button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.categories.map((category) => (
                <span
                  key={category}
                  className="bg-nsanity-darkorange text-white px-2 py-1 rounded-md flex items-center justify-between"
                >
                  {category}
                  <Button
                    type="button"
                    onClick={() => removeItem("categories", category)}
                    className="ml-1 text-nsanity-red"
                    disabled={isLoading || isUploading}
                  >
                    ×
                  </Button>
                </span>
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div>
            <label className="font-medium mb-1">Sizes</label>
            <div className="flex">
              <input
                type="text"
                name="sizes"
                value={inputs.sizes}
                onChange={handleInputChange}
                className="p-2 border border-nsanity-darkorange rounded-md"
                placeholder="Add a size (e.g., S, M, L)"
                disabled={isLoading || isUploading}
              />
              <Button
                type="button"
                onClick={() => addItem("sizes")}
                disabled={isLoading || isUploading}
              >
                Add
              </Button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.sizes.map((size) => (
                <span
                  key={size}
                  className="bg-nsanity-darkorange text-white px-2 py-1 rounded-md flex items-center justify-between"
                >
                  {size}
                  <Button
                    type="button"
                    onClick={() => removeItem("sizes", size)}
                    className="ml-1 text-nsanity-red"
                    disabled={isLoading || isUploading}
                  >
                    ×
                  </Button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Form actions */}
        <div className="flex space-x-4 pt-4">
          <Button
            type="button"
            onClick={() => router.back()}
            disabled={isLoading || isUploading}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || isUploading}
            className="px-6 py-2 bg-nsanity-darkorange text-white rounded-md hover:bg-nsanity-orange"
          >
            {isLoading ? "Updating..." : "Update Product"}
          </Button>
        </div>
      </form>
    </div>
  );
}
