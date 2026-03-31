import { File, Paths } from 'expo-file-system';

const PROGRESS_FILENAME = 'video_progress.json';

interface ProgressData {
  [categorySlug: string]: string[];
}

function getFile(): File {
  return new File(Paths.document, PROGRESS_FILENAME);
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

export async function markVideoWatched(categorySlug: string, videoId: string): Promise<void> {
  const data = await getProgressData();
  if (!data[categorySlug]) {
    data[categorySlug] = [];
  }
  if (!data[categorySlug].includes(videoId)) {
    data[categorySlug].push(videoId);
  }
  await saveProgressData(data);
}

export async function getWatchedVideos(categorySlug: string): Promise<string[]> {
  const data = await getProgressData();
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
  return getProgressData();
}
