"use client";

import React, {
  useEffect,
  useRef,
  useState,
} from "react";

type ResponsiveChartContainerProps = {
  children: (size: {
    width: number;
    height: number;
  }) => React.ReactNode;
  minHeight?: number;
};

export default function ResponsiveChartContainer({
  children,
  minHeight = 280,
}: ResponsiveChartContainerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const updateWidth = () => {
      const nextWidth = element.getBoundingClientRect().width;

      if (nextWidth > 0) {
        setWidth(nextWidth);
      }
    };

    updateWidth();

    const observer = new ResizeObserver(() => {
      updateWidth();
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      className="w-full overflow-hidden"
      style={{ height: minHeight }}
    >
      {width > 0 &&
        children({
          width,
          height: minHeight,
        })}
    </div>
  );
}