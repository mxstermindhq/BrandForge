export const BLOG_EXTRA_SECTIONS: Record<
  string,
  readonly { heading: string; paragraphs: readonly string[] }[]
> = {
  "how-we-rebuilt-sol-app-for-sui-blockchain-two-weeks": [
    {
      heading: "Wallet matrix before wireframes",
      paragraphs: [
        "Chain migrations fail when design starts before compatibility is proven. We ran a wallet matrix on real devices — popular SUI wallets, testnet RPC quirks, and signing edge cases — before anyone touched UI polish. That spike saved three days of rework when one wallet returned ambiguous error states on Android.",
        "Established buyers should demand the same sequence: integration proof, then screens. If your vendor skips the matrix, you are funding discovery on your deadline. See blockchain delivery patterns at /developers/blockchain/ and compare shipped wallet work on /portfolio/sui-blockchain/.",
      ],
    },
    {
      heading: "Error copy is product design",
      paragraphs: [
        "On mobile Web3, the error message is the brand moment after a failed transaction. Generic “something went wrong” copy sends users back to Discord to ask mods — or worse, to a competitor app. We wrote human-readable errors tied to recoverable actions: retry, switch network, check balance, contact support with a reference code.",
        "That discipline matters for investor demos and retention alike. Founder OS mobile scope includes copy, not only components. When your milestone is public, treat signing failures as UX requirements in the scope doc — not post-launch polish. Intake starts at /apply/ with your current stack and milestone date.",
      ],
    },
    {
      heading: "Phase two without scope creep",
      paragraphs: [
        "Two-week engagements succeed when phase two is named on day one. We handed off a gap list: social features, analytics dashboards, and advanced portfolio views stayed explicitly out of scope. Stakeholders signed that list so the demo did not become a stealth full rewrite.",
        "That boundary is how mxstermind protects quality on hard deadlines. If you need wallet plus growth site plus admin panel, split milestones and price each outcome — see /process/ for how we write those slices. Package landers live at brandforge.gg/packages/; chain migrations stay on mxstermind Founder OS here.",
      ],
    },
    {
      heading: "When two weeks is the wrong bet",
      paragraphs: [
        "Not every migration belongs in a fortnight. Backend custody changes, novel smart-contract flows, or unaudited third-party SDKs need longer spikes — and we say so in fit review rather than accepting a deposit we cannot honour.",
        "Established businesses respect that honesty more than a yes that slips. Send your milestone, current codebase access, and non-negotiable demo flows through /apply/ or Discord. We will map a realistic sequence — or redirect simpler web scope to BrandForge packages when that is the professional choice.",
      ],
    },
  ],

  "bespoke-agency-vs-package-agency-which-is-right": [
    {
      heading: "Signals your project belongs at mxstermind",
      paragraphs: [
        "Founder OS intake makes sense when work crosses surfaces: mobile wallet, admin panel, brand system, and analytics in one timeline. Add procurement review, named engineering counterparts, or compliance attachments and packages stop being comparable — you are buying coordinated delivery, not a SKU.",
        "Portfolio depth is the fastest self-check. Browse /portfolio/ for trading desks, verification systems, and chain migrations — if your brief rhymes with those builds, start at /apply/. mxstermind quotes after fit review with a written scope document, not a shopping cart.",
      ],
    },
    {
      heading: "When packages are the professional choice",
      paragraphs: [
        "There is no virtue in custom OS pricing for a bounded lander and logo when you have no internal engineering team. BrandForge.gg publishes tiers because operators and smaller established teams want known USD, escrow-friendly terms, and delivery in days — not a six-week discovery phase.",
        "Start at brandforge.gg/packages/ when scope fits a published deliverable list. Many clients begin there and escalate to mxstermind for phase two product work. Same studio network — different intake path. Choosing the smaller door first is strategy, not a downgrade.",
      ],
    },
    {
      heading: "Procurement and NDAs change the math",
      paragraphs: [
        "Enterprise buyers rarely purchase from a package page alone. They need vendor diligence, milestone language, data handling answers, and sometimes MSAs before deposit. mxstermind is structured for that conversation — /ethics-standards/ is the operational pre-read, /process/ is the engagement map.",
        "Packages can still run in parallel for a subsidiary brand or internal tool while Founder OS work handles the flagship product. Clarity on which entity signs which scope prevents finance surprises. Message Discord with both tracks described; we route each to the correct front door without duplicate teams.",
      ],
    },
    {
      heading: "Handoff between BrandForge and Studio",
      paragraphs: [
        "The cleanest upgrades share assets: tokens, Figma sources, deployed URLs, and analytics baselines. We do not restart discovery when phase one already proved conversion on a package lander — we extend the system with new milestones tied to verifiable outputs.",
        "If phase one lived on BrandForge, bring the staging URL and change-order history to mxstermind intake. If you are unsure which door fits, send outcome, references, deadline, and budget band — the four fields in our brief article — and we will answer within 24 hours on business days.",
      ],
    },
  ],

  "what-is-a-growth-engine-and-how-to-build-one": [
    {
      heading: "Engines need owned infrastructure",
      paragraphs: [
        "Renting your entire funnel on one social platform is not an engine — it is a single point of failure. Established businesses compound when they own the primary URL, email or CRM capture, and FAQ-rich pages that assistants and search can cite without a login wall.",
        "mxstermind often ships product and the first engine slice together: flagship site, service depth, case proof on /portfolio/, and measurement hooks before paid scale. See /services/ for capability areas and /process/ for how milestones are written when growth and product share one timeline.",
      ],
    },
    {
      heading: "Content that feeds the loop",
      paragraphs: [
        "Each loop turn needs content with a job: answer a buyer question, show proof, or capture intent. Thin blog posts do not compound — structured editorial tied to shipped work does. That is why mxstermind publishes case-derived articles with paths to /developers/ and live portfolio URLs.",
        "GEO and traditional SEO both reward self-contained paragraphs on service and case pages. Write what you cost, how quotes arrive, and what proof exists — without forcing a sales call first. Package-tier SEO maintenance lives on BrandForge; Founder OS editorial depth stays here when the brand needs diagnosis before a SKU fits.",
      ],
    },
    {
      heading: "Paid traffic after baselines",
      paragraphs: [
        "Spending before LCP and conversion baselines exist burns budget into a broken bucket. Fix hero clarity, primary CTA, and one north-star event — demo booked, account created, deposit sent — then layer paid. Established CMOs already know this; the failure mode is agency pressure to “launch ads” in week one.",
        "We align with product reality: ship the lander or app shell that can absorb traffic, document FAQ blocks for extraction, then recommend spend tests with explicit success metrics. Compare /portfolio/cascade-markets/ for a Web3 landing built to absorb paid tests without melting mobile performance.",
      ],
    },
    {
      heading: "Measuring compounding not vanity",
      paragraphs: [
        "Vanity metrics — raw followers, impression charts without conversion — hide a stalled engine. Track loop health: cost per qualified lead, retention signal, and content-assisted pipeline influenced. One dashboard the board trusts beats twelve screenshots from different tools.",
        "Automate reporting last, not first. When internal teams lack bandwidth, scope a milestone for analytics wiring and weekly summaries — not an open-ended retainer without outputs. Apply with your current stack and one primary URL; we quote the smallest loop that proves compounding before phase two expansion.",
      ],
    },
  ],

  "how-to-brief-a-design-agency-without-wasting-time": [
    {
      heading: "References that actually help",
      paragraphs: [
        "Three references beat thirty mood-board pins. Tell us what you respect in each: typography discipline, checkout clarity, wallet UX, or enterprise tone — and what you do not want copied. Established buyers who name competitors and anti-references get sharper first proposals.",
        "Link live URLs, not Dribbble fantasies. If your benchmark is a portfolio piece we shipped, say so — /portfolio/ is public for a reason. mxstermind is selective; a crisp brief is how you earn a 24-hour quote instead of a generic questionnaire loop.",
      ],
    },
    {
      heading: "Budget bands save everyone time",
      paragraphs: [
        "We are not fishing for your maximum budget — bands prevent misfit. Saying “mid five figures with room for mobile” routes differently than “low four figures for a lander refresh.” Wrong-fit honesty is faster than a proposal you will not sign.",
        "If the band fits BrandForge packages, we say so and point to brandforge.gg/packages/. If it fits Founder OS work, you get a scope outline with milestones — design sign-off, staging, production, handoff — tied to verifiable outputs. See /process/ for the full engagement map after intake.",
      ],
    },
    {
      heading: "Technical attachments in message one",
      paragraphs: [
        "Stack requirements, compliance constraints, existing Figma libraries, and API documentation belong in the first message — not after deposit. Surprises discovered in week two become change orders; surprises discovered in message one become accurate quotes.",
        "Internal engineering teams should name their Git host, review process, and deployment owner. Web3 projects should name chain targets and wallet priorities early — /developers/blockchain/ shows how we scope those integrations. Use /apply/ or Discord; same review path, same response-time expectation on business days.",
      ],
    },
    {
      heading: "What happens after you apply",
      paragraphs: [
        "Fit review is not a sales theater call. We read your four fields — outcome, references, deadline, budget band — match against active capacity, and respond with yes, no, or a redirect. No means we may point you to BrandForge or a specialist; yes means a written scope before any deposit.",
        "NDAs before detail are normal for established buyers — say so upfront. Within 24 hours you should know whether mxstermind is the right studio, not whether we “would love to hop on a quick call.” That respect for your time is part of how we work — full ethics at /ethics-standards/.",
      ],
    },
  ],

  "web3-branding-what-crypto-projects-get-wrong": [
    {
      heading: "Typography and motion discipline",
      paragraphs: [
        "Inter on a purple gradient does not read as premium — it reads as template. Web3 brands that survive scrutiny pick one display face, one workhorse sans, and motion that explains state change instead of decorating loading screens. Traders notice when typography matches the seriousness of the product.",
        "Cascade Markets shipped with that restraint: dark UI, legible type scale, CTA hierarchy that survives Discord dark mode screenshots. See /portfolio/cascade-markets/ and service depth at /services/. Founder OS Web3 product plus brand combined stays on mxstermind; simple landers may fit brandforge.gg/packages/.",
      ],
    },
    {
      heading: "Landing speed on mobile data",
      paragraphs: [
        "Your community lives on phones, often on congested networks during volatility. Heavy WebGL heroes and unoptimized video loops kill trust before the wallet button renders. Static-first delivery with minimal JS on first paint is a brand decision — not only an engineering checkbox.",
        "We export performance-conscious builds and host on edge-friendly infra when clients control DNS. Compare LCP on /portfolio/cascade-markets/ before you approve another animated hero. When wallet connect is in scope, mobile performance is part of the same milestone — /developers/blockchain/ documents how we ship both.",
      ],
    },
    {
      heading: "Legal disclaimers without killing CTA",
      paragraphs: [
        "Compliance copy belongs on the page — footers, risk sections, jurisdiction notes — but it should not bury the primary action traders came to take. Structure sections so legal density sits below proof and CTA, with FAQ blocks that answer “is this legit?” in plain language.",
        "Legal review is client responsibility; information architecture is ours. Established crypto teams bring counsel early; we layout disclaimers so counsel edits do not break the grid. Intake through /apply/ with your target regions and existing legal drafts attached.",
      ],
    },
    {
      heading: "Product UI that matches the hype",
      paragraphs: [
        "Discord hype dies when the app feels like a different product than the landing promised. Wallet flows, order tickets, and empty states need the same token system and tone as marketing — or users assume bait-and-switch even when the team is legitimate.",
        "mxstermind scopes product UI and brand together when trading or wallet UX is on the roadmap. See /portfolio/sui-blockchain/ for mobile signing discipline paired with ecosystem alignment. Send your demo deadline and current Figma or repo access; we quote migration or greenfield paths honestly.",
      ],
    },
  ],

  "how-we-built-cascade-markets-case-study": [
    {
      heading: "Structuring for trader questions",
      paragraphs: [
        "Prediction market buyers arrive with skepticism and specific questions: liquidity, resolution rules, fees, support path. We ordered sections so each question has a self-contained answer assistants and humans can skim — not a single manifesto paragraph that hides the fee table.",
        "That structure is GEO-aware by design, not SEO spam. FAQ-ready blocks link to proof and external policies without forcing a Discord join first. When your niche differs, we adapt the question set — we do not clone Cascade. Send niche and deadline via /apply/ for a scoped quote.",
      ],
    },
    {
      heading: "Static delivery and LCP wins",
      paragraphs: [
        "We chose Next.js static export on Cloudflare-class hosting so first paint stays fast under paid traffic spikes. Minimal client JS on the hero meant traders on mobile data saw the CTA before animations finished loading — a conversion detail generic Web3 templates ignore.",
        "Performance is part of credibility in trading verticals. See live cascade.markets and the portfolio write-up at /portfolio/cascade-markets/. Similar product depth appears in /portfolio/drain-cx/ for non-crypto contexts — same studio standards, different buyer questions.",
      ],
    },
    {
      heading: "Handoff for paid traffic tests",
      paragraphs: [
        "Launch is not the finish line when the client plans paid acquisition. We delivered analytics hooks, UTM-friendly routes, and a staging checklist so marketing could test creatives without breaking production. Handoff docs named who owns DNS, deploy keys, and content updates.",
        "Established growth teams should demand that package in scope — not hourly “support” after go-live. /process/ shows how mxstermind writes milestones through production and handoff. Phase two expansions — logged-in product, wallet, admin — route through the same intake with new outcome lines.",
      ],
    },
    {
      heading: "What we would scope differently today",
      paragraphs: [
        "Every shipped build teaches the next quote. For Cascade, we would still prioritize one URL and FAQ depth before feature sprawl — but we would name analytics events even earlier if the client’s milestone included paid tests on day one.",
        "That honesty is how buyers should read case studies: patterns to adapt, not a checklist to copy. Compare your brief against /services/ and /portfolio/; if trading UI or wallet scope enters the picture, see /developers/blockchain/. Package landers without product depth may still fit brandforge.gg/packages/.",
      ],
    },
  ],

  "real-cost-of-a-bad-brand-and-how-to-fix-it": [
    {
      heading: "Sales deck drift costs deals",
      paragraphs: [
        "Enterprise buyers compare your website, deck, and demo environment in one afternoon. When typography, product name, and colour drift between slides, procurement slows — not because the product is weak, but because inconsistency signals operational risk. That tax shows up as longer cycles, not fewer features.",
        "Fixing the flagship touchpoint first — usually site or app shell — gives sales a single source of truth. mxstermind scopes brand systems tied to deployed URLs, not PDF-only guidelines sitting in a drive. See /for/established-businesses/ for how we frame engagements with internal marketing teams.",
      ],
    },
    {
      heading: "Hiring and employer brand tax",
      paragraphs: [
        "Candidates check the site before they finish the application. A dated brand suggests a dated product culture — even when engineering is strong. Recruiting spend rises when every sourcer has to explain “we are bigger than the website looks.”",
        "Employer brand is part of the same token system: careers page, social avatars, and interview decks should match the product surface. Established HR and marketing leads should brief together — outcome, references, deadline, budget band — via /apply/ so scope covers both external and hiring touchpoints when needed.",
      ],
    },
    {
      heading: "Audit before you rebrand",
      paragraphs: [
        "Not every ugly site needs a full rebrand. Sometimes positioning still holds and only the flagship touchpoint aged out. Audit positioning, ICP, and competitive set before you burn budget on a new name. Refresh when the story is right; rebrand when the ICP shifted.",
        "We start many engagements with a short audit milestone — what to keep, what to kill, what ships first — documented before visual exploration. Compare proof on /portfolio/drain-cx/ and identity-plus-product combined work across /portfolio/. Package identity tiers on BrandForge when scope is bounded; mxstermind when product UI must move with the brand.",
      ],
    },
    {
      heading: "Phase rollout without chaos",
      paragraphs: [
        "Rolling out a new system everywhere on day one breaks support macros, ad creatives, and partner co-marketing. Sequence matters: positioning line, tokens, flagship URL, then sales and success templates, then long-tail surfaces. Each phase should have a verifiable done state.",
        "Outcome-based milestones make that rollout finance-friendly — staging sign-off before production, handoff doc before final payment. Read /process/ and /ethics-standards/ before intake so procurement knows how we structure payments. Message Discord with your current asset inventory for a realistic phase map.",
      ],
    },
  ],

  "what-outcome-based-agency-work-means-in-practice": [
    {
      heading: "Milestone language that holds up",
      paragraphs: [
        "Vague milestones invite disputes. We write acceptance criteria a third party could verify: staging URL live on client DNS, merged PR with passing checks, app build uploaded to TestFlight — not “design feels done.” Established finance teams can map those outputs to payment schedules without reinterpretation.",
        "Every milestone links to artifacts named in the scope doc before deposit. See /process/ for the full flow from fit review to handoff. Ethics on payment release and cure periods live at /ethics-standards/ — the same rules apply whether you found us through mxstermind.com or escalated from BrandForge work.",
      ],
    },
    {
      heading: "Change orders without relationship damage",
      paragraphs: [
        "Scope change is normal; surprise billing is not. When new requirements appear, we pause, document the delta, price it, and get written approval before work continues. That discipline protects both sides — clients keep predictability; the studio keeps quality without unpaid heroics.",
        "Hourly open tabs hide the same conversations behind opaque timesheets. Outcome-based work makes change orders explicit. If your internal team frequently pivots, say so in intake — we structure milestones small enough to absorb learning without rewriting the entire contract every sprint.",
      ],
    },
    {
      heading: "Verification before payment release",
      paragraphs: [
        "Payments tie to demonstrated outputs, not calendar dates alone. Client review windows are defined — feedback consolidated, not endless drive-by comments — and release happens when criteria are met or a documented cure plan is agreed. Escrow is supported when required.",
        "That model aligns incentives: we finish milestones; you verify against the scope doc. Established buyers should read the financial section on /ethics-standards/ before MSA review so legal language matches how we actually operate. Questions before deposit are expected, not friction.",
      ],
    },
    {
      heading: "When hourly still makes sense",
      paragraphs: [
        "Outcome-based scope is our default for Founder OS builds — but advisory audits, emergency hotfixes on foreign codebases, or short research spikes sometimes fit hourly or day-rate blocks with a capped ceiling. We name that explicitly instead of pretending a SKU fits.",
        "If you are unsure which model fits, send outcome and constraints to /apply/. We will recommend milestones, a capped advisory block, or a BrandForge package redirect when the work is bounded. The goal is fit, not maximizing contract size — selective intake protects delivery quality for every active client.",
      ],
    },
  ],

  "how-much-should-a-website-cost-honest-answer": [
    {
      heading: "What moves price on Founder OS builds",
      paragraphs: [
        "Auth, role-based admin, third-party APIs, CMS complexity, motion budget, and post-launch ownership each move price independently. A marketing site with five templated pages is not comparable to a logged-in product shell with webhooks — yet both get called “a website” in budget meetings.",
        "mxstermind quotes after reviewing your four brief fields and existing assets. Browse /portfolio/ for builds rhyming with your scope — trading desks, verification flows, mobile-adjacent web — before you anchor on a number from a forum thread. /developers/ lists technical lanes that affect estimate ranges.",
      ],
    },
    {
      heading: "Maintenance and hosting reality",
      paragraphs: [
        "Launch price excludes ongoing costs unless scope says otherwise: domains, edge hosting, email, analytics, CMS seats, and third-party SaaS. We list those in the handoff doc so finance is not surprised month two. Clients who own infra should name their host and deploy process in message one.",
        "Retainer without defined outputs is another hidden cost — ask what a month buys in verifiable work. BrandForge packages include bounded maintenance tiers; Founder OS clients often prefer milestone blocks for updates. Either way, ownership should be explicit before production — see /process/ for handoff standards.",
      ],
    },
    {
      heading: "Package floor vs Studio ceiling",
      paragraphs: [
        "BrandForge.gg/packages/ publishes USD floors for operator landers, identity, and growth tiers — quote in 24 hours, defined deliverables, escrow-friendly. That is the professional choice when scope fits the list and you want speed over custom architecture.",
        "mxstermind Founder OS work spans mid four figures through six figures depending on integrations and surfaces. The ceiling is not arbitrary — it reflects coordinated product, brand, and engineering delivery. Starting on packages and escalating for phase two is common; starting Founder OS for a five-page lander usually is not.",
      ],
    },
    {
      heading: "Scoping phase one to prove ROI",
      paragraphs: [
        "The cheapest website that proves conversion beats the perfect website that ships too late. Phase one should answer one business question — can we capture qualified intent on our domain — with room to expand in phase two with the same studio if fit is good.",
        "Compare phase one scope to /portfolio/cascade-markets/ or /portfolio/drain-cx/ depending on your vertical. Apply with budget band and deadline; we will recommend the smallest outcome that matches your proof requirement — or redirect to brandforge.gg/packages/ when that is the honest answer.",
      ],
    },
  ],

  "ethics-standards-how-we-work": [
    {
      heading: "Selective intake protects quality",
      paragraphs: [
        "We cap concurrent Founder OS clients so named contributors are not spread across twelve half-started builds. Saying no to wrong-fit work is part of delivery ethics — not gatekeeping. Established buyers should prefer an OS that declines wrong-fit work over one that deposits and deprioritizes.",
        "Fit review happens before scope and before deposit. If your timeline, budget band, or outcome mismatches capacity, we redirect — often to brandforge.gg/packages/ for bounded web or identity work. Intake at /apply/ and Discord share the same review path; transparency beats a forced yes.",
      ],
    },
    {
      heading: "Privacy and data handling",
      paragraphs: [
        "Client repos, analytics credentials, and user data seen during builds are handled least-privilege: named contributors, no public paste bins, access revoked at handoff unless a retainer explicitly extends it. NDAs are standard when required — request them in message one so legal runs parallel to scoping.",
        "We do not sell client lists or reuse proprietary assets in other engagements. Portfolio pages use approved public screenshots and URLs. Full privacy expectations sit alongside financial rules on /ethics-standards/ — the page procurement should read before MSA markup.",
      ],
    },
    {
      heading: "Financial rules in plain language",
      paragraphs: [
        "Milestone payments, review windows, cure periods, and refund conditions are written in the scope doc — not implied in chat. Escrow is supported when clients require it. We do not start work on ambiguous verbal agreements; established finance teams appreciate that clarity.",
        "When we miss an agreed milestone and cannot cure within the documented window, financial remedies apply as published — not case-by-case negotiation after the fact. Read the financial section on /ethics-standards/ before deposit so signatures match operational reality. Questions are welcome; surprises are not.",
      ],
    },
    {
      heading: "Quality bar before production",
      paragraphs: [
        "Staging exists for a reason: performance, accessibility baseline, copy accuracy, and analytics verification before DNS cutover. Skipping staging to hit a ceremonial launch date is a client choice we document — not our default recommendation. Production means production-ready, not “we will fix it live.”",
        "Handoff includes runbooks, known gaps, and owner assignments — see /process/ for the full sequence. Same ethics apply across mxstermind Founder OS and BrandForge packages; only intake and scope format differ. Contact Discord or Telegram linked from /apply/ for diligence questions before you sign.",
      ],
    },
  ],
};
