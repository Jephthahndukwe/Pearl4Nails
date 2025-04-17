/**
 * Development mode helper functions
 * Used to enable/disable development-specific features
 */

/**
 * Check if development mode is enabled
 * In production, this will always return false
 */
export function getDevModeStatus() {
  const isDevEnvironment = process.env.NODE_ENV === 'development';
  const devModeEnabled = process.env.ENABLE_DEV_MODE === 'true';
  
  return {
    isDevEnvironment,
    devModeEnabled,
    nodeEnv: process.env.NODE_ENV || 'unknown'
  };
}

/**
 * Simpler check to see if we should use development features
 */
export function isDevMode(): boolean {
  const { isDevEnvironment, devModeEnabled } = getDevModeStatus();
  return isDevEnvironment && devModeEnabled;
}
