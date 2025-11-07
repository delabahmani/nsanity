"use client";

import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import Image from "next/image";
import { useState, useCallback, memo } from "react";
import Modal from "../Modal";

interface ProductCarouselProps {
  images: string[];
  productName: string;
}

// Memoized thumbnail component
const ThumbnailImage = memo(
  ({
    image,
    index,
    productName,
    isActive,
    onClick,
  }: {
    image: string;
    index: number;
    productName: string;
    isActive: boolean;
    onClick: () => void;
  }) => (
    <button
      className={`relative h-24 rounded-lg overflow-hidden bg-white shadow-sm transition-all hover:shadow-md ${
        isActive
          ? "ring-2 ring-nsanity-darkorange shadow-lg scale-105"
          : "opacity-60 hover:opacity-100"
      }`}
      onClick={onClick}
      aria-label={`View ${productName} image ${index + 1}`}
    >
      <Image
        src={image}
        alt={`${productName} view ${index + 1}`}
        fill
        sizes="(max-width: 768px) 20vw, 10vw"
        className="object-contain p-2"
      />
    </button>
  )
);

ThumbnailImage.displayName = "ThumbnailImage";

function ProductCarousel({ images, productName }: ProductCarouselProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePrevImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const handleNextImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const handleOpenModal = useCallback(() => setIsModalOpen(true), []);
  const handleCloseModal = useCallback(() => setIsModalOpen(false), []);

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
        {/* Main image */}
        <div className="relative group">
          <div
            className="relative h-[550px] w-full rounded-2xl overflow-hidden cursor-zoom-in bg-linear-to-br from-white via-gray-50 to-orange-50/30 shadow-lg border border-nsanity-darkorange/10 transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]"
            onClick={handleOpenModal}
            role="button"
            tabIndex={0}
            aria-label="Open full size image"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleOpenModal();
              }
            }}
          >
            <Image
              src={images[currentImageIndex] || "/images/placeholder.webp"}
              alt={productName}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain p-8 transition-transform duration-300 group-hover:scale-105"
              priority={currentImageIndex === 0}
              quality={90}
            />

            {/* Expand icon on hover */}
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
              <Expand className="w-5 h-5 text-gray-700" />
            </div>

            {/* Navigation arrows (only if multiple images) */}
            {images.length > 1 && (
              <>
                <button
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevImage();
                  }}
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-700" />
                </button>

                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextImage();
                  }}
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6 text-gray-700" />
                </button>
              </>
            )}

            {/* Image counter */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white text-sm px-3 py-1.5 rounded-full">
                {currentImageIndex + 1} / {images.length}
              </div>
            )}
          </div>
        </div>

        {/* Thumbnail images */}
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-3">
            {images.map((image, i) => (
              <ThumbnailImage
                key={i}
                image={image}
                index={i}
                productName={productName}
                isActive={currentImageIndex === i}
                onClick={() => setCurrentImageIndex(i)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Image Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        maxWidth="max-w-6xl"
        showCloseButton={true}
      >
        <div className="flex flex-col h-full">
          <div className="relative w-full h-[70vh] mb-4  bg-[#fffbf8] rounded-lg">
            <Image
              src={images[currentImageIndex] || "/images/placeholder.webp"}
              alt={productName}
              fill
              sizes="90vw"
              className="object-contain p-4"
              quality={100}
            />

            {images.length > 1 && (
              <>
                <button
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-md"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevImage();
                  }}
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-md"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextImage();
                  }}
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className="grid grid-cols-8 gap-2">
              {images.map((image, i) => (
                <div
                  key={i}
                  className={`relative h-16 rounded-md overflow-hidden cursor-pointer ${
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
                    sizes="10vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}

export default memo(ProductCarousel);
