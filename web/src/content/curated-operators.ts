export type CuratedOperator = {
  username: string;
  name: string;
  role: string;
  yearsExp: number;
  availability: "available" | "limited";
  amanahScore: number;
  completionRate: number;
  startingPrice: string;
  skills: string[];
  bio: string;
  bestResult: string;
  wontTake: string;
  status: "complete" | "building";
  faq: Array<{ question: string; answer: string }>;
};

export const CURATED_OPERATORS: CuratedOperator[] = [
  {
    username: "mxstermind",
    name: "Mxstermind",
    role: "Founder / executive",
    yearsExp: 6,
    availability: "available",
    amanahScore: 98,
    completionRate: 97,
    startingPrice: "Fixed package / starts from EUR 497",
    skills: ["n8n", "Next.js", "Growth systems"],
    bio: "The guarantor behind every deal on this platform. Builds high-trust operator teams for founders and brands.",
    bestResult: "Built and coordinated multi-role delivery teams that shipped products and growth systems in weeks.",
    wontTake: "Vague briefs, no owner on the client side, and projects without clear accountability.",
    status: "complete",
    faq: [
      {
        question: "What do you actually do in the engagement?",
        answer:
          "I scope the work, select the right operator, and stay accountable through delivery so nothing falls between people.",
      },
      {
        question: "When should a client talk to you first?",
        answer:
          "When they need execution fast and want one responsible point of contact instead of managing five freelancers.",
      },
      {
        question: "What makes you decline a project?",
        answer:
          "Unclear outcomes, unrealistic deadlines, or a client that will not provide fast feedback cycles.",
      },
    ],
  },
  {
    username: "dipps",
    name: "Dipps",
    role: "Software engineer",
    yearsExp: 7,
    availability: "available",
    amanahScore: 93,
    completionRate: 95,
    startingPrice: "Starts from EUR 1,500",
    skills: ["Backend systems", "API design", "Reliability"],
    bio: "Engineer focused on robust product architecture and maintainable delivery.",
    bestResult: "Stabilized critical app architecture and reduced production regressions across releases.",
    wontTake: "Patchwork projects with no technical owner and no quality standard.",
    status: "building",
    faq: [
      {
        question: "What type of projects are best for Dipps?",
        answer: "Products that need reliable engineering foundations, clean APIs, and long-term maintainability.",
      },
      {
        question: "How does Dipps work with product teams?",
        answer: "With clear milestones, technical checkpoints, and transparent handoff notes at each stage.",
      },
      {
        question: "What should clients prepare before kickoff?",
        answer: "Current architecture docs, constraints, deadlines, and success criteria.",
      },
    ],
  },
  {
    username: "thami",
    name: "Thami",
    role: "Software engineer",
    yearsExp: 10,
    availability: "limited",
    amanahScore: 95,
    completionRate: 96,
    startingPrice: "Starts from EUR 2,000",
    skills: ["Platform engineering", "Architecture", "Delivery ops"],
    bio: "Senior engineer with a decade of shipping production systems.",
    bestResult: "Led multi-release delivery plans with consistent on-time milestones.",
    wontTake: "Projects where decisions are repeatedly delayed and scope keeps shifting without ownership.",
    status: "building",
    faq: [
      {
        question: "Where does Thami add the most value?",
        answer: "Complex systems where architecture, reliability, and delivery governance all matter.",
      },
      {
        question: "How does Thami handle changing requirements?",
        answer: "By formalizing scope deltas and timeline trade-offs before implementation changes begin.",
      },
      {
        question: "Can Thami mentor internal developers?",
        answer: "Yes, especially on architecture decisions and production-quality engineering practices.",
      },
    ],
  },
  {
    username: "nero",
    name: "Nero",
    role: "Developer / engineer",
    yearsExp: 12,
    availability: "limited",
    amanahScore: 96,
    completionRate: 97,
    startingPrice: "Starts from EUR 2,500",
    skills: ["Full-stack delivery", "System design", "Scale readiness"],
    bio: "Twelve years delivering software products across engineering and architecture tracks.",
    bestResult: "Turned fragmented codebases into scalable product systems ready for growth.",
    wontTake: "No-scope rush projects that skip architecture and QA by design.",
    status: "building",
    faq: [
      {
        question: "What is Nero best known for?",
        answer: "Deep engineering ownership from architecture decisions through production stabilization.",
      },
      {
        question: "What project stage is ideal for Nero?",
        answer: "Rebuilds, scale-up phases, and technical restructuring before major growth pushes.",
      },
      {
        question: "How does Nero report progress?",
        answer: "By milestone-based updates tied to business outcomes, not vague activity logs.",
      },
    ],
  },
  {
    username: "vectura",
    name: "Vectura",
    role: "Frontend + backend developer",
    yearsExp: 8,
    availability: "available",
    amanahScore: 92,
    completionRate: 94,
    startingPrice: "Starts from EUR 1,800",
    skills: ["Next.js", "Supabase", "Full-stack features"],
    bio: "Product-oriented full-stack builder across frontend and backend workflows.",
    bestResult: "Shipped integrated product features end-to-end without handoff bottlenecks.",
    wontTake: "Design-only engagements with no product ownership and no release path.",
    status: "building",
    faq: [
      {
        question: "What can Vectura deliver quickly?",
        answer: "End-to-end product features from interface to database with clean release discipline.",
      },
      {
        question: "What stack does Vectura prefer?",
        answer: "Modern TypeScript stacks with clear deployment and observability practices.",
      },
      {
        question: "When is Vectura not the right fit?",
        answer: "When scope is only exploratory and there is no plan to ship.",
      },
    ],
  },
  {
    username: "nik",
    name: "Nik",
    role: "Web3 developer",
    yearsExp: 6,
    availability: "available",
    amanahScore: 91,
    completionRate: 93,
    startingPrice: "Starts from EUR 1,900",
    skills: ["Web3 integration", "Smart contract workflows", "Wallet UX"],
    bio: "Web3-focused engineer for practical blockchain product integrations.",
    bestResult: "Delivered secure wallet and transaction flows with production-ready UX and controls.",
    wontTake: "Speculative token-first projects with no product utility or compliance awareness.",
    status: "building",
    faq: [
      {
        question: "What kind of Web3 work does Nik handle?",
        answer: "Real product integrations where blockchain supports a clear user and business need.",
      },
      {
        question: "How is risk handled in Web3 scope?",
        answer: "With explicit constraints, security reviews, and strict release criteria before launch.",
      },
      {
        question: "Can Nik work with existing web teams?",
        answer: "Yes, especially to integrate Web3 capabilities without breaking core product flows.",
      },
    ],
  },
  {
    username: "don-eros",
    name: "Don Eros",
    role: "Marketing specialist",
    yearsExp: 9,
    availability: "available",
    amanahScore: 94,
    completionRate: 95,
    startingPrice: "Starts from EUR 1,200",
    skills: ["Campaign strategy", "Growth systems", "Offer positioning"],
    bio: "Performance-minded marketer focused on messaging clarity and repeatable growth execution.",
    bestResult: "Improved campaign efficiency through cleaner positioning and tighter acquisition funnels.",
    wontTake: "Vanity-first growth work without attribution, measurement, or outcome ownership.",
    status: "building",
    faq: [
      {
        question: "What outcomes does Don Eros prioritize?",
        answer: "Measurable growth outcomes tied to revenue, conversion quality, and repeatability.",
      },
      {
        question: "What makes campaigns fail early?",
        answer: "Weak offer clarity and poor feedback loops between messaging, creative, and funnel data.",
      },
      {
        question: "How quickly can strategy become execution?",
        answer: "Usually fast, once positioning and targeting constraints are agreed in writing.",
      },
    ],
  },
  {
    username: "ae",
    name: "AE",
    role: "Graphic + motion designer",
    yearsExp: 7,
    availability: "limited",
    amanahScore: 93,
    completionRate: 94,
    startingPrice: "Starts from EUR 1,100",
    skills: ["Brand visuals", "Motion systems", "Social creative"],
    bio: "Designer blending visual identity and motion to improve brand clarity and attention quality.",
    bestResult: "Built visual systems that improved campaign quality and consistency across channels.",
    wontTake: "Unstructured creative requests with no brief, no references, and no decision owner.",
    status: "building",
    faq: [
      {
        question: "What does AE focus on most?",
        answer: "Visual clarity, consistency, and motion that supports conversion rather than distraction.",
      },
      {
        question: "What is needed before design starts?",
        answer: "A clear brief, references, success goals, and a decisive reviewer on the client side.",
      },
      {
        question: "Can AE support ongoing content systems?",
        answer: "Yes, especially for teams needing repeatable design and motion output every month.",
      },
    ],
  },
];

export function getCuratedOperatorByUsername(username: string): CuratedOperator | null {
  const needle = String(username || "").trim().toLowerCase().replace(/^@+/, "");
  return CURATED_OPERATORS.find((p) => p.username.toLowerCase() === needle) || null;
}
