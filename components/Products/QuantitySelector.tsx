"use client";
import { Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";

interface QuantitySelectorProps {
  initialValue?: number;
  min?: number;
  max?: number;
  onChange?: (quantity: number) => void;
  size?: "sm" | "md";
}

export default function QuantitySelector({
  initialValue = 1,
  min = 1,
  max = 99,
  onChange,
  size = "md",
}: QuantitySelectorProps) {
  const [quantity, setQuantity] = useState(initialValue);

  useEffect(() => {
    setQuantity(initialValue);
  }, [initialValue]);

  const handleDecrease = () => {
    if (quantity > min) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      onChange?.(newQuantity);
    }
  };

  const handleIncrease = () => {
    if (quantity < max) {
      const newQuantity = quantity + 1;
      setQuantity(newQuantity);
      onChange?.(newQuantity);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      const newQuantity = Math.min(Math.max(value, min), max);
      setQuantity(newQuantity);
      onChange?.(newQuantity);
    }
  };

  const btn = size === "sm" ? "w-8 h-8" : "w-9 h-9";
  const box = size === "sm" ? "h-8 w-10 text-sm" : "h-9 w-12";

  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={handleDecrease}
        className={`inline-flex items-center justify-center rounded-md border border-gray-300 bg-white hover:bg-nsanity-cream transition hover:cursor-pointer ${btn}`}
        aria-label="Decrease quantity"
      >
        <Minus
          size={size === "sm" ? 16 : 18}
          className="text-nsanity-black/80"
        />
      </button>

      <input
        type="text"
        value={quantity}
        onChange={handleChange}
        className={`text-center font-medium rounded-md border border-gray-200 bg-nsanity-cream focus:outline-none focus:ring-1 focus:ring-nsanity-darkorange ${box}`}
        aria-label="Quantity"
      />

      <button
        onClick={handleIncrease}
        className={`inline-flex items-center justify-center rounded-md border border-gray-300 bg-white hover:bg-nsanity-cream transition hover:cursor-pointer ${btn}`}
        aria-label="Increase quantity"
      >
        <Plus
          size={size === "sm" ? 14 : 18}
          className="text-nsanity-black/80"
        />
      </button>
    </div>
  );
}
