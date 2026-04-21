'use client'

import { useEffect, useState } from 'react'
import { 
  Sparkles, 
  FileText, 
  Send, 
  User, 
  Building2, 
  DollarSign, 
  Target,
  Calendar,
  Copy,
  Download,
  ArrowRight
} from 'lucide-react'

interface Message {
  id: string
  role: 'human' | 'ai'
  content: string
  delay: number
}

const demoMessages: Message[] = [
  {
    id: '1',
    role: 'human',
    content: 'Hey, following up on the Acme Corp proposal. They want to see a revised scope by Friday.',
    delay: 0
  },
  {
    id: '2',
    role: 'ai',
    content: 'Got it. I\'ve reviewed the thread. Key concerns from their last message: timeline, pricing flexibility, and integration support. Want me to draft a revised proposal addressing those three points?',
    delay: 1200
  }
]

const aiActions = [
  'Summarize',
  'Draft Reply',
  'Generate Proposal',
  'Extract Action Items',
  'Find Red Flags',
  'Create Follow-up'
]

export function DealRoomShowcase() {
  const [visibleMessages, setVisibleMessages] = useState<string[]>([])
  const [showArtifact, setShowArtifact] = useState(false)

  useEffect(() => {
    // Stagger message appearance
    demoMessages.forEach((msg) => {
      setTimeout(() => {
        setVisibleMessages(prev => [...prev, msg.id])
      }, msg.delay)
    })

    // Show artifact after AI message
    setTimeout(() => {
      setShowArtifact(true)
    }, 3000)
  }, [])

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Every deal. One thread.
            <span className="text-primary"> AI that ships the work.</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Human expertise. AI execution.
          </p>
        </div>

        {/* Deal Room Demo */}
        <div className="relative mx-auto max-w-5xl">
          {/* Browser Chrome */}
          <div className="bg-slate-900 rounded-t-xl p-3 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <div className="flex-1 mx-4">
              <div className="bg-slate-800 rounded-md px-3 py-1.5 text-sm text-slate-400 flex items-center gap-2">
                <span className="opacity-50">https://</span>
                brandforge.gg/deal/acme-corp
              </div>
            </div>
          </div>

          {/* Deal Room Content */}
          <div className="bg-background border-x border-b border-border rounded-b-xl overflow-hidden shadow-2xl">
            <div className="flex h-[500px]">
              {/* Thread Area */}
              <div className="flex-1 flex flex-col min-w-0">
                {/* AI Action Bar */}
                <div className="border-b border-border/50 bg-muted/30 py-2 px-4">
                  <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                    <div className="flex items-center gap-1.5 mr-2 shrink-0">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="text-xs font-medium text-muted-foreground">AI Actions</span>
                    </div>
                    {aiActions.map((action) => (
                      <button
                        key={action}
                        className="px-3 py-1.5 rounded-full border border-border text-sm font-medium text-foreground hover:border-primary/50 hover:bg-primary/5 transition-colors shrink-0"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {demoMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex transition-all duration-500 ${
                        visibleMessages.includes(message.id) 
                          ? 'opacity-100 translate-y-0' 
                          : 'opacity-0 translate-y-4'
                      } ${message.role === 'human' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-lg px-4 py-3 ${
                          message.role === 'human'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  ))}

                  {/* Artifact Card */}
                  <div
                    className={`flex justify-start transition-all duration-500 ${
                      showArtifact 
                        ? 'opacity-100 translate-y-0' 
                        : 'opacity-0 translate-y-4'
                    }`}
                  >
                    <div className="max-w-[85%] bg-muted rounded-lg px-4 py-3">
                      <p className="text-sm mb-3">
                        I&apos;ve generated a revised proposal for your deal with Acme Corp.
                      </p>
                      <div className="p-3 bg-background/50 rounded-lg border border-border/50">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-4 h-4 text-primary" />
                          <span className="font-medium text-sm">Draft Proposal · Acme Corp</span>
                          <span className="text-xs text-muted-foreground ml-auto">Generated just now</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          Revised scope covering timeline flexibility, tiered pricing options, and dedicated integration support...
                        </p>
                        <div className="flex gap-2">
                          <button className="flex items-center gap-1 text-xs text-primary hover:underline">
                            <Copy className="w-3 h-3" />
                            Copy
                          </button>
                          <button className="flex items-center gap-1 text-xs text-primary hover:underline">
                            <Download className="w-3 h-3" />
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Composer */}
                <div className="border-t border-border p-3">
                  <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm text-muted-foreground flex-1">Type your message...</span>
                    <div className="p-1.5 bg-primary text-primary-foreground rounded">
                      <Send className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Value Rail */}
              <div className="w-64 border-l border-border bg-muted/20 p-4 hidden sm:block">
                {/* Contact */}
                <div className="mb-6">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Contact
                  </h4>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Sarah Chen</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        Acme Corp
                      </p>
                    </div>
                  </div>
                </div>

                {/* Deal */}
                <div className="mb-6">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Deal
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span className="font-semibold">$18,400</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-muted-foreground" />
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium text-white bg-amber-500">
                        Proposal
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Close by Friday</span>
                    </div>
                  </div>
                </div>

                {/* Next Action */}
                <div className="mb-6">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Next Action
                  </h4>
                  <p className="text-sm">Send revised scope by Friday</p>
                </div>

                {/* AI Recap */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    AI Recap
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Sarah wants to see a revised scope covering timeline, pricing, and integration support.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Overlay */}
          <div className="mt-8 text-center">
            <a
              href="/signup"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Try it on your next deal
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Feature Row */}
        <div className="grid sm:grid-cols-3 gap-6 mt-16">
          <div className="text-center p-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary">100</span>
            </div>
            <h3 className="font-semibold mb-2">Free Premium AI Actions</h3>
            <p className="text-sm text-muted-foreground">
              Summarize, draft, generate proposals — 100 actions on us.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Proposals, Summaries & Contracts</h3>
            <p className="text-sm text-muted-foreground">
              AI-generated artifacts you can copy, download, and send.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">One Thread Per Deal</h3>
            <p className="text-sm text-muted-foreground">
              No more scattered emails. One unified deal thread with full context.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
