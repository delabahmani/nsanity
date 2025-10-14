"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import Modal from "../Modal";

interface ProductCarouselProps {
  images: string[];
  productName: string;
}

export default function ProductCarousel({
  images,
  productName,
}: ProductCarouselProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (!images || images.length === 0) {
    return (
      <div className="relative h-[500px] w-full rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
        <p>No image available</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Main image (clickable) */}
        <div
          className="relative h-[500px] w-full rounded-lg overflow-hidden cursor-zoom-in"
          onClick={() => setIsModalOpen(true)}
          role="button"
          tabIndex={0}
          aria-label="Open full size image"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              setIsModalOpen(true);
            }
          }}
        >
          <Image
            src={images[currentImageIndex] || "/images/placeholder.webp"}
            alt={productName}
            fill
            className="object-contain"
            priority
            quality={100}
          />
        </div>

        {/* Thumbnail images */}
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, i) => (
            <div
              key={i}
              className={`relative h-24 rounded-md overflow-hidden ${
                currentImageIndex === i ? "ring-2 ring-nsanity-darkorange" : ""
              }`}
              onClick={() => setCurrentImageIndex(i)}
              role="button"
              tabIndex={0}
              aria-label={`View ${productName} image ${i + 1}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setCurrentImageIndex(i);
                }
              }}
            >
              <Image
                src={image}
                alt={`${productName} view ${i + 1}`}
                fill
                className={`object-contain cursor-pointer hover:opacity-80 transition-opacity duration-300 ${
                  currentImageIndex === i ? "opacity-90" : ""
                }`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Image Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="max-w-6xl"
        showCloseButton={true}
      >
        <div className="flex flex-col h-full">
          {/* Full-size image with navigation */}
          <div className="relative w-full h-[70vh] mb-4">
            <Image
              src={images[currentImageIndex] || "/images/placeholder.webp"}
              alt={productName}
              fill
              className="object-contain"
              quality={100}
            />

            {/* Navigation arrows */}
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md"
              onClick={(e) => {
                e.stopPropagation();
                handlePrevImage();
              }}
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md"
              onClick={(e) => {
                e.stopPropagation();
                handleNextImage();
              }}
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Thumbnails in modal */}
          <div className="grid grid-cols-8 gap-2">
            {images.map((image, i) => (
              <div
                key={i}
                className={`relative h-16 rounded-md overflow-hidden ${
                  currentImageIndex === i
                    ? "ring-2 ring-nsanity-darkorange"
                    : ""
                }`}
                onClick={() => setCurrentImageIndex(i)}
              >
                <Image
                  src={image}
                  alt={`${productName} view ${i + 1}`}
                  fill
                  className="object-cover cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </>
  );
}
