/**
 * Vimeo Configuration
 * 
 * To get your access token:
 * 1. Go to https://vimeo.com/settings/apps
 * 2. Click on your app (or create one)
 * 3. Under "Personal Access Token" → Generate
 * 4. Select scopes: private, public, video_files
 * 5. Copy the token and paste below
 */

export const VIMEO_CONFIG = {
  // Your Vimeo access token
  accessToken: '1416d700f7500edb385533d39ecb848a',
  
  // Map your Vimeo folder IDs to app categories
  // Get folder IDs from Vimeo URLs (e.g., vimeo.com/user/12345678/folder/28168946)
  categoryFolders: {
    'sleep': '28168946', // Module 1 - using for all categories for now
    'morning-routines': '28168946', // Module 1
    'energy-management': '28168946', // Module 1
    'fuel-2-perform': '28168946', // Module 1
    'move-2-perform': '28168946', // Module 1
    'thinking-2-perform': '28168946', // Module 1
    'recovery': '28168946', // Module 1
    'mindfulness': '28168946', // Module 1
    'stress-management': '28168946', // Module 1
    'habits': '28168946', // Module 1
  },
};

// Note: Vimeo personal access tokens don't expire. Set it once and you're good.
