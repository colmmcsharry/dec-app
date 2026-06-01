import type { Article } from "./types";

const WP_UPLOADS =
  "https://performancetreanor.wordpress.com/wp-content/uploads/2017/06";

export const MINDFUL_EATING_ARTICLE: Article = {
  slug: "mindful-eating-weight-loss",
  title: "Mindful Eating, Practical Tips and Positive Framing for Weight Loss",
  publishedAt: "2017-06-28",
  excerpt:
    "Practical mindful eating tips for weight loss — drawn from Tiddy Rowan's little book of mindfulness, with positive framing to keep you committed.",
  kind: "article",
  thumbnailAsset: require("../../assets/images/articles/mindful-eating.png"),
  blocks: [
    {
      type: "paragraph",
      text: "Extract from the little book of mindfulness by Tiddy Rowan.",
    },
    {
      type: "image",
      path: `${WP_UPLOADS}/17076834_327604870970536_1391782004785152000_n1.jpg`,
      alt: "Mindful eating",
    },
    {
      type: "list",
      items: [
        "Eat slower.",
        "Swallow what is in your mouth before taking the next bite.",
        "Put leftovers in the fridge straight away and don't leave them out on the table.",
        "If you find that you are most vulnerable when arriving in from work, try taking a healthy snack around 16.00 to increase satiety and ensure you are not as susceptible to the post work binge. Raisins and nuts are a good option.",
        "Try to see food as an occasion to share a social experience. Engage in the conversation as opposed to concentrating mostly on the food.",
        "If you have a treat food, avoid keeping large amounts of it in the house. It is better to have to walk to a local ice cream store for a cone than having a large packet of magnums in your freezer.",
        "Fruit is a great alternative to rubbishy sweets to satisfy your sweet tooth. If you replace chocolate and sweets for long enough with fruit you will create a new habit. I propose starting with a 21 day challenge whereby you seek to eat fruit instead of sugary processed alternatives for the whole 3 weeks.",
      ],
    },
    {
      type: "image",
      path: `${WP_UPLOADS}/fullsizerender-2.jpg`,
      alt: "Olympic Pineapple rings",
      caption: "Olympic Pineapple rings – Fruit is Fun",
    },
    {
      type: "list",
      items: [
        "At an all you can eat buffet scan all the food that is on offer first and then take a little bit of your preferred foods. Don't overfill your plate. You can go up for a little more after you have mindfully eaten what's on your plate if you are still hungry.",
        "Start going for 75% of your 'normal' portion sizes. Once this has been eaten take a 20 minute break. After this, ask yourself am I really still hungry? If yes is the answer, take a little more. If not, consider only cooking 75% of what you usually do the next time.",
        "Frame the weight loss challenge positively. Consistently imagine what it will feel like to fit into that outfit, see the joyous expression on friend's faces when they see your results etc. Better to start from here than thinking I have to cut out x,y and z. Start with and keep the end result in mind to help keep committed to the process.",
      ],
    },
    {
      type: "paragraph",
      text: "Check out the other book in the Downloads section",
    },
    {
      type: "emphasis",
      text: "How to Lose Fat — A Definitive Guide",
    },
    {
      type: "paragraph",
      text: "Happy eating!",
    },
  ],
};
