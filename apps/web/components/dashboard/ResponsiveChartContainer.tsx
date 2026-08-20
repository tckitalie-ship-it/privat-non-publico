"use client";

import React, {
  useEffect,
  useRef,
  useState,
} from "react";

type ChartSize = {
  width: number;
  height: number;
};

type ResponsiveChartContainerProps = {
  children: (size: ChartSize) => React.ReactNode;
  minHeight?: number;
};

export default function ResponsiveChartContainer({
  children,
  minHeight = 280,
}: ResponsiveChartContainerProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [size, setSize] = useState<ChartSize>({
    width: 0,
    height: minHeight,
  });

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const updateSize = () => {
      const rect = element.getBoundingClientRect();

      const nextWidth = Math.round(rect.width);
      const nextHeight = Math.round(rect.height);

      if (nextWidth <= 0 || nextHeight <= 0) {
        return;
      }

      setSize((current) => {
        if (
          current.width === nextWidth &&
          current.height === nextHeight
        ) {
          return current;
        }

        return {
          width: nextWidth,
          height: nextHeight,
        };
      });
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      className="w-full min-w-0 overflow-hidden"
      style={{ minHeight }}
    >
      {size.width > 0 &&
        size.height > 0 &&
        children(size)}
    </div>
  );
}