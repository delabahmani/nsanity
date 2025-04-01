"use client";
import { Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "../ui/Button";

interface QuantitySelectorProps {
  initialValue?: number;
  min?: number;
  max?: number;
  onChange?: (quantity: number) => void;
}

export default function QuantitySelector({
  initialValue = 1,
  min = 1,
  max = 99,
  onChange,
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

  return (
    <div className="flex items-center h-10 max-lg:w-32 lg:w-40 border-2 border-nsanity-darkorange rounded-md bg-nsanity-cream">
      <Button
        type="button"
        onClick={handleDecrease}
        className="flex items-center justify-center w-14 h-full bg-nsanity-darkorange rounded-none  disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Decrease quantity"
      >
        <Minus size={16} className="text-nsanity-cream" />
      </Button>

      <input
        type="text"
        value={quantity}
        onChange={handleChange}
        className="text-center font-semibold focus:outline-none focus:ring-1 w-full h-full   focus:ring-nsanity-orange"
        aria-label="Quantity"
      />

      <Button
       
        onClick={handleIncrease}
        className="flex items-center justify-center w-14 h-full bg-nsanity-darkorange rounded-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-bl-xl"
        aria-label="Increase quantity"
      >
        <Plus size={20} className="text-nsanity-cream" />
      </Button>
    </div>
  );
}
