import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  maxWidth?: string;
  showCloseButton?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  children,
  title,
  maxWidth = "max-w-5xl",
  showCloseButton = true,
}: ModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle modal closing with proper animation timing
  const handleClose = useCallback(() => {
    if (isClosing) return; // Prevent multiple close attempts
    setIsClosing(true);
  }, [isClosing]);

  // Listen for animation end events
  useEffect(() => {
    const modalElement = modalRef.current;
    const overlayElement = overlayRef.current;

    if (!modalElement || !overlayElement) return;

    const handleAnimationEnd = (e: AnimationEvent) => {
      if (
        e.animationName === "modal-slide-down" ||
        e.animationName === "backdrop-fade-out"
      ) {
        if (isClosing) {
          setIsClosing(false);
          onClose();
        }
      }
    };

    modalElement.addEventListener("animationend", handleAnimationEnd);
    overlayElement.addEventListener("animationend", handleAnimationEnd);

    return () => {
      modalElement.removeEventListener("animationend", handleAnimationEnd);
      overlayElement.removeEventListener("animationend", handleAnimationEnd);
    };
  }, [isClosing, onClose]);

  // Handle click outside to close
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (isClosing) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Apply body styles immediately when open state changes
  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      const originalPaddingRight =
        parseInt(window.getComputedStyle(document.body).paddingRight) || 0;

      document.body.style.overflow = "hidden";
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
    if (!isOpen || isClosing) return;

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleEscapeKey);
    return () => window.removeEventListener("keydown", handleEscapeKey);
  }, [isOpen, isClosing, handleClose]);

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
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
        isClosing ? "backdrop-fade-out" : "backdrop-fade-in"
      }`}
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      style={{ pointerEvents: isClosing ? "none" : "auto" }}
    >
      <div
        ref={modalRef}
        className={`bg-white rounded-lg shadow-xl relative w-full ${maxWidth} ${
          isClosing ? "modal-slide-down-animation" : "modal-slide-up-animation"
        }`}
        onClick={(e) => e.stopPropagation()}
        style={{ pointerEvents: "auto" }}
      >
        {title && (
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-medium">{title}</h3>
          </div>
        )}

        {showCloseButton && (
          <button
            className="absolute top-4 left-5 w-10 h-10 rounded-full hover:bg-gray-200 hover:cursor-pointer transition-colors flex items-center justify-center z-20 disabled:opacity-50"
            onClick={handleClose}
            onMouseDown={(e) => e.stopPropagation()} // Prevent event bubbling
            onMouseUp={(e) => e.stopPropagation()} // Prevent event bubbling
            aria-label="Close modal"
            disabled={isClosing}
            type="button"
          >
            <X size={20} className="text-gray-500 hover:text-gray-700" />
          </button>
        )}

        <div className="p-10">{children}</div>
      </div>
    </div>,
    document.body
  );
}
