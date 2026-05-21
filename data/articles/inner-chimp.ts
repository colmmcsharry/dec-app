import type { Article } from "./types";

const WP_UPLOADS =
  "https://performancetreanor.wordpress.com/wp-content/uploads/2016/10";

export const INNER_CHIMP_ARTICLE: Article = {
  slug: "inner-chimp-steve-peters",
  title:
    "Stop sabotaging yourself by letting the inner chimp win! Dr. Steve Peters reveals the trick.",
  publishedAt: "2016-10-26",
  excerpt:
    "Dr. Steve Peters explains how to manage the emotional part of your brain — the inner chimp — so it stops sabotaging performance under pressure.",
  kind: "article",
  blocks: [
    {
      type: "paragraph",
      text: "Perform better by managing the emotional part of the brain more effectively.",
    },
    {
      type: "paragraph",
      text: "Dr. Steve Peters is an English psychiatrist who works in elite sport. His clients include Ronnie O'Sullivan and Victoria Pendleton. Both claim he brought them back from dark places in their careers.",
    },
    {
      type: "image",
      path: `${WP_UPLOADS}/manage-the-chimp1.jpg`,
      alt: "Manage the chimp",
    },
    {
      type: "paragraph",
      text: "Here are the key takeaways from his ted talk:",
    },
    {
      type: "list",
      items: [
        "We need to control the part of our brain which thinks \"emotionally and catastrophically\". This thinking is good in real life or death scenarios, not when it impinges on many areas of our life that are not e.g. introducing ourselves at a work event.",
        "Our chimp is 5 times as powerful as our rational frontal cortex. Thus we need to recognise him. Generally when we think thoughts we do not want, that is our Chimp. An example would be worrying about what everybody else thinks and thus not making the right decision for you.",
        "\"I want to go and enjoy myself and do my best\". Steve's athletes thought like this in immense pressure environments, at the Olympics. They don't blame their chimp for thoughts like \"I must win and not let anyone down\", they know their chimps exist and choose to suppress them. They worked hard enough that their belief in their ability enabled them to overrule their chimps.",
      ],
    },
    {
      type: "image",
      path: `${WP_UPLOADS}/chimp-action-shot.jpg`,
      alt: "Chimp action shot",
    },
    {
      type: "paragraph",
      text: "Steve believes you must reason with your chimp, talk to it and challenge it! Do I really need everyone's approval all the time? Will people stop caring about me if I don't succeed? Challenge these thoughts by thinking back to past examples, often these fears have been shown to be false.",
    },
  ],
};
