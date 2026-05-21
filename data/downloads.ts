export type Download = {
  id: string;
  title: string;
  description: string;
  asset: number;
  thumbnail: number;
};

/** Newest first — featured card uses the first entry. */
export const DOWNLOADS: Download[] = [
  {
    id: "30-day-detox",
    title: "30 Day Detox",
    description:
      "30 breakfasts, lunches and dinners for a 30-day fat loss detox.",
    asset: require("../assets/pdfs/downloads/30-day-detox.pdf"),
    thumbnail: require("../assets/images/downloads/30-day-detox.jpg"),
  },
  {
    id: "how-to-lose-fat",
    title: "How to Lose Fat — A Definitive Guide",
    description:
      "A complete guide to sustainable fat loss and eating for performance.",
    asset: require("../assets/pdfs/downloads/how-to-lose-fat.pdf"),
    thumbnail: require("../assets/images/downloads/how-to-lose-fat.jpg"),
  },
  {
    id: "31-day-challenge-diet-dos-donts",
    title: "31 Day Challenge — Diet Do's and Don'ts",
    description: "Simple diet rules to support your 31-day challenge.",
    asset: require("../assets/pdfs/downloads/31-day-challenge-diet-dos-donts.pdf"),
    thumbnail: require("../assets/images/downloads/31-day-challenge-diet-dos-donts.jpg"),
  },
  {
    id: "31-days-drop-a-jean-size",
    title: "31 Days Drop a Jean Size — Vital Info",
    description: "Key guidance for the drop-a-jean-size weight loss plan.",
    asset: require("../assets/pdfs/downloads/31-days-drop-a-jean-size.pdf"),
    thumbnail: require("../assets/images/downloads/31-days-drop-a-jean-size.jpg"),
  },
  {
    id: "7-days-kick-start-weight-loss",
    title: "7 Days to Kick-Start Your Weight Loss Journey",
    description:
      "A focused one-week plan to get your weight loss journey started.",
    asset: require("../assets/pdfs/downloads/7-days-kick-start-weight-loss.pdf"),
    thumbnail: require("../assets/images/downloads/7-days-kick-start-weight-loss.jpg"),
  },
  {
    id: "10-step-guide-peak-performance",
    title: "10-Step Guide to Peak Performance",
    description: "Ten practical steps to train the mind, body and soul.",
    asset: require("../assets/pdfs/downloads/10-step-guide-peak-performance.pdf"),
    thumbnail: require("../assets/images/downloads/10-step-guide-peak-performance.jpg"),
  },
  {
    id: "magic-movement-guide",
    title: "Magic Movement Guide",
    description: "Movement guidance from Performance Treanor.",
    asset: require("../assets/pdfs/downloads/magic-movement-guide.pdf"),
    thumbnail: require("../assets/images/downloads/magic-movement-guide.jpg"),
  },
  {
    id: "10-tips-healthy-at-work",
    title: "10 Tips to Stay Healthy at Work",
    description:
      "Simple habits to stay healthy and energised during the workday.",
    asset: require("../assets/pdfs/downloads/10-tips-healthy-at-work.pdf"),
    thumbnail: require("../assets/images/downloads/10-tips-healthy-at-work.jpg"),
  },
  {
    id: "course-book",
    title: "Course Book",
    description: "The full Performance Treanor course book.",
    asset: require("../assets/documents/course-leaflet.pdf"),
    thumbnail: require("../assets/images/downloads/course-book.jpg"),
  },
];

export function getDownloadById(id: string): Download | undefined {
  return DOWNLOADS.find((download) => download.id === id);
}

export function getFeaturedDownload(): Download {
  return DOWNLOADS[0];
}
