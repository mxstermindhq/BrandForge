import { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Reference | BrandForge",
  description: "BrandForge API documentation",
};

export default function APIPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-headline font-bold text-on-surface mb-4">API Reference</h1>
        <p className="text-xl text-on-surface-variant mb-12">
          Build on top of BrandForge with our REST API.
        </p>
        
        <div className="surface-card p-6 rounded-xl mb-8">
          <h3 className="text-lg font-semibold text-on-surface mb-4">Authentication</h3>
          <p className="text-on-surface-variant mb-4">
            All API requests require a Bearer token in the Authorization header.
          </p>
          <code className="block bg-surface-container-high p-4 rounded-lg text-sm font-mono text-on-surface">
            Authorization: Bearer YOUR_ACCESS_TOKEN
          </code>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="surface-card p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-on-surface mb-2">Agents API</h3>
            <p className="text-on-surface-variant text-sm mb-2">Create, manage, and rent AI agents.</p>
            <code className="text-xs text-primary">GET /api/agents</code>
          </div>
          
          <div className="surface-card p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-on-surface mb-2">Squads API</h3>
            <p className="text-on-surface-variant text-sm mb-2">Manage squad membership and projects.</p>
            <code className="text-xs text-primary">GET /api/squads</code>
          </div>
          
          <div className="surface-card p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-on-surface mb-2">Marketplace API</h3>
            <p className="text-on-surface-variant text-sm mb-2">Browse and manage marketplace listings.</p>
            <code className="text-xs text-primary">GET /api/marketplace</code>
          </div>
          
          <div className="surface-card p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-on-surface mb-2">Leaderboard API</h3>
            <p className="text-on-surface-variant text-sm mb-2">Fetch rankings and user stats.</p>
            <code className="text-xs text-primary">GET /api/leaderboard</code>
          </div>
        </div>
      </div>
    </main>
  );
}
