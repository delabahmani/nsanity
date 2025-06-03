import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import Button from "./ui/Button";

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
    setIsClosing(true);
    // Don't rely on setTimeout - let CSS animation finish naturally
  }, []);

  // Listen for animation end events
  useEffect(() => {
    const modalElement = modalRef.current;
    const overlayElement = overlayRef.current;

    if (!modalElement || !overlayElement) return;

    const handleAnimationEnd = (e: AnimationEvent) => {
      // Only handle our specific exit animations
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

  // Handle click outside to close - with proper blocking during animation
  const handleOverlayClick = (e: React.MouseEvent) => {
    // Block ALL clicks during closing animation
    if (isClosing) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    e.preventDefault();
    e.stopPropagation();

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
      style={{ pointerEvents: isClosing ? "none" : "auto" }} // Block pointer events during closing
    >
      <div
        ref={modalRef}
        className={`bg-white rounded-lg shadow-xl relative w-full ${maxWidth} ${
          isClosing ? "modal-slide-down-animation" : "modal-slide-up-animation"
        }`}
        onClick={(e) => e.stopPropagation()}
        style={{ pointerEvents: "auto" }} // Re-enable for modal content
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
            disabled={isClosing} // Disable during animation
          >
            <X
              size={20}
              onClick={(e) => {
                e.stopPropagation();
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
