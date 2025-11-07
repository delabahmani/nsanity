"use client";

import {
  canonicalizeCategory,
  PRINTFUL_SIZE_GUIDES,
} from "@/lib/printful-features";
import { useState } from "react";
import Modal from "../Modal";
import Image from "next/image";
import Button from "../ui/Button";

// Map category names to size guide data
const PRODUCT_GUIDES_BY_CATEGORY: Record<
  string,
  {
    name: string;
    diagram: string;
    instructions: { label: string; text: string }[];
    templateId: number;
  }
> = {
  "T-Shirt": {
    name: "Unisex Classic Tee",
    diagram: "/images/tee-sizeguide.png",
    templateId: 438,
    instructions: [
      {
        label: "A Length",
        text: "Place the end of the tape beside the collar at the top of the tee (Highest Point Shoulder). Pull the tape measure to the bottom of the shirt.",
      },
      {
        label: "B Width",
        text: "Place the end of the tape at the seam under the sleeve and pull the tape measure across the shirt to the seam under the opposite sleeve.",
      },
      {
        label: "C Sleeve length",
        text: "Place the end of the tape at the center back of the collar, then pull the tape along the top seam of the sleeve. When you get to the shoulder hold the tape in place at the shoulder and continue to pull down the sleeve until you reach the hem of the sleeve.",
      },
    ],
  },
  "Hoodie": {
    name: "Heavy Blend Hoodie",
    diagram: "/images/hoodie-sizeguide.png",
    templateId: 146,
    instructions: [
      {
        label: "A Length",
        text: "Place the end of a measuring tape beside the collar at the top of the garment (high point shoulder). Pull the tape to the bottom of the item.",
      },
      {
        label: "B Width",
        text: "Place the end of a measuring tape at one side of the chest area and pull the tape across to the other side of the product.",
      },
      {
        label: "C Sleeve length",
        text: "Place the end of a measuring tape at the center back of the collar, then pull the tape along the top seam of the sleeve. When you get to the shoulder hold the tape in place at the shoulder and continue to pull down the sleeve until you reach the hem of the sleeve.",
      },
    ],
  },
  "Crewneck": {
    name: "Heavy Blend Crewneck Sweatshirt",
    diagram: "/images/crew-sizeguide.png",
    templateId: 145,
    instructions: [
      {
        label: "A Length",
        text: "Place the end of a measuring tape beside the collar at the top of the garment (high point shoulder). Pull the tape to the bottom of the item.",
      },
      {
        label: "B Width",
        text: "Place the end of a measuring tape at one side of the chest area and pull the tape across to the other side of the product.",
      },
      {
        label: "C Sleeve length",
        text: "Place the end of a measuring tape at the center back of the collar, then pull the tape along the top seam of the sleeve. When you get to the shoulder hold the tape in place at the shoulder and continue to pull down the sleeve until you reach the hem of the sleeve.",
      },
    ],
  },
  "Muscle-Tee": {
    name: "Unisex Muscle Tee",
    diagram: "/images/muscle-sizeguide.png",
    templateId: 365,
    instructions: [
      {
        label: "A Length",
        text: "Place the end of the tape beside the collar at the top of the tee (Highest Point Shoulder). Pull the tape measure to the bottom of the shirt.",
      },
      {
        label: "B Width",
        text: "Place the end of the tape at the seam under the sleeve and pull the tape measure across the shirt to the seam under the opposite sleeve.",
      },
    ],
  },
  "Cap": {
    name: "Vintage Corduroy Cap",
    diagram: "/images/cap-sizeguide.png",
    templateId: 662,
    instructions: [
      {
        label: "A Circumference",
        text: "Measure around the inside of the hat where your head fits.",
      },
      {
        label: "B Crown height",
        text: "Measure from the bottom edge of the hat to the top.",
      },
      {
        label: "C Bill height",
        text: "Measure from the bottom to the top of the bill.",
      },
      {
        label: "D Bill width",
        text: "Measure across the bill from edge to edge.",
      },
    ],
  },
};

