import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Button from "../ui/Button";
import useImageUpload from "@/hooks/useImageUpload";
import FileUploader from "./FileUploader";

type FormField = {
  id: string;
  label: string;
  placeholder: string;
};

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
};

export default function AddProductContainer() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

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
  });

  const [inputs, setInputs] = useState({
    colors: "",
    categories: "",
    sizes: "",
    images: "",
  });

  const {
    previews,
    isUploading,
    handleFilesSelected,
    handleFilePreviewsGenerated,
    removeFile,
    uploadFiles,
  } = useImageUpload();

  useEffect(() => {
    console.log(formData);
  }, [formData]);

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
      const imageUrls = await uploadFiles();

      const productData = {
        ...formData,
        images: imageUrls,
      };

      if (!formData.name) {
        toast.error("Product name is required!");
        return;
      }

      if (formData.price <= 0) {
        toast.error("Price must be greater than 0!");
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
      });

      toast.success("Product created successfully!");
      router.push("/admin/products");
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto min-h-screen nav-pad flex flex-col">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* /* basic info */}
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

        <FileUploader
          onFilesSelected={handleFilesSelected}
          onFilePreviewsGenerated={handleFilePreviewsGenerated}
          onRemoveFile={removeFile}
          existingImagePreviews={previews}
        />

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
            in stock
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
          <label htmlFor="isFeatured">featured product</label>
        </div>

        {/* array fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* colors */}
          <div>
            <label className="font-medium mb-1">colors</label>
            <div className="flex">
              <input
                type="text"
                name="colors"
                value={inputs.colors}
                onChange={handleInputChange}
                className="border border-nsanity-darkorange rounded-md"
                placeholder="Add a color (e.g., Red)"
                disabled={isLoading || isUploading}
              />
              <Button type="button" onClick={() => addItem("colors")}>
                add
              </Button>
            </div>
            <div className="mt-2 flex gap-2">
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
                    x
                  </Button>
                </span>
              ))}
            </div>
          </div>

          {/* categories */}
          <div>
            <label className="font-medium mb-1">categories</label>
            <div className="flex">
              <input
                type="text"
                name="categories"
                value={inputs.categories}
                onChange={handleInputChange}
                className="p-2 border border-nsanity-darkorange rounded-md"
                placeholder="add a category (e.g., shirts)"
                disabled={isLoading || isUploading}
              />
              <Button type="button" onClick={() => addItem("categories")}>
                add
              </Button>
            </div>
            <div className="mt-2 flex gap-2">
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
                    x
                  </Button>
                </span>
              ))}
            </div>
          </div>

          {/* sizes */}
          <div>
            <label className="font-medium mb-1">sizes</label>
            <div>
              <input
                type="text"
                name="sizes"
                value={inputs.sizes}
                onChange={handleInputChange}
                className="p-2 border border-nsanity-darkorange rounded-md"
                placeholder="add a size (e.g., S, M, L"
                disabled={isLoading || isUploading}
              />
              <Button type="button" onClick={() => addItem("sizes")}>
                add
              </Button>
            </div>
            <div>
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
                    x
                  </Button>
                </span>
              ))}
            </div>
          </div>

          {/* images */}
        </div>

        {/* form actions */}
        <div>
          <Button
            type="button"
            onClick={() => router.back()}
            disabled={isLoading || isUploading}
          >
            cancel
          </Button>
          <Button type="submit" disabled={isLoading || isUploading}>
            {isLoading ? "loading..." : "create product"}
          </Button>
        </div>
      </form>
    </div>
  );
}
