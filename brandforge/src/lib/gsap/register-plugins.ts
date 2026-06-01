import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";
import { useGSAP } from "@gsap/react";

let registered = false;

/** Register GSAP plugins once for the client bundle. SplitText is Club-only — Phase 2 uses in-house split utility. */
export function registerGsapPlugins(): void {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger, Flip, useGSAP);
  registered = true;
}

export { gsap, ScrollTrigger, Flip };
