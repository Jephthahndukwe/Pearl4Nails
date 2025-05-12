export function hasAnimationExpired(): boolean {
  // Animation expiration date (1 week from launch)
  const launchDate = new Date(2025, 4, 12) // May 4, 2025 (month is 0-based)
  const expirationDate = new Date(launchDate.getTime() + 12 * 24 * 60 * 60 * 1000)
  return new Date() > expirationDate
}

export function hasUserSeenAnimation(): boolean {
  if (typeof window === 'undefined') return false
  const hasSeen = localStorage.getItem('hasSeenLaunchAnimation')
  return hasSeen === 'true'
}

export function markAnimationAsSeen(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('hasSeenLaunchAnimation', 'true')
  }
}
