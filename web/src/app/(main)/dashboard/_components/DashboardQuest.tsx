"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { useAuthMe } from "@/hooks/useAuthMe";

interface Quest {
  id: string;
  title: string;
  description: string;
  icon: string;
  honor: number;
  conquest: number;
  href: string;
  steps: string[];
}

const QUESTS: Quest[] = [
  {
    id: "complete_profile",
    title: "Complete Your Profile",
    description: "Add your username, bio, and avatar",
    icon: "person",
    honor: 50,
    conquest: 10,
    href: "/settings",
    steps: [
      "Go to Settings by clicking your profile",
      "Add a unique username (required)",
      "Write a short bio about yourself",
      "Upload a profile picture",
      "Click Save Changes"
    ]
  },
  {
    id: "first_service",
    title: "List Your First Service",
    description: "Create a service offering",
    icon: "add_business",
    honor: 100,
    conquest: 25,
    href: "/services/new",
    steps: [
      "Navigate to Marketplace → List Service",
      "Choose a category for your service",
      "Write a compelling title and description",
      "Set your pricing (fixed or hourly)",
      "Add portfolio images or examples",
      "Publish your service"
    ]
  },
  {
    id: "first_request",
    title: "Post a Request",
    description: "Create your first project brief",
    icon: "post_add",
    honor: 100,
    conquest: 25,
    href: "/requests/new",
    steps: [
      "Go to Marketplace → Post Request",
      "Select the appropriate category",
      "Describe what you need in detail",
      "Set your budget range",
      "Specify deadline and requirements",
      "Publish to receive bids"
    ]
  },
  {
    id: "place_bid",
    title: "Place Your First Bid",
    description: "Submit a proposal on a request",
    icon: "gavel",
    honor: 75,
    conquest: 20,
    href: "/marketplace",
    steps: [
      "Browse open requests in Marketplace",
      "Find a project matching your skills",
      "Click 'Place Bid' button",
      "Write a custom proposal",
      "Set your bid amount",
      "Submit and wait for response"
    ]
  },
  {
    id: "start_chat",
    title: "Start a Conversation",
    description: "Open a deal room with someone",
    icon: "chat",
    honor: 50,
    conquest: 15,
    href: "/chat",
    steps: [
      "Visit someone's profile or service",
      "Click the 'Message' button",
      "Or find a user in Chat → New Conversation",
      "Introduce yourself professionally",
      "Discuss project details",
      "Keep communication within BrandForge"
    ]
  },
  {
    id: "win_deal",
    title: "Close Your First Deal",
    description: "Get a project accepted or accept a bid",
    icon: "handshake",
    honor: 200,
    conquest: 100,
    href: "/marketplace",
    steps: [
      "For clients: Accept a freelancer's bid",
      "For freelancers: Get your bid accepted",
      "Review the deal terms carefully",
      "Confirm and sign the digital contract",
      "Deposit funds into escrow (for clients)",
      "Deal is now active - start working!"
    ]
  },
  {
    id: "complete_project",
    title: "Complete a Project",
    description: "Deliver and get reviewed",
    icon: "check_circle",
    honor: 300,
    conquest: 150,
    href: "/dashboard",
    steps: [
      "Work on the project per agreed milestones",
      "Submit deliverables through the deal room",
      "Request milestone approval from client",
      "For clients: Review and approve work",
      "Release payment from escrow",
      "Leave a review for your partner"
    ]
  },
  {
    id: "earn_honor",
    title: "Earn 500 Honor",
    description: "Accumulate honor from activities",
    icon: "stars",
    honor: 0,
    conquest: 50,
    href: "/leaderboard",
    steps: [
      "Complete profile (+50 Honor)",
      "List services (+100 Honor each)",
      "Post requests (+100 Honor each)",
      "Win deals (+200 Honor each)",
      "Complete projects (+300 Honor each)",
      "Check Leaderboard to see your rank"
    ]
  },
];

