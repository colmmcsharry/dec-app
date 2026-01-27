/**
 * Dropbox Configuration Template
 * 
 * SETUP INSTRUCTIONS:
 * 1. Copy this file and rename it to: dropbox.config.ts
 * 2. Follow the instructions in DROPBOX_API_SETUP.md
 * 3. Add your actual access token below
 * 4. Update folder paths to match your Dropbox structure
 * 
 * To get your access token:
 * 1. Go to https://www.dropbox.com/developers/apps
 * 2. Create an app with "Scoped access" and "Full Dropbox"
 * 3. Enable permissions: files.metadata.read, files.content.read
 * 4. Generate an access token in Settings > OAuth 2
 * 5. Copy the token and paste it below
 */

export const DROPBOX_CONFIG = {
  // Replace with your actual Dropbox access token
  accessToken: 'YOUR_DROPBOX_ACCESS_TOKEN_HERE',
  
  // Update these paths to match your Dropbox folder structure
  // Format: '/Folder Name/Subfolder/Video Folder'
  folderPaths: {
    sleep: '/Performance Treanor/1. Margaux Marketing/03_Peak-Performance-Code/Course_videos/03_Exports/Sleep',
    'morning-routines': '/Performance Treanor/1. Margaux Marketing/03_Peak-Performance-Code/Course_videos/03_Exports/Module1',
    'energy-management': '/Performance Treanor/1. Margaux Marketing/03_Peak-Performance-Code/Course_videos/03_Exports/Energy',
    'fuel-2-perform': '/Performance Treanor/1. Margaux Marketing/03_Peak-Performance-Code/Course_videos/03_Exports/Nutrition',
    'move-2-perform': '/Performance Treanor/1. Margaux Marketing/03_Peak-Performance-Code/Course_videos/03_Exports/Movement',
    'thinking-2-perform': '/Performance Treanor/1. Margaux Marketing/03_Peak-Performance-Code/Course_videos/03_Exports/Mental',
  },
};

// Note: The actual dropbox.config.ts file is in .gitignore to protect your access token
