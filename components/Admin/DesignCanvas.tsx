import { useState, useRef, useEffect, useCallback } from "react";
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

const ORIGINAL_CANVAS_PX = 3000; // keep in sync with backend/printful units

export default function DesignCanvas({
  productMockup,
  uploadedDesign,
  printArea,
  onDesignUpdate,
}: DesignCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [canvasSizePx, setCanvasSizePx] = useState({ w: 0, h: 0 });

  // design state is still stored in "original" units (same units as printArea)
  const [designPosition, setDesignPosition] = useState({
    x: printArea.x + printArea.width / 4,
    y: printArea.y + printArea.height / 4,
  });
  const [designSize, setDesignSize] = useState({
    width: printArea.width / 2,
    height: printArea.height / 2,
  });
  const [isDragging, setIsDragging] = useState(false);

  // measure the rendered canvas size so we can convert pointer movement (px) -> original units
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

  // Better: compute adjustedPrintArea by working in rendered pixels so the neckline target is consistent
  const adjustedPrintArea = (() => {
    if (!canvasSizePx.w || !canvasSizePx.h) return printArea;

    // original top percent of print area
    const originalTopPct = printArea.y / ORIGINAL_CANVAS_PX;
    const renderedTopPx = originalTopPct * canvasSizePx.h;

    // choose a desired top percent for narrow screens (tweak these if you want)
    // desktop uses original position; mobile nudges the top down to avoid faces
    const desiredTopPct =
      canvasSizePx.w <= 340 ? 0.28 : canvasSizePx.w <= 420 ? 0.24 : originalTopPct;

    // if desired equals original, no adjustment
    if (Math.abs(desiredTopPct - originalTopPct) < 1e-6) return printArea;

    const desiredTopPx = desiredTopPct * canvasSizePx.h;
    const deltaPx = desiredTopPx - renderedTopPx;

    // convert delta in rendered px back to ORIGINAL_CANVAS_PX units
    const deltaOriginal = (deltaPx * ORIGINAL_CANVAS_PX) / canvasSizePx.h;

    // compute new Y and clamp so area stays inside original canvas
    const newY = Math.max(
      0,
      Math.min(printArea.y + deltaOriginal, ORIGINAL_CANVAS_PX - printArea.height)
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

  // convert pointer movement (pixels on screen) to "original" canvas units
  const pxToOriginal = (dx: number, dy: number) => {
    const scaleX = ORIGINAL_CANVAS_PX / Math.max(1, canvasSizePx.w);
    const scaleY = ORIGINAL_CANVAS_PX / Math.max(1, canvasSizePx.h);
    return { dx: dx * scaleX, dy: dy * scaleY };
  };

  // Drag functionality - convert movement from screen px -> original units before applying
  const bind = useDrag(
    ({ active, movement: [mx, my], memo = [designPosition.x, designPosition.y] }) => {
      setIsDragging(active);

      // convert movement to original units
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
      // prevent default scrolling on touch when dragging
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
      {/* Product mockup (responsive) */}
      <Image
        src={productMockup}
        alt="Product mockup"
        className="w-full h-auto block"
        width={1000}
        height={1000}
        priority={false}
      />

      {/* Print area overlay (visual guide) */}
      <div
        className="absolute border-2 border-dashed border-nsanity-red pointer-events-none"
        style={{
          left: `${(adjustedPrintArea.x / ORIGINAL_CANVAS_PX) * 100}%`,
          top: `${(adjustedPrintArea.y / ORIGINAL_CANVAS_PX) * 100}%`,
          width: `${(adjustedPrintArea.width / ORIGINAL_CANVAS_PX) * 100}%`,
          height: `${(adjustedPrintArea.height / ORIGINAL_CANVAS_PX) * 100}%`,
        }}
      />

      {/* Draggable design */}
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

          {/* Resize handles */}
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