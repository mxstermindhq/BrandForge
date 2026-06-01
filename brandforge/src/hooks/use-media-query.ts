"use client";

import { useEffect, useState } from "react";

/** Match Tailwind lg breakpoint — disable heavy scroll pins below this width. */
export function useIsMobile(maxWidth = 1023): boolean {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(`(max-width: ${maxWidth}px)`);

    const apply = (): void => {
      setMobile(media.matches);
    };

    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [maxWidth]);

  return mobile;
}
