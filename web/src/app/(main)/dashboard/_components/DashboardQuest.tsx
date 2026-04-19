"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { useAuthMe } from "@/hooks/useAuthMe";
import { Route, CheckCircle, Circle, Zap, Trophy, ChevronDown, ChevronUp, MessageSquare, User, Store, Gavel, Handshake, FileCheck, Star } from "lucide-react";

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

const iconMap: Record<string, React.ElementType> = {
  person: User,
  add_business: Store,
  post_add: FileCheck,
  gavel: Gavel,
  chat: MessageSquare,
  handshake: Handshake,
  check_circle: CheckCircle,
  stars: Star,
};

const QUESTS: Quest[] = [
  { id: "complete_profile", title: "Complete Your Profile", description: "Add your username, bio, and avatar", icon: "person", honor: 50, conquest: 10, href: "/settings", steps: ["Go to Settings by clicking your profile", "Add a unique username (required)", "Write a short bio about yourself", "Upload a profile picture", "Click Save Changes"] },
  { id: "first_service", title: "List Your First Service", description: "Create a service offering", icon: "add_business", honor: 100, conquest: 25, href: "/services/new", steps: ["Navigate to Marketplace → List Service", "Choose a category for your service", "Write a compelling title and description", "Set your pricing (fixed or hourly)", "Add portfolio images or examples", "Publish your service"] },
  { id: "first_request", title: "Post a Request", description: "Create your first project brief", icon: "post_add", honor: 100, conquest: 25, href: "/requests/new", steps: ["Go to Marketplace → Post Request", "Select the appropriate category", "Describe what you need in detail", "Set your budget range", "Specify deadline and requirements", "Publish to receive bids"] },
  { id: "place_bid", title: "Place Your First Bid", description: "Submit a proposal on a request", icon: "gavel", honor: 75, conquest: 20, href: "/marketplace", steps: ["Browse open requests in Marketplace", "Find a project matching your skills", "Click 'Place Bid' button", "Write a custom proposal", "Set your bid amount", "Submit and wait for response"] },
  { id: "start_chat", title: "Start a Conversation", description: "Open a deal room with someone", icon: "chat", honor: 50, conquest: 15, href: "/chat", steps: ["Visit someone's profile or service", "Click the 'Message' button", "Or find a user in Chat → New Conversation", "Introduce yourself professionally", "Discuss project details", "Keep communication within BrandForge"] },
  { id: "win_deal", title: "Close Your First Deal", description: "Get a project accepted or accept a bid", icon: "handshake", honor: 200, conquest: 100, href: "/marketplace", steps: ["For clients: Accept a freelancer's bid", "For freelancers: Get your bid accepted", "Review the deal terms carefully", "Confirm and sign the digital contract", "Deposit funds into escrow (for clients)", "Deal is now active - start working!"] },
  { id: "complete_project", title: "Complete a Project", description: "Deliver and get reviewed", icon: "check_circle", honor: 300, conquest: 150, href: "/dashboard", steps: ["Work on the project per agreed milestones", "Submit deliverables through the deal room", "Request milestone approval from client", "For clients: Review and approve work", "Release payment from escrow", "Leave a review for your partner"] },
  { id: "earn_honor", title: "Earn 500 Honor", description: "Accumulate honor from activities", icon: "stars", honor: 0, conquest: 50, href: "/leaderboard", steps: ["Complete profile (+50 Honor)", "List services (+100 Honor each)", "Post requests (+100 Honor each)", "Win deals (+200 Honor each)", "Complete projects (+300 Honor each)", "Check Leaderboard to see your rank"] },
];

export function DashboardQuest() {
  const { session } = useAuth();
  const { me } = useAuthMe();
  const [completedQuests, setCompletedQuests] = useState<Set<string>>(new Set());
  const [totalHonor, setTotalHonor] = useState(0);
  const [totalConquest, setTotalConquest] = useState(0);
  const [expandedQuest, setExpandedQuest] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

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

  // Get incomplete quests first, then completed
  const sortedQuests = [...QUESTS].sort((a, b) => {
    const aCompleted = completedQuests.has(a.id);
    const bCompleted = completedQuests.has(b.id);
    return aCompleted === bCompleted ? 0 : aCompleted ? 1 : -1;
  });

  // Show only first 2 when collapsed
  const visibleQuests = isCollapsed ? sortedQuests.slice(0, 2) : sortedQuests;

  // Get first incomplete quest for display
  const firstIncomplete = sortedQuests.find(q => !completedQuests.has(q.id));
  const incompleteCount = QUESTS.length - completedCount;

  return (
    <div className="relative flex justify-end">
      {/* Single Line Header - Ultra Compact */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center gap-2 px-3 py-2 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:bg-zinc-800/50 transition group max-w-md"
      >
        <Route size={14} className="text-amber-400 shrink-0"/>
        
        <span className="text-sm font-medium text-white truncate">
          Your Journey
        </span>
        
        {/* Progress */}
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden max-w-[100px]">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-purple-500 rounded-full transition-all" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-zinc-500 shrink-0">{completedCount}/{QUESTS.length}</span>
        </div>
        
        {/* Next Quest or Complete - hidden on smaller screens */}
        {completedCount === QUESTS.length ? (
          <span className="text-xs text-emerald-400 shrink-0 hidden md:block">Complete!</span>
        ) : firstIncomplete ? (
          <span className="text-xs text-zinc-400 truncate max-w-[120px] hidden lg:block">
            {firstIncomplete.title}
          </span>
        ) : null}
        
        {/* Toggle */}
        <ChevronDown 
          size={16} 
          className={`text-zinc-500 shrink-0 transition-transform ${!isCollapsed ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Quest List */}
      {!isCollapsed && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-50 max-h-[300px] overflow-y-auto">
          {/* Header in dropdown */}
          <div className="px-3 py-2 border-b border-zinc-800 flex items-center justify-between">
            <span className="text-xs text-zinc-500">{incompleteCount} remaining</span>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span className="flex items-center gap-1"><Zap size={10} className="text-amber-400"/> {totalHonor}</span>
              <span className="flex items-center gap-1"><Trophy size={10} className="text-emerald-400"/> {totalConquest}</span>
            </div>
          </div>
          
          {/* Quests */}
          <div className="p-1 space-y-0.5">
            {sortedQuests.map((quest) => {
              const isCompleted = completedQuests.has(quest.id);
              const QuestIcon = iconMap[quest.icon] || Circle;
              
              return (
                <Link
                  key={quest.id}
                  href={quest.href}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded hover:bg-zinc-800 transition ${
                    isCompleted ? "opacity-50" : ""
                  }`}
                >
                  <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${
                    isCompleted ? "bg-emerald-500/20" : "bg-amber-500/10"
                  }`}>
                    {isCompleted ? (
                      <CheckCircle size={12} className="text-emerald-400"/>
                    ) : (
                      <QuestIcon size={12} className="text-amber-400"/>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs truncate ${isCompleted ? "line-through text-zinc-500" : "text-white"}`}>
                      {quest.title}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1 text-[10px] shrink-0">
                    <span className="text-amber-400">+{quest.honor}</span>
                    {!isCompleted && (
                      <span className="text-emerald-400">+{quest.conquest}</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
          
          {/* All complete message */}
          {completedCount === QUESTS.length && (
            <div className="px-3 py-2 border-t border-zinc-800 text-center">
              <p className="text-xs text-emerald-400">All quests completed! 🎉</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
