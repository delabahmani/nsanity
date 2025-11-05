import {
  useState,
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useDrag } from "@use-gesture/react";
import DesignResizeHandles from "../DesignResizeHandles";
import Image from "next/image";

interface DesignCanvasProps {
  productMockup: string;
  uploadedDesign?: string;
  printArea: { x: number; y: number; width: number; height: number };
  onDesignUpdate?: (designData: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => void;
}

const ORIGINAL_CANVAS_PX = 3000;

export interface DesignCanvasHandle {
  generateCanvas: () => Promise<HTMLCanvasElement>;
}

const DesignCanvas = forwardRef<DesignCanvasHandle, DesignCanvasProps>(
  ({ productMockup, uploadedDesign, printArea, onDesignUpdate }, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [canvasSizePx, setCanvasSizePx] = useState({ w: 0, h: 0 });

    const [designPosition, setDesignPosition] = useState({
      x: printArea.x + printArea.width / 4,
      y: printArea.y + printArea.height / 4,
    });
    const [designSize, setDesignSize] = useState({
      width: printArea.width / 2,
      height: printArea.height / 2,
    });
    const [isDragging, setIsDragging] = useState(false);

    useImperativeHandle(ref, () => ({
      generateCanvas: async () => {
        const canvas = document.createElement("canvas");
        canvas.width = ORIGINAL_CANVAS_PX;
        canvas.height = ORIGINAL_CANVAS_PX;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          throw new Error("Failed to get canvas context");
        }

        // Proxy the mockup image URL if it's from Printful CDN
        const mockupImgUrl = productMockup.includes("printful.com")
          ? `/api/proxy-image?url=${encodeURIComponent(productMockup)}`
          : productMockup;

        const mockupImg = await new Promise<HTMLImageElement>(
          (resolve, reject) => {
            const img = new window.Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = mockupImgUrl;
          }
        );

        ctx.drawImage(mockupImg, 0, 0, ORIGINAL_CANVAS_PX, ORIGINAL_CANVAS_PX);

        if (uploadedDesign) {
          // Design is already a local blob URL, no need to proxy
          const designImg = await new Promise<HTMLImageElement>(
            (resolve, reject) => {
              const img = new window.Image();
              img.crossOrigin = "anonymous";
              img.onload = () => resolve(img);
              img.onerror = reject;
              img.src = uploadedDesign;
            }
          );

          ctx.drawImage(
            designImg,
            designPosition.x,
            designPosition.y,
            designSize.width,
            designSize.height
          );
        }

        return canvas;
      },
    }));

    useEffect(() => {
      if (!containerRef.current) return;
      const el = containerRef.current;

      const update = () => {
        const r = el.getBoundingClientRect();
        setCanvasSizePx({ w: Math.max(1, r.width), h: Math.max(1, r.height) });
      };

      update();
      const ro = new ResizeObserver(update);
      ro.observe(el);
      return () => ro.disconnect();
    }, []);

    const adjustedPrintArea = (() => {
      if (!canvasSizePx.w || !canvasSizePx.h) return printArea;

      const originalTopPct = printArea.y / ORIGINAL_CANVAS_PX;
      const renderedTopPx = originalTopPct * canvasSizePx.h;

      const desiredTopPct =
        canvasSizePx.w <= 340
          ? 0.28
          : canvasSizePx.w <= 420
            ? 0.24
            : originalTopPct;

      if (Math.abs(desiredTopPct - originalTopPct) < 1e-6) return printArea;

      const desiredTopPx = desiredTopPct * canvasSizePx.h;
      const deltaPx = desiredTopPx - renderedTopPx;

      const deltaOriginal = (deltaPx * ORIGINAL_CANVAS_PX) / canvasSizePx.h;

      const newY = Math.max(
        0,
        Math.min(
          printArea.y + deltaOriginal,
          ORIGINAL_CANVAS_PX - printArea.height
        )
      );

      return {
        ...printArea,
        y: Math.round(newY),
      };
    })();

    const handleResize = useCallback(
      (
        newSize: { width: number; height: number },
        newPos?: { x: number; y: number }
      ) => {
        setDesignSize(newSize);
        if (newPos) {
          setDesignPosition(newPos);
        }

        if (onDesignUpdate) {
          onDesignUpdate({
            x: newPos?.x ?? designPosition.x,
            y: newPos?.y ?? designPosition.y,
            width: newSize.width,
            height: newSize.height,
          });
        }
      },
      [designPosition.x, designPosition.y, onDesignUpdate]
    );

    const pxToOriginal = (dx: number, dy: number) => {
      const scaleX = ORIGINAL_CANVAS_PX / Math.max(1, canvasSizePx.w);
      const scaleY = ORIGINAL_CANVAS_PX / Math.max(1, canvasSizePx.h);
      return { dx: dx * scaleX, dy: dy * scaleY };
    };

    const bind = useDrag(
      ({
        active,
        movement: [mx, my],
        memo = [designPosition.x, designPosition.y],
      }) => {
        setIsDragging(active);

        const { dx, dy } = pxToOriginal(mx, my);

        const newX = Math.max(
          adjustedPrintArea.x,
          Math.min(
            adjustedPrintArea.x + adjustedPrintArea.width - designSize.width,
            memo[0] + dx
          )
        );
        const newY = Math.max(
          adjustedPrintArea.y,
          Math.min(
            adjustedPrintArea.y + adjustedPrintArea.height - designSize.height,
            memo[1] + dy
          )
        );

        setDesignPosition({ x: newX, y: newY });

        if (onDesignUpdate) {
          onDesignUpdate({
            x: newX,
            y: newY,
            width: designSize.width,
            height: designSize.height,
          });
        }

        return memo;
      },
      {
        eventOptions: { passive: false },
        filterTaps: true,
        threshold: 1,
        rubberband: false,
      }
    );

    return (
      <div
        ref={containerRef}
        className="relative w-full max-w-[420px] mx-auto"
        style={{ touchAction: "none" }}
      >
        <Image
          src={productMockup}
          alt="Product mockup"
          className="w-full h-auto block"
          width={1000}
          height={1000}
          priority={false}
        />

        <div
          className="absolute border-2 border-dashed border-nsanity-red pointer-events-none"
          style={{
            left: `${(adjustedPrintArea.x / ORIGINAL_CANVAS_PX) * 100}%`,
            top: `${(adjustedPrintArea.y / ORIGINAL_CANVAS_PX) * 100}%`,
            width: `${(adjustedPrintArea.width / ORIGINAL_CANVAS_PX) * 100}%`,
            height: `${(adjustedPrintArea.height / ORIGINAL_CANVAS_PX) * 100}%`,
          }}
        />

        {uploadedDesign && (
          <div
            {...bind()}
            className="absolute cursor-move border-2 border-blue-500 touch-none will-change-transform"
            style={{
              left: `${(designPosition.x / ORIGINAL_CANVAS_PX) * 100}%`,
              top: `${(designPosition.y / ORIGINAL_CANVAS_PX) * 100}%`,
              width: `${(designSize.width / ORIGINAL_CANVAS_PX) * 100}%`,
              height: `${(designSize.height / ORIGINAL_CANVAS_PX) * 100}%`,
              transform: isDragging ? "scale(1.05)" : "scale(1)",
              transition: "transform 120ms ease",
              zIndex: 10,
            }}
          >
            <Image
              src={uploadedDesign}
              alt="Design"
              className="w-full h-full object-contain pointer-events-none"
              draggable={false}
              width={1000}
              height={1000}
            />

            <DesignResizeHandles
              designSize={designSize}
              designPosition={designPosition}
              printArea={adjustedPrintArea}
              onResize={handleResize}
            />
          </div>
        )}
      </div>
    );
  }
);

DesignCanvas.displayName = "DesignCanvas";

export default DesignCanvas;
