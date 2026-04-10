/** Placeholder legal copy — replace with counsel-approved text before production. */

export const TERMS_LAST_UPDATED = "April 3, 2026";

export const PRIVACY_LAST_UPDATED = "April 3, 2026";

export const COMPANY_PRODUCT_BLURB = `BrandForge is a creative marketplace and operations platform: members list services and post requests, parties negotiate in Messages, and accepted work becomes trackable Projects with optional AI-assisted workflows.`;

export const termsSections: { heading: string; body: string[] }[] = [
  {
    heading: "Agreement",
    body: [
      "By accessing or using BrandForge (the “Service”), you agree to these Terms. If you do not agree, do not use the Service.",
      "We may update these Terms; material changes will be indicated by updating the date above. Continued use after changes constitutes acceptance.",
    ],
  },
  {
    heading: "Accounts",
    body: [
      "You must provide accurate registration information and safeguard your credentials. You are responsible for activity under your account.",
      "We may suspend or terminate accounts that violate these Terms, pose security risk, or harm other users or the platform.",
    ],
  },
  {
    heading: "Marketplace & payments",
    body: [
      "BrandForge facilitates introductions, messaging, and (where enabled) payments between members. Specific deliverables, pricing, and timelines are agreed between users unless a binding checkout or contract flow states otherwise.",
      "Fees, taxes, and escrow rules are disclosed at checkout or in product documentation. Chargebacks and disputes may be governed by separate policies and payment provider terms.",
    ],
  },
  {
    heading: "Content & IP",
    body: [
      "You retain rights to content you upload. You grant BrandForge a limited license to host, display, and operate the Service with respect to that content.",
      "Do not upload unlawful content, malware, or material you do not have rights to use commercially.",
    ],
  },
  {
    heading: "Disclaimer & liability",
    body: [
      'The Service is provided “as is” without warranties of uninterrupted or error-free operation. To the maximum extent permitted by law, BrandForge is not liable for indirect, incidental, or consequential damages arising from use of the Service.',
      "Some jurisdictions do not allow certain limitations; in those cases our liability is limited to the fullest extent permitted by law.",
    ],
  },
  {
    heading: "Contact",
    body: [
      "Questions about these Terms: use the contact method published on your deployment (e.g. support email in environment or marketing site).",
    ],
  },
];

export const privacySections: { heading: string; body: string[] }[] = [
  {
    heading: "What we collect",
    body: [
      "Account data: email, profile fields, and authentication identifiers from our auth provider (e.g. Supabase).",
      "Usage data: interactions with the app, marketplace listings, messages metadata, and technical logs needed for security and reliability.",
      "Payment data is processed by payment partners; we do not store full card numbers on BrandForge application servers when using standard Stripe flows.",
    ],
  },
  {
    heading: "Why we use data",
    body: [
      "To provide core features: profiles, discovery, messaging, projects, notifications, and optional AI features you invoke.",
      "To secure the Service, prevent abuse, and comply with legal obligations.",
      "To improve performance and fix bugs (aggregated or de-identified where feasible).",
    ],
  },
  {
    heading: "Sharing",
    body: [
      "We share data with subprocessors required to run the product (hosting, database, auth, email, analytics as configured on your deployment).",
      "We may disclose information if required by law or to protect rights, safety, and integrity of users and the platform.",
      "We do not sell personal information as commonly defined in US state privacy laws; specific regional addenda may apply to your deployment.",
    ],
  },
  {
    heading: "Retention & rights",
    body: [
      "We retain data as long as your account is active and as needed for legitimate business or legal purposes after closure.",
      "Depending on jurisdiction, you may have rights to access, correct, delete, or export personal data. Contact support to exercise rights; identity verification may be required.",
    ],
  },
  {
    heading: "International users",
    body: [
      "If you access the Service from outside the country where servers run, your data may be processed in other regions with appropriate safeguards as required by law.",
    ],
  },
  {
    heading: "Contact",
    body: [
      "Privacy inquiries: use the contact method configured for your BrandForge deployment.",
    ],
  },
];
