import { useDrag } from "@use-gesture/react";

interface DesignResizeHandlesProps {
  designSize: { width: number; height: number };
  designPosition: { x: number; y: number };
  printArea: { x: number; y: number; width: number; height: number };
  onResize: (
    newSize: { width: number; height: number },
    newPos?: { x: number; y: number }
  ) => void;
}

const DesignResizeHandles: React.FC<DesignResizeHandlesProps> = ({
  designSize,
  designPosition,
  printArea,
  onResize,
}) => {
  const createResizeBind = (edge: ("top" | "bottom" | "left" | "right")[]) => {
    return useDrag(({ down, movement: [mx, my], memo }) => {
      memo = memo || {
        x: designPosition.x,
        y: designPosition.y,
        width: designSize.width,
        height: designSize.height,
      };
      let { width, height, x, y } = memo;
      let newPos;

      if (edge.includes("right")) width += mx;
      if (edge.includes("bottom")) height += my;
      if (edge.includes("left")) {
        width -= mx;
        x += mx;
      }
      if (edge.includes("top")) {
        height -= my;
        y += my;
      }

      // Minimum size for designs
      width = Math.max(50, width);
      height = Math.max(50, height);

      // Constrain to print area boundaries
      if (x < printArea.x) {
        width -= printArea.x - x;
        x = printArea.x;
      }
      if (y < printArea.y) {
        height -= printArea.y - y;
        y = printArea.y;
      }
      if (x + width > printArea.x + printArea.width) {
        width = printArea.x + printArea.width - x;
      }
      if (y + height > printArea.y + printArea.height) {
        height = printArea.y + printArea.height - y;
      }

      if (edge.includes("left") || edge.includes("top")) newPos = { x, y };
      if (down) onResize({ width, height }, newPos);
      return memo;
    });
  };

  const bindTop = createResizeBind(["top"]);
  const bindBottom = createResizeBind(["bottom"]);
  const bindLeft = createResizeBind(["left"]);
  const bindRight = createResizeBind(["right"]);

  const bindTopLeft = createResizeBind(["top", "left"]);
  const bindTopRight = createResizeBind(["top", "right"]);
  const bindBottomLeft = createResizeBind(["bottom", "left"]);
  const bindBottomRight = createResizeBind(["bottom", "right"]);

  return (
    <>
      {/* Edges */}
      <div
        {...bindTop()}
        className="absolute top-[-4px] left-0 w-full h-2 cursor-ns-resize z-10"
      />
      <div
        {...bindBottom()}
        className="absolute bottom-[-4px] left-0 w-full h-2 cursor-ns-resize z-10"
      />
      <div
        {...bindLeft()}
        className="absolute top-0 left-[-4px] w-2 h-full cursor-we-resize z-10"
      />
      <div
        {...bindRight()}
        className="absolute top-0 right-[-4px] w-2 h-full cursor-we-resize z-10"
      />

      {/* Corners */}
      <div
        {...bindTopLeft()}
        className="absolute top-[-4px] left-[-4px] w-4 h-4 cursor-nwse-resize z-10 bg-blue-500 border border-white"
      />
      <div
        {...bindTopRight()}
        className="absolute top-[-4px] right-[-4px] w-4 h-4 cursor-nesw-resize z-10 bg-blue-500 border border-white"
      />
      <div
        {...bindBottomLeft()}
        className="absolute bottom-[-4px] left-[-4px] w-4 h-4 cursor-nesw-resize z-10 bg-blue-500 border border-white"
      />
      <div
        {...bindBottomRight()}
        className="absolute bottom-[-4px] right-[-4px] w-4 h-4 cursor-nwse-resize z-10 bg-blue-500 border border-white"
      />
    </>
  );
};

export default DesignResizeHandles;
