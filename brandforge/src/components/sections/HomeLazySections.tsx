"use client";

import dynamic from "next/dynamic";

export const HomeMotionSections = dynamic(
  () =>
    import("@/components/sections/HomeSections").then((mod) => ({
      default: mod.HomeMotionSections,
    })),
  { ssr: false },
);

export const HomeClosingSections = dynamic(
  () =>
    import("@/components/sections/HomeSections").then((mod) => ({
      default: mod.HomeClosingSections,
    })),
  { ssr: false },
);

export const HomeBelowFoldSections = dynamic(
  () =>
    import("@/components/sections/HomeStaticSections").then((mod) => ({
      default: mod.HomeBelowFoldSections,
    })),
  { ssr: true },
);
