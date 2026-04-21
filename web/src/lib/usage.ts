/**
 * Usage tracking for premium AI actions
 * 100 free actions per user
 */

export const FREE_ACTION_LIMIT = 100

export function getActionsUsed(): number {
  if (typeof window === 'undefined') return 0
  return parseInt(localStorage.getItem('bf_actions_used') || '0', 10)
}

export function incrementActionsUsed(): number {
  const current = getActionsUsed()
  const next = current + 1
  localStorage.setItem('bf_actions_used', String(next))
  return next
}

export function getActionsRemaining(): number {
  return Math.max(0, FREE_ACTION_LIMIT - getActionsUsed())
}

export function hasActionsRemaining(): boolean {
  return getActionsRemaining() > 0
}

export function resetActionsUsed(): void {
  localStorage.setItem('bf_actions_used', '0')
}
