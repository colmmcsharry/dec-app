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
    'sleep': '28168946',             // Module 1
    'morning-routines': '28168947',  // Module 2
    'energy-management': '28168950', // Module 3
    'mindfulness': '28168952',       // Module 4 (Creativity)
    'move-2-perform': '28168954',    // Module 5
    'thinking-2-perform': '28168955',// Module 6
    'recovery': '28168956',          // Module 7
    'fuel-2-perform': '28168957',    // Module 8 (Nutrition / Fuel 2 Perform in app)
    'stress-management': '28168958', // Module 9 (Most Authentic You)
    'habits': '28168960',            // Module 10
  },

  /** About page video testimonials */
  testimonialsFolder: '29392954',
};

// Note: Vimeo personal access tokens don't expire. Set it once and you're good.
