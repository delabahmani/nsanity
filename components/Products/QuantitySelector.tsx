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

  const base =
    "flex items-center border-2 border-nsanity-darkorange rounded-md bg-nsanity-cream";
  const sizeClass =
    size === "sm" ? "h-8 w-24 text-xs" : "h-10 max-lg:w-32 lg:w-40";

  return (
    <div className={`${base} ${sizeClass}`}>
      <button
        type="button"
        onClick={handleDecrease}
        className={`flex items-center justify-center cursor-pointer rounded-sm ${
          size === "sm" ? "w-8 h-8" : "w-14 h-full"
        } bg-nsanity-darkorange  hover:opacity-80 transition`}
        aria-label="Decrease quantity"
      >
        <Minus size={size === "sm" ? 16 : 20} className="text-nsanity-cream" />
      </button>

      <input
        type="text"
        value={quantity}
        onChange={handleChange}
        className={`text-center font-semibold focus:outline-none rounded-sm focus:ring-1 ${
          size === "sm" ? "w-8 text-xs" : "w-12"
        } h-full focus:ring-nsanity-orange`}
        aria-label="Quantity"
      />

      <button
        onClick={handleIncrease}
        className={`flex items-center justify-center cursor-pointer rounded-sm ${
          size === "sm" ? "w-8 h-8" : "w-14 h-full"
        } bg-nsanity-darkorange rounded-none hover:opacity-80 transition`}
        aria-label="Increase quantity"
      >
        <Plus size={size === "sm" ? 14 : 20} className="text-nsanity-cream" />
      </button>
    </div>
  );
}
