"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap, registerGsapPlugins } from "@/lib/gsap/register-plugins";

type GsapProviderProps = {
  children: ReactNode;
};

/**
 * Root GSAP context — all component timelines should be created inside
 * gsap.context scopes; this provider reverts the root on unmount.
 */
export function GsapProvider({ children }: GsapProviderProps): React.JSX.Element {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerGsapPlugins();
    if (!rootRef.current) return;

    const ctx = gsap.context(() => {}, rootRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return <div ref={rootRef}>{children}</div>;
}
