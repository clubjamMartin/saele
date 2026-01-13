/**
 * Instagram embed configuration
 * Part of SAE-13: Dashboard Backend API
 */

export interface InstagramConfig {
  username: string;
  embedUrl: string;
  profileUrl: string;
}

/**
 * Get Instagram embed configuration for @appartementschristine
 * Frontend will use Instagram's official embed script or oEmbed API
 */
export function getInstagramConfig(): InstagramConfig {
  const username = 'appartementschristine';
  
  return {
    username,
    embedUrl: `https://www.instagram.com/${username}/embed/`,
    profileUrl: `https://www.instagram.com/${username}/`,
  };
}