function parseFraction(str: string) {
  const v = str.trim();
  if (v.includes(" ")) {
    const [whole, frac] = v.split(" ");
    let num = parseFloat(whole) || 0;
    if (frac && frac.includes("/")) {
      const [n, d] = frac.split("/").map(Number);
      if (d) num += n / d;
    }
    return num;
  }
  if (v.includes("/")) {
    const [n, d] = v.split("/").map(Number);
    return d ? n / d : NaN;
  }
  return parseFloat(v);
}

function convertToCm(value: string) {
  if (value.includes("-")) return value; // keep ranges as-is
  const inches = isNaN(Number(value)) ? parseFraction(value) : Number(value);
  return isNaN(inches) ? value : (inches * 2.54).toFixed(1);
}

interface SizeGuideModalProps {
  category: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function SizeGuideModal({
  category,
  isOpen,
  onClose,
}: SizeGuideModalProps) {
  const [unit, setUnit] = useState<"inches" | "cm">("inches");

  const normalizedCategory = canonicalizeCategory(category);
  const product = PRODUCT_GUIDES_BY_CATEGORY[normalizedCategory];

  if (!product) {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="max-w-xl mx-auto py-4 text-center">
          <h2 className="text-xl font-bold mb-4">Size Guide Not Available</h2>
          <p className="text-gray-600">
            No size guide found for category: <strong>{category}</strong>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Supported categories: tshirt, hoodie, crewneck, muscletee, cap
          </p>
        </div>
      </Modal>
    );
  }

  const guide = PRINTFUL_SIZE_GUIDES[product.templateId] || [];
  const measurementKeys = guide[0] ? Object.keys(guide[0].measurements) : [];

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="max-h-[80vh] overflow-y-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto py-6 px-4">
          <h1 className="text-xl font-bold mb-6 text-center">
            {product.name} Size Guide
          </h1>

          {/* Product measurements */}
          <h2 className="text-2xl font-semibold mb-2">Product measurements</h2>
          <p className="text-sm text-gray-700">
            Measurements are provided by our suppliers. Product measurements may
            vary by up to 2&quot; (5 cm).
          </p>
          <p className="text-sm text-gray-700 mb-4">
            Pro tip! Measure one of your products at home and compare with the
            measurements you see in this guide.
          </p>

          {/* Diagram + instructions */}
          <div className="bg-nsanity-gray rounded p-4 md:p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="flex justify-center md:justify-start">
                <Image
                  src={product.diagram}
                  alt={`${product.name} diagram`}
                  width={480}
                  height={480}
                  className="w-full max-w-sm h-auto"
                />
              </div>
              <div className="space-y-3">
                {product.instructions.map((inst, i) => (
                  <div key={i}>
                    <div className="font-bold mb-1">{inst.label}</div>
                    <div className="text-sm">{inst.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Find your size + unit toggle */}
          <h4 className="text-2xl font-semibold py-3">Find your size</h4>
          <div className="flex gap-2 mb-4">
            <Button
              onClick={() => setUnit("inches")}
              className={`px-4 py-2 ${
                unit === "inches"
                  ? "bg-nsanity-teal text-nsanity-white"
                  : "bg-nsanity-gray"
              }`}
            >
              Inches
            </Button>
            <Button
              onClick={() => setUnit("cm")}
              className={`px-4 py-2 ${
                unit === "cm"
                  ? "bg-nsanity-teal text-nsanity-white"
                  : "bg-nsanity-gray"
              }`}
            >
              Centimeters
            </Button>
          </div>

          {/* Size chart */}
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300">
              <thead>
                <tr>
                  <th className="border px-4 py-2">Size Label</th>
                  {measurementKeys.map((key) => (
                    <th key={key} className="border px-4 py-2 capitalize">
                      {key.replace(/([A-Z])/g, " $1")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {guide.map((row) => (
                  <tr key={row.size}>
                    <td className="border px-4 py-2">{row.size}</td>
                    {measurementKeys.map((key) => (
                      <td key={key} className="border px-4 py-2">
                        {unit === "inches"
                          ? row.measurements[key]
                          : row.measurements[key].includes("-")
                            ? row.measurements[key]
                            : convertToCm(row.measurements[key])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-sm text-nsanity-black/70 text-center">
            Product measurements may vary by up to 2&quot; (5 cm).
          </p>
        </div>
      </div>
    </Modal>
  );
}
