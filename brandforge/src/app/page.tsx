import { SiteFooter } from "@/components/shell/SiteFooter";
import { SiteHeader } from "@/components/shell/SiteHeader";
import { HomeHero, HomeSections } from "@/components/sections/HomeSections";

export default function HomePage(): React.JSX.Element {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[500] focus:rounded focus:bg-accent focus:px-4 focus:py-2 focus:font-bold focus:text-white"
      >
        Skip to content
      </a>

      <SiteHeader />

      <main id="main">
        <HomeHero />
        <HomeSections />
      </main>

      <SiteFooter />
    </>
  );
}
