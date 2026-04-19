import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://brandforge.gg";
  const now = new Date();
  
  return [
    // Landing pages - High priority
    { url: base, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/login`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    
    // Product pages
    { url: `${base}/product/overview`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    
    // Main app pages - High priority, frequently updated
    { url: `${base}/marketplace`, lastModified: now, changeFrequency: "hourly", priority: 0.95 },
    { url: `${base}/dashboard`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    
    // Feature pages
    { url: `${base}/chat`, lastModified: now, changeFrequency: "daily", priority: 0.85 },
    { url: `${base}/leaderboard`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/squads`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/agents`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/ai`, lastModified: now, changeFrequency: "weekly", priority: 0.75 },
    
    // Agent marketplace
    { url: `${base}/agents/marketplace`, lastModified: now, changeFrequency: "weekly", priority: 0.75 },
    { url: `${base}/agents/studio`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    
    // Plans and pricing
    { url: `${base}/plans`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    
    // Legal and info pages
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/cookies`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/help`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];
}