export function DashboardQuest() {
  const { session } = useAuth();
  const { me } = useAuthMe();
  const [completedQuests, setCompletedQuests] = useState<Set<string>>(new Set());
  const [totalHonor, setTotalHonor] = useState(0);
  const [totalConquest, setTotalConquest] = useState(0);
  const [expandedQuest, setExpandedQuest] = useState<string | null>(null);

  // Load completed quests from localStorage
  useEffect(() => {
    if (!session?.user?.id) return;
    const saved = localStorage.getItem(`quests_${session.user.id}`);
    if (saved) {
      const completed = new Set<string>(JSON.parse(saved));
      setCompletedQuests(completed);
      
      // Calculate totals
      let honor = 0;
      let conquest = 0;
      QUESTS.forEach(quest => {
        if (completed.has(quest.id)) {
          honor += quest.honor;
          conquest += quest.conquest;
        }
      });
      setTotalHonor(honor);
      setTotalConquest(conquest);
    }
  }, [session?.user?.id]);

  // Check for automatically completable quests based on real data
  useEffect(() => {
    if (!session?.user?.id || !me) return;
    
    const newCompleted = new Set(completedQuests);
    let updated = false;

    // Check profile completion (bio field may not exist, check username and avatar)
    if (me.profile?.username && me.profile?.avatar_url && !completedQuests.has("complete_profile")) {
      newCompleted.add("complete_profile");
      updated = true;
    }

    // Check honor earned - TODO: needs separate API call to /api/currency/balance
    // For now, this quest auto-completes based on localStorage tracking

    if (updated) {
      setCompletedQuests(newCompleted);
      localStorage.setItem(`quests_${session.user.id}`, JSON.stringify([...newCompleted]));
      
      // Recalculate totals
      let honor = 0;
      let conquest = 0;
      QUESTS.forEach(quest => {
        if (newCompleted.has(quest.id)) {
          honor += quest.honor;
          conquest += quest.conquest;
        }
      });
      setTotalHonor(honor);
      setTotalConquest(conquest);
    }
  }, [me, session?.user?.id, completedQuests]);

  const completedCount = completedQuests.size;
  const progress = Math.round((completedCount / QUESTS.length) * 100);

  return (
    <div className="bg-surface-container-low border border-outline-variant rounded-xl p-6 mb-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-primary">route</span>
            <h2 className="text-xl font-headline font-bold text-on-surface">Your Journey</h2>
          </div>
          <p className="text-sm text-on-surface-variant">
            Complete 8 steps to master BrandForge
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-on-surface">{completedCount}/8</div>
          <div className="text-xs text-on-surface-variant">Completed</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-on-surface-variant">
          <span>{progress}% complete</span>
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="text-amber-400">⚡</span> {totalHonor} Honor
            </span>
            <span className="flex items-center gap-1">
              <span className="text-emerald-400">🏆</span> {totalConquest} Conquest
            </span>
          </span>
        </div>
      </div>

      {/* Quest Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {QUESTS.map((quest) => {
          const isCompleted = completedQuests.has(quest.id);
          const isExpanded = expandedQuest === quest.id;
          
          return (
            <div
              key={quest.id}
              className={`relative rounded-xl border transition-all overflow-hidden ${
                isCompleted
                  ? "bg-surface-container-high/50 border-outline-variant/50"
                  : "bg-surface-container border-outline-variant"
              }`}
            >
              {/* Main Card Content */}
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isCompleted ? "bg-success/20" : "bg-primary/10"
                  }`}>
                    <span
                      className={`material-symbols-outlined ${
                        isCompleted ? "text-success" : "text-primary"
                      }`}
                    >
                      {isCompleted ? "check_circle" : quest.icon}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3
                          className={`font-semibold text-sm ${
                            isCompleted ? "text-on-surface-variant line-through" : "text-on-surface"
                          }`}
                        >
                          {quest.title}
                        </h3>
                        <p className="text-xs text-on-surface-variant mt-0.5">{quest.description}</p>
                      </div>
                      
                      {/* Rewards */}
                      <div className="text-right ml-2">
                        <div className="text-xs text-amber-400">+{quest.honor}⚡</div>
                        <div className="text-xs text-emerald-400">+{quest.conquest}🏆</div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 mt-3">
                      <Link
                        href={quest.href}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                          isCompleted
                            ? "bg-surface-container-high text-on-surface-variant cursor-default"
                            : "bg-primary text-on-primary hover:opacity-90"
                        }`}
                        onClick={(e) => isCompleted && e.preventDefault()}
                      >
                        {isCompleted ? "Completed" : "Go to Action"}
                      </Link>
                      
                      {!isCompleted && (
                        <button
                          onClick={() => setExpandedQuest(isExpanded ? null : quest.id)}
                          className="text-xs px-3 py-1.5 rounded-lg border border-outline-variant text-on-surface-variant hover:text-on-surface hover:border-outline transition-colors"
                        >
                          {isExpanded ? "Hide Steps" : "Show Steps"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Expandable Steps */}
              {isExpanded && !isCompleted && (
                <div className="border-t border-outline-variant/50 bg-surface-container-low/50 px-4 py-4">
                  <p className="text-xs font-medium text-on-surface-variant mb-3 uppercase tracking-wide">
                    How to complete:
                  </p>
                  <ol className="space-y-2">
                    {quest.steps.map((step, index) => (
                      <li key={index} className="flex items-start gap-3 text-sm">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <span className="text-on-surface">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              
              {/* Completed Badge */}
              {isCompleted && (
                <div className="absolute top-3 right-3">
                  <span className="material-symbols-outlined text-success text-xl">verified</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Completion Message */}
      {completedCount === QUESTS.length && (
        <div className="mt-6 p-4 bg-success/10 border border-success/30 rounded-lg text-center">
          <span className="material-symbols-outlined text-success text-2xl mb-2">celebration</span>
          <p className="font-medium text-on-surface">Congratulations! You&apos;ve mastered BrandForge!</p>
          <p className="text-sm text-on-surface-variant mt-1">
            Total earned: {totalHonor} Honor, {totalConquest} Conquest
          </p>
        </div>
      )}
    </div>
  );
}
