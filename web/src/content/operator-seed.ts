import type { CuratedOperator } from "@/lib/schemas/operator.schema";

export const OPERATOR_SEED: CuratedOperator[] = [
  {
    username: "prince",
    name: "Prince",
    role: "Graphic & motion designer",
    yearsExp: 8,
    availability: "limited",
    amanahScore: 99,
    completionRate: 100,
    bio: "Eight years crafting visual brands. 182 consecutive 5-star vouches. Logos, banners, PFPs, server kits, animated brand assets. Source files always included.",
    bestResult: "182 consecutive 5-star vouches — 100% verified rating.",
    wontTakeOn: "Rush jobs where speed beats quality. Quality never gets cut.",
    startingPrice: "$25",
    pricingModel: "Per-asset / kit",
    skills: ["Logos", "Banners", "Motion", "PFP", "Brand kits", "Server"],
    idealClient: "Founders and creators who want craft over speed",
    workStyle: "Brief first. Queue respected. Quality never compromised.",
    typicalTimeline: "24–72h (queue dependent)",
    proofLink: "https://brandforge.gg/prince",
    faq: [
      {
        question: "Why do reviews mention longer wait times?",
        answer:
          "Prince takes his time. Every review says the same — it takes longer than expected and it's worth every day of the wait. If you need it fast and forgettable, he's not your guy.",
      },
      {
        question: "What's your typical delivery?",
        answer:
          "Most projects ship in 24–72 hours with the source file included. Queue priority is available for a small additional fee.",
      },
      {
        question: "What kinds of work do you take?",
        answer:
          "Logos, banners, server design, profile pictures, signatures, product cards, animated brand assets.",
      },
    ],
    isVerified: true,
    layoutSpan: "featured",
    displayOrder: 1,
  },
];
