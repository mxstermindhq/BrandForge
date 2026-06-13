import { BrowserMockup } from "@/components/visual/BrowserMockup";
import { PhoneMockup } from "@/components/visual/PhoneMockup";
import { TabletMockup } from "@/components/visual/TabletMockup";
import type { MockupType } from "@/types/portfolio";

type ProjectMockupProps = {
  type: MockupType;
  projectName: string;
  screenshotUrl?: string;
  gradientFrom: string;
  gradientTo: string;
  className?: string;
  overlay?: React.ReactNode;
  imageLoading?: "lazy" | "eager";
  imagePriority?: boolean;
};

export function ProjectMockup({
  type,
  projectName,
  screenshotUrl,
  gradientFrom,
  gradientTo,
  className = "",
  overlay,
  imageLoading = "lazy",
  imagePriority = false,
}: ProjectMockupProps): React.JSX.Element {
  const imageProps = { imageLoading, imagePriority };
  const mockup =
    type === "phone" ? (
      <PhoneMockup
        projectName={projectName}
        screenshotUrl={screenshotUrl}
        gradientFrom={gradientFrom}
        gradientTo={gradientTo}
        {...imageProps}
      />
    ) : type === "tablet" ? (
      <TabletMockup
        projectName={projectName}
        screenshotUrl={screenshotUrl}
        gradientFrom={gradientFrom}
        gradientTo={gradientTo}
        {...imageProps}
      />
    ) : (
      <BrowserMockup
        projectName={projectName}
        screenshotUrl={screenshotUrl}
        gradientFrom={gradientFrom}
        gradientTo={gradientTo}
        {...imageProps}
      />
    );

  return (
    <div className={`relative ${className}`}>
      {mockup}
      {overlay ? <div className="absolute right-2 top-2 z-10">{overlay}</div> : null}
    </div>
  );
}
