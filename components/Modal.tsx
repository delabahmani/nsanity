"use client";

import { X } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Button from "./ui/Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  maxWidth?: string;
  showCloseButton?: boolean;
}

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function Modal({
  isOpen,
  onClose,
  children,
  title,
  maxWidth = "max-w-5xl",
  showCloseButton = true,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = useState(false);

  // Handle modal closing with animation
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 500); // Match this to animation duration
  };

  // Handle click outside to close
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      handleClose();
    }
  };

  // Apply body styles immediately when open state changes
  useIsomorphicLayoutEffect(() => {
    // This runs synchronously before the browser paints
    if (isOpen) {
      // Save the current padding-right to avoid layout shifts
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      const originalPaddingRight =
        parseInt(window.getComputedStyle(document.body).paddingRight) || 0;

      document.body.style.overflow = "hidden";
      // Add padding to prevent content shift when scrollbar disappears
      document.body.style.paddingRight = `${
        originalPaddingRight + scrollbarWidth
      }px`;
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isOpen]);

  // Handle escape key to close
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isClosing) {
        handleClose();
      }
    };

    // Lock body scroll when modal is open
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, isClosing]);

  // Reset closing state if isOpen changes externally
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
    }
  }, [isOpen]);

  // Use portal to render modal outside of normal DOM hierarchy
  if (!isOpen && !isClosing) return null;

  return createPortal(
    <div
      className={`fixed inset-0  z-50 flex items-center justify-center  p-4 ${
        isClosing ? "backdrop-fade-out" : "backdrop-fade-in"
      }`}
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`bg-white rounded-lg shadow-xl relative w-full ${maxWidth} ${
          isClosing ? "modal-slide-down-animation" : "modal-slide-up-animation"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-medium">{title}</h3>
          </div>
        )}

        {showCloseButton && (
          <Button
            className="absolute top-4 right-4 rounded-full hover:bg-gray-100 transition-colors cursor-pointer z-20 hover:border-gray-300 flex items-center justify-center"
            onClick={handleClose}
            aria-label="Close modal"
          >
            <X
              size={20}
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              className="cursor-pointer"
            />
          </Button>
        )}

        <div className="p-6">{children}</div>
      </div>
    </div>,
    document.body
  );
}
