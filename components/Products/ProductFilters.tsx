"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Product } from "@/lib/utils/product-utils";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import Button from "../ui/Button";

interface ProductFiltersProps {
  products: Product[];
  onFilterChange?: (
    filteredProducts: Product[],
    filters: { categories: string[]; sizes: string[] }
  ) => void;
  activeFilters?: { categories: string[]; sizes: string[] };
  setActiveFilters?: (filters: {
    categories: string[];
    sizes: string[];
  }) => void;
}

export default function ProductFilters({
  products,
  onFilterChange,
  activeFilters,
  setActiveFilters,
}: ProductFiltersProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    activeFilters?.categories || []
  );
  const [selectedSizes, setSelectedSizes] = useState<string[]>(
    activeFilters?.sizes || []
  );
  const [sortBy, setSortBy] = useState<string>("newest");

  // Desktop dropdown states
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [sizeOpen, setSizeOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  // Mobile state
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Refs for click-outside detection
  const categoryRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  // Store callbacks to avoid triggering re-renders
  const callbacksRef = useRef({ onFilterChange, setActiveFilters });

  useEffect(() => {
    callbacksRef.current = { onFilterChange, setActiveFilters };
  }, [onFilterChange, setActiveFilters]);

  const allCategories = useMemo(
    () =>
      Array.from(
        new Set(products.flatMap((product) => product.categories))
      ).sort(),
    [products]
  );

  const allSizes = useMemo(
    () =>
      Array.from(new Set(products.flatMap((product) => product.sizes))).sort(),
    [products]
  );

  const activeCategoriesKey = activeFilters?.categories.join(",") || "";
  const activeSizesKey = activeFilters?.sizes.join(",") || "";

  useEffect(() => {
    if (activeFilters) {
      setSelectedCategories(activeFilters.categories);
      setSelectedSizes(activeFilters.sizes);
    }
  }, [activeCategoriesKey, activeSizesKey, activeFilters]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        categoryRef.current &&
        !categoryRef.current.contains(event.target as Node)
      ) {
        setCategoryOpen(false);
      }
      if (sizeRef.current && !sizeRef.current.contains(event.target as Node)) {
        setSizeOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setSortOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  }, []);

  const handleSizeChange = useCallback((size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  }, []);

  const handleSortChange = useCallback((value: string) => {
    setSortBy(value);
    setSortOpen(false);
  }, []);

  // Filter and sort logic
  useEffect(() => {
    let filtered = [...products];

    if (selectedCategories.length > 0) {
      filtered = filtered.filter((p) =>
        p.categories.some((cat) => selectedCategories.includes(cat))
      );
    }

    if (selectedSizes.length > 0) {
      filtered = filtered.filter((p) =>
        p.sizes.some((size) => selectedSizes.includes(size))
      );
    }

    // Sort
    const sortFns: Record<string, (a: Product, b: Product) => number> = {
      "price-low": (a, b) => a.price - b.price,
      "price-high": (a, b) => b.price - a.price,
      name: (a, b) => a.name.localeCompare(b.name),
      newest: (a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      },
    };

    filtered.sort(sortFns[sortBy] || sortFns.newest);

    const filters = {
      categories: selectedCategories,
      sizes: selectedSizes,
    };

    callbacksRef.current.onFilterChange?.(filtered, filters);
    callbacksRef.current.setActiveFilters?.(filters);
  }, [selectedCategories, selectedSizes, sortBy, products]);

  const FilterContent = useMemo(() => {
    const Component = () => (
      <>
        {/* Category */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm uppercase tracking-wide">
            Category
          </h4>
          <div className="space-y-1">
            {allCategories.map((category) => (
              <label
                key={category}
                className="flex items-center gap-2 px-2 py-1.5 hover:bg-nsanity-gray/20 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={() => handleCategoryChange(category)}
                  className="w-4 h-4 accent-nsanity-orange"
                />
                <span className="text-sm capitalize">{category}</span>
              </label>
            ))}
          </div>
        </div>

        <hr className="my-4 border-nsanity-gray" />

        {/* Sizes */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm uppercase tracking-wide">Sizes</h4>
          <div className="space-y-1">
            {allSizes.map((size) => (
              <label
                key={size}
                className="flex items-center gap-2 px-2 py-1.5 hover:bg-nsanity-gray/20 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedSizes.includes(size)}
                  onChange={() => handleSizeChange(size)}
                  className="w-4 h-4 accent-nsanity-orange"
                />
                <span className="text-sm uppercase">{size}</span>
              </label>
            ))}
          </div>
        </div>

        <hr className="my-4 border-nsanity-gray" />

        {/* Sort */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm uppercase tracking-wide">
            Sort by
          </h4>
          <div className="space-y-1">
            {[
              { value: "newest", label: "Newest" },
              { value: "price-low", label: "Price: Low to High" },
              { value: "price-high", label: "Price: High to Low" },
              { value: "name", label: "Name: A to Z" },
            ].map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 px-2 py-1.5 hover:bg-nsanity-gray/20 rounded cursor-pointer"
              >
                <input
                  type="radio"
                  name="sort"
                  value={option.value}
                  checked={sortBy === option.value}
                  onChange={() => setSortBy(option.value)}
                  className="w-4 h-4 accent-nsanity-orange"
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      </>
    );
    Component.displayName = "FilterContent";
    return Component;
  }, [
    allCategories,
    allSizes,
    selectedCategories,
    selectedSizes,
    sortBy,
    handleCategoryChange,
    handleSizeChange,
  ]);

  const sortOptions = [
    { value: "newest", label: "Newest" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "name", label: "Name: A to Z" },
  ];

  const getSortLabel = () => {
    const option = sortOptions.find((opt) => opt.value === sortBy);
    return (
      option?.label
        .replace("Price: Low to High", "Price: Low")
        .replace("Price: High to Low", "Price: High")
        .replace("Name: A to Z", "A-Z") || "Newest"
    );
  };

  return (
    <>
      {/* Desktop dropdowns */}
      <div className="hidden lg:flex items-center gap-4">
        {/* Category dropdown */}
        <div className="relative" ref={categoryRef}>
          <button
            onClick={() => {
              setCategoryOpen(!categoryOpen);
              setSizeOpen(false);
              setSortOpen(false);
            }}
            className="flex items-center gap-2 px-4 py-2 border border-nsanity-gray rounded-lg hover:bg-nsanity-gray/20 transition-colors min-w-[140px] justify-between"
          >
            <span className="text-sm font-medium">
              Category{" "}
              {selectedCategories.length > 0 &&
                `(${selectedCategories.length})`}
            </span>
            <ChevronDown className="h-4 w-4" />
          </button>

          {categoryOpen && (
            <div className="absolute top-full left-0 mt-1 w-full bg-white border border-nsanity-gray rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
              <div className="p-2">
                {allCategories.map((category) => (
                  <label
                    key={category}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-nsanity-gray/20 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() => handleCategoryChange(category)}
                      className="w-4 h-4 accent-nsanity-orange"
                    />
                    <span className="text-sm capitalize">{category}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Size dropdown */}
        <div className="relative" ref={sizeRef}>
          <button
            onClick={() => {
              setSizeOpen(!sizeOpen);
              setCategoryOpen(false);
              setSortOpen(false);
            }}
            className="flex items-center gap-2 px-4 py-2 border border-nsanity-gray rounded-lg hover:bg-nsanity-gray/20 transition-colors min-w-[140px] justify-between"
          >
            <span className="text-sm font-medium">
              Size {selectedSizes.length > 0 && `(${selectedSizes.length})`}
            </span>
            <ChevronDown className="h-4 w-4" />
          </button>

          {sizeOpen && (
            <div className="absolute top-full left-0 mt-1 w-full bg-white border border-nsanity-gray rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
              <div className="p-2">
                {allSizes.map((size) => (
                  <label
                    key={size}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-nsanity-gray/20 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSizes.includes(size)}
                      onChange={() => handleSizeChange(size)}
                      className="w-4 h-4 accent-nsanity-orange"
                    />
                    <span className="text-sm uppercase">{size}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sort dropdown */}
        <div className="relative" ref={sortRef}>
          <button
            onClick={() => {
              setSortOpen(!sortOpen);
              setCategoryOpen(false);
              setSizeOpen(false);
            }}
            className="flex items-center gap-2 px-4 py-2 border border-nsanity-gray rounded-lg hover:bg-nsanity-gray/20 transition-colors min-w-[160px] justify-between"
          >
            <span className="text-sm font-medium">Sort: {getSortLabel()}</span>
            <ChevronDown className="h-4 w-4" />
          </button>

          {sortOpen && (
            <div className="absolute top-full right-0 mt-1 w-full bg-white border border-nsanity-gray rounded-lg shadow-lg z-50">
              <div className="p-2">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-nsanity-gray/20 transition-colors hover:cursor-pointer ${
                      sortBy === option.value
                        ? "bg-nsanity-orange/10 font-medium"
                        : ""
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile btn that opens drawer */}
      <Button
        variant="default"
        onClick={() => setMobileFiltersOpen(true)}
        className="lg:hidden flex items-center gap-2"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
        {(selectedCategories.length > 0 || selectedSizes.length > 0) && (
          <span className="ml-1 px-2 py-0.5 bg-nsanity-orange text-white text-xs rounded-full">
            {selectedCategories.length + selectedSizes.length}
          </span>
        )}
      </Button>

      {/* Mobile drawer */}
      {mobileFiltersOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white z-50 shadow-xl lg:hidden flex flex-col">
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5" />
                  Filters
                </h3>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-2 hover:bg-nsanity-gray rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <FilterContent />
            </div>

            <div className="p-6 pt-4 border-t border-nsanity-gray bg-white">
              <Button
                variant="primary"
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
