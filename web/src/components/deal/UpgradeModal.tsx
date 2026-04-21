'use client'

import { useCallback } from 'react'
import { X, Sparkles, Users, Crown, Check } from 'lucide-react'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
}

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const handleClaimFounding = useCallback(() => {
    // TODO: Implement founding plan checkout
    window.open('/pricing?plan=founding', '_blank')
  }, [])

  const handleSelectPro = useCallback(() => {
    // TODO: Implement Pro checkout
    window.open('/pricing?plan=pro', '_blank')
  }, [])

  const handleSelectTeam = useCallback(() => {
    // TODO: Implement Team checkout
    window.open('/pricing?plan=team', '_blank')
  }, [])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-background rounded-xl shadow-2xl border border-border overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">
              You&apos;ve used your 100 free premium AI actions
            </h2>
            <p className="text-muted-foreground">
              Upgrade to keep closing deals.
            </p>
          </div>

          {/* Plans */}
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            {/* Pro Plan */}
            <div className="border border-border rounded-lg p-5 hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <Crown className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Pro</h3>
                <span className="ml-auto text-lg font-bold">$39/mo</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Solo founders</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Unlimited AI actions
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Proposal generation
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Contract review
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Artifact export
                </li>
              </ul>
              <button
                onClick={handleSelectPro}
                className="w-full mt-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Get Pro
              </button>
            </div>

            {/* Team Plan */}
            <div className="border border-primary/50 rounded-lg p-5 bg-primary/5 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                Popular
              </div>
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Team</h3>
                <span className="ml-auto text-lg font-bold">$99/mo</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Up to 5 teammates</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Everything in Pro
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Shared deal rooms
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Team analytics
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Priority support
                </li>
              </ul>
              <button
                onClick={handleSelectTeam}
                className="w-full mt-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Get Team
              </button>
            </div>
          </div>

          {/* Founding Plan */}
          <div className="border border-amber-200 bg-amber-50 rounded-lg p-4 text-center">
            <p className="text-sm font-medium text-amber-900 mb-2">
              Or try the Founding Plan: $99 for 3 months, locked in forever.
            </p>
            <button
              onClick={handleClaimFounding}
              className="text-sm font-semibold text-amber-700 hover:text-amber-800 underline"
            >
              Claim founding plan →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
