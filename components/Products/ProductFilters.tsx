"use client";

import { Product } from "@/lib/data/products";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";

interface ProductFiltersProps {
  products: Product[];
  onFilterChange?: (filteredProducts: Product[]) => void;
}

export default function ProductFilters({
  products,
  onFilterChange,
}: ProductFiltersProps) {
  // Extract unique categories and sizes from products
  const allCategories = Array.from(
    new Set(products.flatMap((product) => product.categories))
  ).sort();
  const allSizes = Array.from(
    new Set(products.flatMap((product) => product.sizes))
  ).sort();

  const sortOptions = [
    { value: "newest", label: "Newest" },
    { value: "price-low-high", label: "Price: Low to High" },
    { value: "price-high-low", label: "Price: High to Low" },
    { value: "name-a-z", label: "Name: A to Z" },
  ];

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("newest");

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleSizeChange = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  useEffect(() => {
    let filtered = [...products];

    if (selectedCategories.length > 0) {
      filtered = filtered.filter((product) =>
        product.categories.some((category) =>
          selectedCategories.includes(category)
        )
      );
    }

    if (selectedSizes.length > 0) {
      filtered = filtered.filter((product) =>
        product.sizes.some((size) => selectedSizes.includes(size))
      );
    }

    switch (sortBy) {
      case "price-low-high":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high-low":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "name-a-z":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "newest":
      default:
        break;
    }

    if (onFilterChange) {
      onFilterChange(filtered);
    }
  }, [selectedCategories, selectedSizes, sortBy, products, onFilterChange]);

  const CustomCheckbox = ({
    id,
    label,
    checked,
    onChange,
    isRadio = false,
  }: {
    id: string;
    label: string;
    checked: boolean;
    onChange: () => void;
    isRadio?: boolean;
  }) => (
    <div className="flex items-center mb-2 lg:min-w-96">
      <div className="relative flex items-center">
        <input
          type={isRadio ? "radio" : "checkbox"}
          id={id}
          checked={checked}
          onChange={onChange}
          className="sr-only "
          name={isRadio ? "sort-options" : undefined}
        />
        <div
          className={`h-5 w-5 ${
            isRadio ? "rounded-full" : "rounded"
          } border flex items-center justify-center cursor-pointer ${
            checked
              ? isRadio
                ? "border-nsanity-darkorange"
                : "bg-nsanity-darkorange border-nsanity-darkorange"
              : "border-nsanity-gray bg-white"
          }`}
          onClick={onChange}
        >
          {checked && !isRadio && (
            <Check className="h-3 w-3 text-white stroke-[3]" />
          )}
          {checked && isRadio && (
            <div className="h-2 w-2 rounded-full bg-nsanity-darkorange"></div>
          )}
        </div>
      </div>
      <label
        htmlFor={id}
        className="ml-2 text-sm text-black/70"
        onClick={onChange}
      >
        {label}
      </label>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h4 className="text-sm font-medium mb-3 text-black">category</h4>
        <div className="grid grid-cols-2 gap-x-28">
          {allCategories.map((category) => (
            <CustomCheckbox
              key={category}
              id={`category-${category}`}
              label={category}
              checked={selectedCategories.includes(category)}
              onChange={() => handleCategoryChange(category)}
            />
          ))}
        </div>
      </div>

      <div className="h-px bg-nsanity-gray my-4" />

      {/* Sizes */}
      <div>
        <h4 className="font-medium mb-3 text-black">sizes</h4>
        <div className="grid grid-cols-2 gap-x-16">
          {allSizes.map((size) => (
            <CustomCheckbox
              key={size}
              id={`size-${size}`}
              label={size}
              checked={selectedSizes.includes(size)}
              onChange={() => handleSizeChange(size)}
            />
          ))}
        </div>
      </div>

      <div className="h-px bg-nsanity-gray my-4" />

      {/* Sort By */}
      <div>
        <h4 className="font-medium mb-3 text-black">sort by</h4>
        <div className="space-y-2">
          {sortOptions.map((option) => (
            <CustomCheckbox
              key={option.value}
              id={`sort-${option.value}`}
              label={option.label}
              checked={sortBy === option.value}
              onChange={() => setSortBy(option.value)}
              isRadio={true}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
