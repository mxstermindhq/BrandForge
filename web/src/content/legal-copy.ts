/** Directory-focused legal copy — replace with counsel-approved text before scale. */

export const TERMS_LAST_UPDATED = "May 19, 2026";
export const PRIVACY_LAST_UPDATED = "May 19, 2026";

export const COMPANY_PRODUCT_BLURB =
  "BrandForge is a curated operator directory. mxstermind introduces founders and creators to vetted specialists — one conversation, scoped fit, no marketplace bidding.";

export const termsSections: { heading: string; body: string[] }[] = [
  {
    heading: "Agreement",
    body: [
      "By using BrandForge (the “Directory”), you agree to these Terms. If you do not agree, do not use the Directory.",
      "We may update these Terms; continued use after the date above constitutes acceptance of material changes.",
    ],
  },
  {
    heading: "What BrandForge provides",
    body: [
      "BrandForge publishes curated operator profiles, services, and work samples for discovery.",
      "mxstermind coordinates introductions and scoping via Telegram or other channels we publish. Deliverables, pricing, and timelines are agreed directly between you and the operator unless a separate written agreement states otherwise.",
      "BrandForge is not a marketplace escrow platform in its current directory form. Payment terms are disclosed during your conversation with mxstermind.",
    ],
  },
  {
    heading: "Accounts",
    body: [
      "Operator sign-in is provided for profile maintenance. Clients typically start on the homepage or via Telegram without creating an account.",
      "You are responsible for safeguarding credentials and for activity under your account.",
    ],
  },
  {
    heading: "Conduct",
    body: [
      "Do not misuse the Directory, scrape it abusively, attempt unauthorized access, or submit false interest or contact information.",
      "Do not harass operators or mxstermind staff through any contact channel linked from the site.",
    ],
  },
  {
    heading: "Disclaimer",
    body: [
      "The Directory is provided “as is.” We do not guarantee uninterrupted availability or that every operator engagement will meet your expectations.",
      "To the maximum extent permitted by law, BrandForge is not liable for indirect or consequential damages arising from use of the Directory or operator engagements.",
    ],
  },
  {
    heading: "Contact",
    body: ["Questions: privacy@brandforge.gg or the Telegram handle published on brandforge.gg."],
  },
];

export const privacySections: { heading: string; body: string[] }[] = [
  {
    heading: "What we collect",
    body: [
      "Contact interest: email and intent (hire vs get listed) when you submit the homepage form.",
      "Account data: if you sign in as an operator — email, auth identifiers, and profile fields from our auth provider (Supabase).",
      "Usage data: page paths and CTA events stored for product improvement (directory_events).",
      "Technical logs: IP, browser, and security-related metadata from hosting providers.",
    ],
  },
  {
    heading: "How we use data",
    body: [
      "To operate the Directory, respond to interest submissions, and route conversations via mxstermind.",
      "To secure the service and prevent abuse.",
      "To measure which pages and CTAs drive conversations (aggregated where feasible).",
    ],
  },
  {
    heading: "Sharing",
    body: [
      "We use subprocessors for hosting (Cloudflare), database/auth (Supabase), and optional notifications (e.g. Discord webhooks configured server-side).",
      "Operator profiles are public by design. We do not sell personal information.",
      "We may disclose information if required by law.",
    ],
  },
  {
    heading: "Retention & rights",
    body: [
      "Interest submissions and analytics events are retained as needed for operations and reporting.",
      "You may request access or deletion of account-related data by contacting privacy@brandforge.gg.",
    ],
  },
  {
    heading: "Cookies",
    body: [
      "We use local storage for theme preference and session authentication when you sign in.",
      "No third-party ad trackers are installed by default on the directory site.",
    ],
  },
];

export const helpFaqs: { q: string; a: string }[] = [
  {
    q: "How do I buy a service or product?",
    a: "Browse the forge, pick a listing, and message on Discord or Telegram. You get direct communication and clear delivery windows.",
  },
  {
    q: "Is BrandForge a design agency?",
    a: "No. It's a marketplace for digital products and services — AI, Discord, brands, dev, content, templates, and more.",
  },
  {
    q: "How do I sell on BrandForge?",
    a: "Sign in as an operator or message us on Discord to get listed. We curate quality; the forge is not open spam listings.",
  },
  {
    q: "Do I need an account to buy?",
    a: "No. Browse and checkout paths run through Discord/Telegram. Sellers sign in to manage profiles and listings.",
  },
  {
    q: "How fast is delivery?",
    a: "Many services ship in 24–48h. Each listing shows its delivery window. Stats on the homepage reflect typical forge speed.",
  },
];
