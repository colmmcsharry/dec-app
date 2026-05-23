import type { Article } from "./types";

const WP_UPLOADS =
  "https://performancetreanor.wordpress.com/wp-content/uploads/2016/10";

export const WHENS_THE_LAST_TIME_YOU_DID_NOTHING_ARTICLE: Article = {
  slug: "whens-the-last-time-you-did-nothing",
  title: "When's the last time you did nothing?",
  publishedAt: "2016-10-06",
  excerpt:
    "Key takeaways from Andy Puddicombe on mindfulness, presence, and training the same mind we rely on to perform at our best.",
  kind: "article",
  thumbnail: `${WP_UPLOADS}/art-1.jpg`,
  blocks: [
    {
      type: "image",
      path: `${WP_UPLOADS}/art-1.jpg`,
      alt: "Mindfulness and presence",
    },
    {
      type: "paragraph",
      text: "Presence is everything according to mindfulness expert Andy Puddicombe.",
    },
    {
      type: "paragraph",
      text: "From Sports Science to Tibetan Buddhist Monk to a degree in Circus Arts, Andy has led a varied life which has culminated in touching the lives of many through his mindfulness app Headspace.",
    },
    {
      type: "heading",
      text: "Key takeaways",
      level: 2,
    },
    {
      type: "list",
      items: [
        "The same mind we need \"to perform at our very best\" is the one we don't take any time to train.",
        "Mindfulness and meditation are not just reactionary measures for when you are stressed. If you commit to practice in both good and bad periods they can also be preventative measures against future stress.",
        "We often can't change the things that happen to us in life but we can change how we experience them. By recognising a thought and not constantly getting involved in it we can cope better. Let it drive by like a car on the road.",
        "An appreciation for the present moment is \"underrated\". According to Andy 46% of the time we are lost in thought — mindfulness is scientifically proven to bring us back.",
        "A balance of focused relaxation can help us to allow thoughts to come and go without being too judgmental on ourselves. Treat yourself as you would a friend — with compassion!",
      ],
    },
    {
      type: "paragraph",
      text: "Mindfulness can help us appreciate the little things more like a walk in the park, breathing in fresh air, beautiful scenery and time with loved ones.",
    },
    {
      type: "paragraph",
      text: "This can happen if we commit to practicing it on a daily basis. Downloading free resources like the Headspace App 10 day trial or subscribing to Padraig O'Morain's daily mindfulness bells are good start points.",
    },
    {
      type: "heading",
      text: "Useful links",
      level: 2,
    },
    {
      type: "link",
      label: "Headspace",
      url: "https://www.headspace.com/",
    },
    {
      type: "link",
      label: "Padraig O'Morain — The Daily Bell",
      url: "https://www.padraigomorain.com/dailybell",
    },
    {
      type: "image",
      path: `${WP_UPLOADS}/06-10-article.png`,
      alt: "Mindfulness resources",
    },
  ],
};
