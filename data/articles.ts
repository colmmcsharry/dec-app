import { CARRAUNTOOHIL_ARTICLE } from "./articles/carrauntoohil";
import { DAVID_MCSHARRY_ARTICLE } from "./articles/david-mcsharry";
import { DANNY_LENNON_DIET_ARTICLE } from "./articles/danny-lennon-diet";
import { INNER_CHIMP_ARTICLE } from "./articles/inner-chimp";
import { MINDFUL_EATING_ARTICLE } from "./articles/mindful-eating";
import { PAT_SPILLANE_ARTICLE } from "./articles/pat-spillane";
import { SEAN_MCGARRITY_SALES_ARTICLE } from "./articles/sean-mcgarrity-sales";
import { TAIJI_ARTICLE } from "./articles/taiji";
import { WHENS_THE_LAST_TIME_YOU_DID_NOTHING_ARTICLE } from "./articles/whens-the-last-time-you-did-nothing";
import type { Article } from "./articles/types";

export type { Article, ArticleBlock, ArticlePodcastTrack } from "./articles/types";

export const ARTICLES: Article[] = [
  DANNY_LENNON_DIET_ARTICLE,
  SEAN_MCGARRITY_SALES_ARTICLE,
  MINDFUL_EATING_ARTICLE,
  CARRAUNTOOHIL_ARTICLE,
  TAIJI_ARTICLE,
  PAT_SPILLANE_ARTICLE,
  INNER_CHIMP_ARTICLE,
  DAVID_MCSHARRY_ARTICLE,
  WHENS_THE_LAST_TIME_YOU_DID_NOTHING_ARTICLE,
];

export function getArticleBySlug(slug: string): Article | undefined {
  return ARTICLES.find((article) => article.slug === slug);
}

function latestByKind(kind: Article["kind"]): Article | undefined {
  return ARTICLES.filter((article) => article.kind === kind).sort(
    (a, b) => b.publishedAt.localeCompare(a.publishedAt),
  )[0];
}

export function getFeaturedPodcast(): Article | undefined {
  return latestByKind("podcast");
}

export function getFeaturedArticle(): Article | undefined {
  return latestByKind("article");
}

export function getArticleThumbnail(article: Article): string | undefined {
  if (article.thumbnail) return article.thumbnail;
  const imageBlock = article.blocks.find((block) => block.type === "image");
  return imageBlock?.type === "image" ? imageBlock.path : undefined;
}
