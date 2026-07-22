import { MODULE_VIDEOS } from '@/data/module-videos';
import { File, Paths } from 'expo-file-system';

const PROGRESS_FILENAME = 'video_progress.json';

interface ProgressData {
  [categorySlug: string]: string[];
}

function getFile(): File {
  return new File(Paths.document, PROGRESS_FILENAME);
}

function validVideoIdsForCategory(categorySlug: string): Set<string> | null {
  const videos = MODULE_VIDEOS[categorySlug];
  if (!videos) return null;
  return new Set(videos.map((video) => video.id));
}

/** Drop watched IDs that are no longer in the module (e.g. Course Intro moved out of Sleep). */
function filterWatchedToCurrentModule(
  categorySlug: string,
  watched: string[],
): string[] {
  const validIds = validVideoIdsForCategory(categorySlug);
  if (!validIds) return watched;
  return watched.filter((id) => validIds.has(id));
}

function pruneProgressData(data: ProgressData): {
  cleaned: ProgressData;
  changed: boolean;
} {
  let changed = false;
  const cleaned: ProgressData = {};

  for (const [slug, watched] of Object.entries(data)) {
    const filtered = filterWatchedToCurrentModule(slug, watched);
    cleaned[slug] = filtered;
    if (filtered.length !== watched.length) {
      changed = true;
    }
  }

  return { cleaned, changed };
}

async function getProgressData(): Promise<ProgressData> {
  try {
    const file = getFile();
    if (!file.exists) return {};
    const content = await file.text();
    return JSON.parse(content);
  } catch {
    return {};
  }
}

async function saveProgressData(data: ProgressData): Promise<void> {
  try {
    const file = getFile();
    if (!file.exists) {
      file.create();
    }
    file.write(JSON.stringify(data));
  } catch (e) {
    console.log('[Progress] Error saving:', e);
  }
}

async function getPrunedProgressData(): Promise<ProgressData> {
  const data = await getProgressData();
  const { cleaned, changed } = pruneProgressData(data);
  if (changed) {
    await saveProgressData(cleaned);
  }
  return cleaned;
}

export async function markVideoWatched(categorySlug: string, videoId: string): Promise<void> {
  const data = await getPrunedProgressData();
  if (!data[categorySlug]) {
    data[categorySlug] = [];
  }
  if (!data[categorySlug].includes(videoId)) {
    data[categorySlug].push(videoId);
  }
  await saveProgressData(data);
}

export async function getWatchedVideos(categorySlug: string): Promise<string[]> {
  const data = await getPrunedProgressData();
  return data[categorySlug] || [];
}

export async function isVideoWatched(categorySlug: string, videoId: string): Promise<boolean> {
  const watched = await getWatchedVideos(categorySlug);
  return watched.includes(videoId);
}

export async function getCategoryProgress(categorySlug: string): Promise<number> {
  const watched = await getWatchedVideos(categorySlug);
  return watched.length;
}

export async function getAllProgress(): Promise<ProgressData> {
  return getPrunedProgressData();
}
