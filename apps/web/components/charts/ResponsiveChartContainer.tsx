"use client";

import { useEffect, useRef, useState } from "react";

export default function ResponsiveChartContainer({
  children,
}: {
  children: (size: { width: number; height: number }) => React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="w-full h-full min-h-[300px] min-w-[300px]"
      style={{ position: "relative" }}
    >
      {size.width > 0 && size.height > 0 ? (
        children(size)
      ) : (
        <div className="text-gray-500 text-sm">Loading chart…</div>
      )}
    </div>
  );
}
