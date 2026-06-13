"use client";

import { useEffect, useRef, useState } from "react";

type LazyWhenVisibleProps = {
  children: React.ReactNode;
  rootMargin?: string;
  minHeight?: number;
  className?: string;
};

/** Renders children when near viewport — defers below-fold JS and images. */
export function LazyWhenVisible({
  children,
  rootMargin = "200px",
  minHeight = 480,
  className = "",
}: LazyWhenVisibleProps): React.JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold: 0.01 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div
      ref={ref}
      className={className}
      style={visible ? undefined : { minHeight: `${minHeight}px` }}
    >
      {visible ? children : null}
    </div>
  );
}
