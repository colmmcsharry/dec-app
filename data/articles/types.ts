export type ArticleBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string; level?: 2 | 3 }
  | { type: "quote"; text: string }
  | { type: "emphasis"; text: string }
  | { type: "list"; items: string[] }
  | { type: "link"; label: string; url: string }
  | { type: "image"; path: string; caption?: string; alt?: string };

export type ArticlePodcastTrack = {
  id: string;
  title: string;
  /** Site-relative path, e.g. /media/podcasts/foo-part-1.mp3 */
  path: string;
};

export type Article = {
  slug: string;
  title: string;
  publishedAt: string;
  excerpt: string;
  kind: "article" | "podcast";
  /** Card/list thumbnail. Falls back to the first image block when omitted. */
  thumbnail?: string;
  blocks: ArticleBlock[];
  podcasts?: ArticlePodcastTrack[];
};
