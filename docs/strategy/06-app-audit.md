# App Audit & Fast Roadmap

**Purpose:** Audit the authenticated BrandForge product experience, identify what is shipping today, and map the fastest route to a polished logged-in workspace.

## 1. App architecture & what users see

### 1.1 Route structure
- `web/src/app/(main)/layout.tsx` wraps the authenticated workspace in `AppShell`.
- The app is delivered through route groups and page modules, not a single dashboard page.
- Key routes:
  - `/feed` — work feed and marketplace activity
  - `/chat` — deal rooms, AI/agent/people chat
  - `/marketplace` — canonical unified services + requests marketplace
  - `/leaderboard` — performance and ranking
  - `/agents` — AI agent marketplace + creation
  - `/welcome` — onboarding / first-time setup
  - `/settings` — account and profile controls

### 1.2 Core UI containers
- `AppShell.tsx` provides the main workspace shell, sidebar, mobile drawer, onboarding redirect, and plans button.
- `Sidebar.tsx` is the navigation anchor for the product; it exposes only Feed, Chat, Marketplace, and Leaderboard.
- `OnboardingRedirect.tsx` forces first-time users to `/welcome` until onboarding completes.
- `ProfileSetupBanner.tsx` and `PlansFloatingButton.tsx` are persistent utility surfaces in the app.

## 2. What is good today

### 2.1 Strong points
- Solid, modern shell layout with responsive drawer and sidebar.
- Canonical unified marketplace experience in `UnifiedMarketplace`.
- Active feed + activity cards for social proof and marketplace visibility.
- Rich AI tooling spread across the app: brief generation, proposal writer, career assistant, deal assistant, smart matching, co-pilot HUD.
- Auth flow is gated cleanly with `AuthWall` for premium AI features.
- Onboarding is explicit and includes username/title setup.
- Good use of `apiGetJson` / `apiMutateJson` abstractions for backend calls.
- Marketplace search filters, query state, and collection segments are well scoped.
- `AGIAgents.tsx` has an operational rental marketplace and agent creation flow.

### 2.2 Particularly strong components
- `UnifiedMarketplace.tsx` — canonical marketplace with browse/smart-match toggle.
- `AIBriefGenerator.tsx` / `AIProposalWriter.tsx` / `AICareerAssistant.tsx` — show clear productized AI tools.
- `AIAssistantPanel.tsx` — contextual deal room assistant with action buttons.
- `SmartMatchEngine.tsx` — AI-powered marketplace matching capability.
- `StudioCopilotHud.tsx` — inline chat assistant for studio workflows.
- `HomeHubClient.tsx` — excellent candidate for a dashboard, with live network stats and quick actions (currently unused).

## 3. What is missing or underused

### 3.1 Navigation gaps
- No true authenticated home/dashboard route inside `(main)`.
- `HomeHubClient` is built but not mounted anywhere.
- AI capabilities are scattered across several pages rather than centralized.
- Sidebar only exposes four routes, while the product surface includes many more important flows.
- `/ai` currently redirects to `/chat`, making the AI route a stub.

### 3.2 Experience gaps
- Users do not land on a coherent “home” after login; they may be routed to `/welcome`, `/chat`, or a stale default.
- AI tools lack a single discovery path or consistent brand across chat, studio, and marketplace.
- The deal room AI assistant exists, but there is no unified “one-click help” surface in every room.
- Marketplace action design is good, but there is no clear first-time buyer path from `/feed` / `/chat` into the marketplace.
- Some AI pages use placeholder preview behavior for guests rather than a polished sign-in experience.

### 3.3 Technical / product risk areas
- `AppShell` is tightly coupled to sidebar-only navigation; adding more product areas could require a second navigation layer.
- `SmartMatchEngine` and AI tools rely on backend AI routes whose health is not surfaced or measured in the app.
- The app has multiple “AI mode” entry points: `/marketplace?view=smart-match`, `/ai/*`, `/studio`, deal room assistant — this creates product discoverability issues.
- The `AIPage` redirect should be replaced with a real AI command center or landing page.
- `HomeHubClient` not consumed is a wasted product asset and indicates the app lacks a strong logged-in landing page.

## 4. AI audit — what is live and how it serves users

