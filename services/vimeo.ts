import { VIMEO_CONFIG } from '@/config/vimeo.config';

const VIMEO_API_URL = 'https://api.vimeo.com';

export interface VimeoVideo {
  id: string;
  name: string;
  description: string;
  duration: number;
  link: string;
  playerEmbedUrl: string;
  thumbnail: string;
  width: number;
  height: number;
}

/**
 * Get videos from a Vimeo folder
 */
export async function getVideosFromFolder(folderId: string): Promise<VimeoVideo[]> {
  try {
    console.log('Fetching videos from Vimeo folder:', folderId);
    
    // Try the folders endpoint first
    const response = await fetch(
      `${VIMEO_API_URL}/me/projects/${folderId}/videos?per_page=100`,
      {
        headers: {
          'Authorization': `Bearer ${VIMEO_CONFIG.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Vimeo API error:', errorData);
      throw new Error(`Vimeo API error: ${errorData.error || JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    
    const videos: VimeoVideo[] = data.data.map((video: any) => ({
      id: video.uri.split('/').pop(),
      name: video.name,
      description: video.description || '',
      duration: video.duration,
      link: video.link,
      playerEmbedUrl: video.player_embed_url,
      thumbnail: video.pictures?.sizes?.[3]?.link || video.pictures?.base_link || '',
      width: video.width,
      height: video.height,
    }));

    console.log(`✓ Found ${videos.length} videos in folder ${folderId}`);
    return videos;
    
  } catch (error) {
    console.error('Error fetching videos from Vimeo:', error);
    throw error;
  }
}

/**
 * Get all folders from Vimeo
 */
export async function getAllFolders() {
  try {
    const response = await fetch(
      `${VIMEO_API_URL}/me/projects?per_page=100`,
      {
        headers: {
          'Authorization': `Bearer ${VIMEO_CONFIG.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching Vimeo folders:', error);
    throw error;
  }
}

/**
 * Parse video name for metadata
 */
export function parseVideoMetadata(name: string) {
  // Handle your naming pattern: M1_01_video1 or similar
  const match = name.match(/M(\d+)_(\d+)_(.+)/i);
  
  if (match) {
    return {
      module: parseInt(match[1], 10),
      section: parseInt(match[2], 10),
      description: match[3].replace(/_/g, ' ').trim(),
      displayName: name.replace(/_/g, ' ').trim(),
    };
  }
  
  return {
    displayName: name,
  };
}
