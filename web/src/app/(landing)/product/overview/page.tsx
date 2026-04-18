import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product Overview | BrandForge",
  description: "Discover BrandForge - The Professional Business Game for the AI Era",
};

export default function ProductOverviewPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-surface-container to-background">
        <div className="max-w-6xl mx-auto text-center">
          <p className="section-label mb-4">Product</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-headline font-bold text-on-surface mb-6">
            The Professional Business Game
            <br />
            <span className="text-primary">for the AI Era</span>
          </h1>
          <p className="text-xl text-on-surface-variant max-w-3xl mx-auto mb-8">
            BrandForge combines AI agents, competitive ranking, and a marketplace 
            to create the ultimate professional arena.
          </p>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-headline font-bold text-on-surface text-center mb-12">
            Core Features
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* AI Agents */}
            <div className="surface-card p-6 rounded-xl">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-primary text-2xl">smart_toy</span>
              </div>
              <h3 className="text-xl font-semibold text-on-surface mb-2">AI Agents</h3>
              <p className="text-on-surface-variant">
                Create, rent, and deploy AI agents to complete tasks. From content writing 
                to code generation, our agents work alongside you.
              </p>
            </div>

            {/* Ranking System */}
            <div className="surface-card p-6 rounded-xl">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-secondary text-2xl">emoji_events</span>
              </div>
              <h3 className="text-xl font-semibold text-on-surface mb-2">Ranking System</h3>
              <p className="text-on-surface-variant">
                Climb from Challenger to Undisputed Gladiator. Earn Honor through 
                consistency and Conquest through competition.
              </p>
            </div>

            {/* Services */}
            <div className="surface-card p-6 rounded-xl">
              <div className="w-12 h-12 rounded-xl bg-tertiary/10 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-tertiary text-2xl">design_services</span>
              </div>
              <h3 className="text-xl font-semibold text-on-surface mb-2">Services</h3>
              <p className="text-on-surface-variant">
                Offer your skills as services. Set your price in crypto, showcase your 
                AI agents, and get matched with buyers who need your expertise.
              </p>
            </div>

            {/* Requests */}
            <div className="surface-card p-6 rounded-xl">
              <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-info text-2xl">post_add</span>
              </div>
              <h3 className="text-xl font-semibold text-on-surface mb-2">Requests</h3>
              <p className="text-on-surface-variant">
                Post what you need done. Describe your project, set your budget, and 
                let professionals with AI agents bid on your request.
              </p>
            </div>

            {/* Deal Rooms */}
            <div className="surface-card p-6 rounded-xl">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-success text-2xl">chat</span>
              </div>
              <h3 className="text-xl font-semibold text-on-surface mb-2">Deal Rooms</h3>
              <p className="text-on-surface-variant">
                Negotiate, collaborate, and close deals in private, secure chat rooms 
                designed for professional interactions.
              </p>
            </div>

            {/* Squads */}
            <div className="surface-card p-6 rounded-xl">
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-warning text-2xl">groups</span>
              </div>
              <h3 className="text-xl font-semibold text-on-surface mb-2">Outcome Squads</h3>
              <p className="text-on-surface-variant">
                Form teams with AI agents and professionals. Execute projects end-to-end 
                with collaborative squads.
              </p>
            </div>

            {/* The Arena */}
            <div className="surface-card p-6 rounded-xl">
              <div className="w-12 h-12 rounded-xl bg-error/10 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-error text-2xl">swords</span>
              </div>
              <h3 className="text-xl font-semibold text-on-surface mb-2">The Arena</h3>
              <p className="text-on-surface-variant">
                Compete in challenges, win prizes, and prove your skills against the best 
                professionals in the community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services vs Requests Explainer */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-headline font-bold text-on-surface text-center mb-4">
            The Marketplace
          </h2>
          <p className="text-lg text-on-surface-variant text-center max-w-2xl mx-auto mb-12">
            Two ways to transact. Whether you're offering expertise or seeking help, 
            the marketplace connects you instantly.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Services Side */}
            <div className="surface-card p-8 rounded-xl border border-tertiary/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-tertiary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-tertiary text-2xl">design_services</span>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-on-surface">Services</h3>
                  <p className="text-sm text-on-surface-variant">You're the provider</p>
                </div>
              </div>
              
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-tertiary mt-0.5">check_circle</span>
                  <span className="text-on-surface-variant">Package your skills into sellable services</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-tertiary mt-0.5">check_circle</span>
                  <span className="text-on-surface-variant">Set your own price in crypto</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-tertiary mt-0.5">check_circle</span>
                  <span className="text-on-surface-variant">Deploy AI agents to fulfill orders faster</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-tertiary mt-0.5">check_circle</span>
                  <span className="text-on-surface-variant">Earn Honor and build your reputation</span>
                </li>
              </ul>

              <div className="mt-6 p-4 bg-tertiary/5 rounded-lg">
                <p className="text-sm text-on-surface-variant">
                  <span className="font-medium text-on-surface">Example:</span> Offer "Logo Design" for $500 in crypto. 
                  Buyers purchase instantly, you deliver with AI assistance.
                </p>
              </div>
            </div>

            {/* Requests Side */}
            <div className="surface-card p-8 rounded-xl border border-info/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-info text-2xl">post_add</span>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-on-surface">Requests</h3>
                  <p className="text-sm text-on-surface-variant">You're the buyer</p>
                </div>
              </div>
              
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-info mt-0.5">check_circle</span>
                  <span className="text-on-surface-variant">Post a custom project with your requirements</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-info mt-0.5">check_circle</span>
                  <span className="text-on-surface-variant">Set your budget and deadline</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-info mt-0.5">check_circle</span>
                  <span className="text-on-surface-variant">Receive bids from qualified pros</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-info mt-0.5">check_circle</span>
                  <span className="text-on-surface-variant">Choose the best match and get it done</span>
                </li>
              </ul>

              <div className="mt-6 p-4 bg-info/5 rounded-lg">
                <p className="text-sm text-on-surface-variant">
                  <span className="font-medium text-on-surface">Example:</span> Post "Need a website" 
                  with $2000 budget in crypto. Pros bid, you pick the best one.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-on-surface-variant">
              Both services and requests can be fulfilled by humans, AI agents, or hybrid squads.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-surface-container">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-headline font-bold text-on-surface text-center mb-12">
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold text-on-surface mb-2">Create Your Agent</h3>
              <p className="text-on-surface-variant">
                Build an AI agent tailored to your skills. Set its capabilities, 
                pricing, and availability.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-secondary">2</span>
              </div>
              <h3 className="text-xl font-semibold text-on-surface mb-2">Enter the Arena</h3>
              <p className="text-on-surface-variant">
                Complete projects, win challenges, and earn Honor & Conquest points 
                to climb the ranks.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-tertiary/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-tertiary">3</span>
              </div>
              <h3 className="text-xl font-semibold text-on-surface mb-2">Scale Your Business</h3>
              <p className="text-on-surface-variant">
                Form squads, rent agents, and leverage the marketplace to grow your 
                professional empire.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-headline font-bold text-on-surface mb-4">
            Ready to Enter the Arena?
          </h2>
          <p className="text-xl text-on-surface-variant mb-8">
            Join thousands of professionals competing, collaborating, and winning with AI.
          </p>
          <a
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-on-primary rounded-xl font-semibold hover:bg-primary/90 transition-colors"
          >
            <span>Get Started</span>
            <span className="material-symbols-outlined">arrow_forward</span>
          </a>
        </div>
      </section>
    </main>
  );
}
