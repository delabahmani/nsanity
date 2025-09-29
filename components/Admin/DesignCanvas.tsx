import { useState } from "react";
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

const DesignCanvas = ({
  productMockup,
  uploadedDesign,
  printArea,
  onDesignUpdate,
}: DesignCanvasProps) => {
  const [designPosition, setDesignPosition] = useState({
    x: printArea.x + printArea.width / 4,
    y: printArea.y + printArea.height / 4,
  });
  const [designSize, setDesignSize] = useState({
    width: printArea.width / 2,
    height: printArea.height / 2,
  });
  const [isDragging, setIsDragging] = useState(false);

  const handleResize = (
    newSize: { width: number; height: number },
    newPos?: { x: number; y: number }
  ) => {
    setDesignSize(newSize);
    if (newPos) {
      setDesignPosition(newPos);
    }

    if (onDesignUpdate) {
      onDesignUpdate({
        x: newPos?.x || designPosition.x,
        y: newPos?.y || designPosition.y,
        width: newSize.width,
        height: newSize.height,
      });
    }
  };

  // Drag functionality
  const bind = useDrag(
    ({
      active,
      movement: [mx, my],
      memo = [designPosition.x, designPosition.y],
    }) => {
      setIsDragging(active);

      // Constrain to print area boundaries
      const newX = Math.max(
        printArea.x,
        Math.min(printArea.x + printArea.width - designSize.width, memo[0] + mx)
      );
      const newY = Math.max(
        printArea.y,
        Math.min(
          printArea.y + printArea.height - designSize.height,
          memo[1] + my
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
      filterTaps: true,
      threshold: 1,
      rubberband: false,
    }
  );

  return (
    <div className="relative w-fit mx-auto">
      {/* Product mockup */}
      <Image
        src={productMockup}
        alt="Product mockup"
        className="max-w-full h-auto"
        style={{ maxWidth: "400px" }}
        width={1000}
        height={1000}
      />

      {/* Print area overlay (visual guide) */}
      <div
        className="absolute border-2 border-dashed border-nsanity-red opacity-50 pointer-events-none"
        style={{
          left: `${(printArea.x / 3000) * 100}%`,
          top: `${(printArea.y / 3000) * 100}%`,
          width: `${(printArea.width / 3000) * 100}%`,
          height: `${(printArea.height / 3000) * 100}%`,
        }}
      />

      {/* Draggable design */}
      {uploadedDesign && (
        <div
          {...bind()}
          className="absolute cursor-move border-2 border-blue-500"
          style={{
            left: `${(designPosition.x / 3000) * 100}%`,
            top: `${(designPosition.y / 3000) * 100}%`,
            width: `${(designSize.width / 3000) * 100}%`,
            height: `${(designSize.height / 3000) * 100}%`,
            transition: isDragging ? "scale(1.05)" : "scale(1)",
            zIndex: 10,
          }}
        >
          <Image
            src={uploadedDesign}
            alt="Design"
            className="w-full h-full object-contain"
            draggable={false}
            width={1000}
            height={1000}
          />

          {/* Resize handles */}
          <DesignResizeHandles
            designSize={designSize}
            designPosition={designPosition}
            printArea={printArea}
            onResize={handleResize}
          />
        </div>
      )}
    </div>
  );
};

export default DesignCanvas;
