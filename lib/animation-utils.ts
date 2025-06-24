export function hasAnimationExpired(): boolean {
  // Animation expiration date (1 month from July 1, 2025)
  const launchDate = new Date(2025, 6, 1) // July 1, 2025 (month is 0-based)
  const expirationDate = new Date(2025, 7, 1) // August 1, 2025
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
