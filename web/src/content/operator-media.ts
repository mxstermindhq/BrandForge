export type WorkStage = "done" | "doing" | "planned";

export type WorkPiece = {
  id: string;
  title: string;
  description: string;
  stage: WorkStage;
  image: string;
  ratio?: "wide" | "square" | "portrait";
};

export type OperatorReview = {
  id: string;
  quote: string;
  reviewer: string;
  context: string;
};

export type OperatorService = {
  id: string;
  name: string;
  tagline: string;
  price: string;
  image: string;
  bullets: string[];
};

export type OperatorMedia = {
  portrait: string;
  cover: string;
  accentTagline: string;
  workPieces: WorkPiece[];
  reviews: OperatorReview[];
  services: OperatorService[];
};

export const OPERATOR_MEDIA: Record<string, OperatorMedia> = {
  prince: {
    portrait: "/images/prince/portrait.png",
    cover: "/images/prince/work-motion.png",
    accentTagline: "182 verified vouches · 100% 5-star · Worth the wait.",
    workPieces: [
      {
        id: "logo-monogram",
        title: "Monogram logo system",
        description: "Embossed monogram lockup for a luxury brand identity.",
        stage: "done",
        image: "/images/prince/work-logo.png",
        ratio: "wide",
      },
      {
        id: "server-banner",
        title: "Server brand banner",
        description: "Premium server banner — marble, foil, and gold finish.",
        stage: "done",
        image: "/images/prince/work-banner.png",
        ratio: "wide",
      },
      {
        id: "pfp-grid",
        title: "PFP series",
        description: "Four matched social avatars across light & dark finishes.",
        stage: "done",
        image: "/images/prince/work-pfp.png",
        ratio: "square",
      },
      {
        id: "motion-asset",
        title: "Motion brand still",
        description: "3D chrome motion sequence for a product reveal.",
        stage: "doing",
        image: "/images/prince/work-motion.png",
        ratio: "wide",
      },
    ],
    reviews: [
      {
        id: "rev-1",
        quote:
          "Prince knows his shit. I came in with an idea, he pointed me in the right direction. Some sellers take your money — this artist cares about his craft. I'll 100% be back.",
        reviewer: "Client",
        context: "March 2026",
      },
      {
        id: "rev-2",
        quote:
          "His work is honestly the best. Bought banner and logo, changed some stuff up — no issues at all.",
        reviewer: "Vouch #107",
        context: "Verified buyer",
      },
      {
        id: "rev-3",
        quote:
          "He is the best graphics artist out there. I've never had any problems with his designs. Not like others who use free templates.",
        reviewer: "Vouch #106",
        context: "Verified buyer",
      },
      {
        id: "rev-4",
        quote:
          "Delivered in 24 hours and gave me the source file to edit. Recommended.",
        reviewer: "Vouch #149",
        context: "Verified buyer",
      },
      {
        id: "rev-5",
        quote:
          "8 panels, pfp and server banner for $25. Paid extra to skip queue — he was fast. 10/10 service.",
        reviewer: "Vouch #153",
        context: "Verified buyer",
      },
      {
        id: "rev-6",
        quote: "GFX level is extreme.",
        reviewer: "Vouch #168",
        context: "Verified buyer",
      },
    ],
    services: [
      {
        id: "prince-logo",
        name: "Logo & monogram",
        tagline: "Hand-crafted monogram lockup with source file.",
        price: "From $45",
        image: "/images/prince/work-logo.png",
        bullets: ["Concept brief", "2 directions", "Source + PNG + SVG", "Free 1 revision"],
      },
      {
        id: "prince-banner",
        name: "Server / brand banner",
        tagline: "Premium animated banner that signals quality on day one.",
        price: "From $35",
        image: "/images/prince/work-banner.png",
        bullets: ["Brief intake", "1 banner design", "Animated MP4 option", "Source file"],
      },
      {
        id: "prince-kit",
        name: "Full brand kit",
        tagline: "Logo + banner + 4 PFPs + 8 panels — your full identity drop.",
        price: "From $120",
        image: "/images/prince/service-design.png",
        bullets: ["Full identity system", "Source + delivery files", "Queue priority option", "Lifetime resend"],
      },
    ],
  },
};

export function getOperatorMedia(username: string): OperatorMedia | null {
  return OPERATOR_MEDIA[username.toLowerCase()] ?? null;
}