### 4.1 AI integration surface
- `/api/ai/chat` — primary low-level chat completion used by:
  - `SimpleChat` chat hub
  - `StudioCopilotHud`
- `/api/ai/generate-brief` — generates structured project briefs.
- `/api/ai/generate-proposal` — generates proposal content.
- `/api/ai/career-advice` — career assistant advice chat.
- `/api/ai/deal-assistant` — deal room assistant for contract generation, analysis, summary.
- `/api/marketplace/smart-match` — AI marketplace matching engine.
- `/api/agent-runs` — runtime agent task execution in studio/agent console.
- `/api/ai-models` and `/api/ai/status` are documented in API reference, but not clearly surfaced in UX.

### 4.2 What AI does well today
- Converts user text/voice into concrete outputs and match results.
- Supports both buyer-facing workflow tools and creator-facing productivity workflows.
- Offers an “assistant” experience within deal rooms and studio workflows.
- Enables agent creation and rental on the same platform.
- Uses public and bearer auth patterns appropriately for data-protected API calls.

### 4.3 What AI could serve better
- There is no unified AI assistant identity or meta-flow across the app.
- AI tool discovery is fragmented across pages and route groups.
- Guest experience is inconsistent: some tools show previews, others ask to sign in with no preview.
- The app does not surface model status, rate limits, or failures proactively.
- Agent run capability exists, but the AI productization path from agent marketplace to agent execution is not visible enough.

## 5. Usage & user actions audit

### 5.1 Primary user actions in the app
- Start a new chat / join a deal room.
- Browse marketplace listings and posted requests.
- Post a new request or list a new service.
- Use AI tools to generate briefs, proposals, or career advice.
- Launch the Smart Match engine from marketplace.
- Create and rent AI agents.
- Interact with leaderboard and status-driven competitive view.
- Finalize onboarding through `/welcome`.

### 5.2 Secondary actions and support
- Manage settings and account details.
- Review inbox / notifications.
- Access documentation, help, and legal pages from app footer or nav.
- Use the AI deal assistant inside a chat context.
- Use studio co-pilot HUD during agent runs.

## 6. Fast app roadmap

### Week 1 — App polish and home entry
- Mount `HomeHubClient` on a real authenticated dashboard route.
- Create `/app` or `/dashboard` as the logged-in landing page.
- Add a direct sidebar item for “Home” or “Dashboard”.
- Replace `/ai` redirect with a real AI hub or command center.
- Ensure `/welcome` completes into the app home cleanly.

### Week 2 — AI discovery and consistency
- Consolidate AI tools behind a visible “AI” nav or hub page.
- Expose model status / health and fallback messaging in AI flows.
- Make Smart Match, brief generation, proposal writer, and career assistant discoverable from the dashboard.
- Add consistent sign-in / preview behavior for guest access.

### Week 3 — Deal room and marketplace orchestration
- Connect chat rooms, offers, and marketplace listings with stronger CTA funnels.
- Surface relevant marketplace opportunities inside the feed and chat hubs.
- Improve the deal room assistant to suggest contract actions and negotiation next steps.
- Add tracked conversion metrics for chat-to-bid, marketplace-to-offer, and AI tool usage.

### Week 4 — Production readiness
- Audit and remove stale redirects and stubbed AI entry points.
- Add monitoring for AI endpoints and marketplace stats.
- Polish onboarding so first-time users enter the same app home consistently.
- Build one “single team workflow” story: brief ? match ? chat ? contract ? delivery.

## 7. Recommended fixes

- Turn `HomeHubClient` into the default authenticated home experience.
- Add navigation to `AGIAgents` and `/studio` from the main sidebar or dashboard.
- Promote `SmartMatchEngine` as a primary marketplace action, not a hidden toggle.
- Build a unified AI assistant label and landing page instead of multiple disconnected AI pages.
- Avoid `redirect` stubs for key public routes like `/ai`.
- Keep `WelcomeClient` onboarding separate, but ensure it routes into a polished home dashboard afterward.

## 8. Summary

The app has a mature product shell and many powerful flows, but it currently feels more like a collection of features than a single logged-in product.
The fastest way to improve is to ship a real authenticated home page, centralize AI discovery, and make the agent/workflow path obvious from the first post-login screen.
