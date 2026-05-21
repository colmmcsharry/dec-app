import type { Article } from "./types";

const WP_UPLOADS =
  "https://performancetreanor.wordpress.com/wp-content/uploads/2017/05";

export const CARRAUNTOOHIL_ARTICLE: Article = {
  slug: "climbing-carrauntoohil",
  title: "Top tips for climbing Carrauntoohil – Ireland's highest peak",
  publishedAt: "2017-05-30",
  excerpt:
    "Lessons from climbing Ireland's 1,038-metre highest peak — preparation, route choice, group motivation, and the carrot at the end.",
  kind: "article",
  blocks: [
    {
      type: "paragraph",
      text: "Taking on the 1,038 metre giant was no mean feat. Here are some top tips and learning points to help you give it your best shot.",
    },
    {
      type: "image",
      path: `${WP_UPLOADS}/take-a-look-around.jpg`,
      alt: "View on the climb",
      caption:
        "One of many beautiful views on the climb – Photo courtesy of David Grogan",
    },
    {
      type: "heading",
      text: "Fail to prepare, prepare to fail",
      level: 2,
    },
    {
      type: "paragraph",
      text: "Ensure that you bring plenty of water, some snacks (granola bars are convenient) and a sandwich or roll for lunch. A comfortable rucksack is also important.",
    },
    {
      type: "paragraph",
      text: "Another key element is getting your footwear correct. I forgot to bring my mountain boots from the B & B in which we were staying and feel that runners weren't the most appropriate footwear to go up the mountain.",
    },
    {
      type: "image",
      path: `${WP_UPLOADS}/the-top.jpg`,
      alt: "Mountain boots on the climb",
      caption:
        "Better to tackle the giant in mountain boots than runners – Photo courtesy of David Grogan",
    },
    {
      type: "heading",
      text: "Keep light",
      level: 2,
    },
    {
      type: "paragraph",
      text: "Don't bring unnecessary objects. I bought a coffee at the bottom and had to carry the cup the whole way as there were no bins en route. Avoid cluttering your bag and pockets for a more comfortable trek.",
    },
    {
      type: "heading",
      text: "Stick to the process",
      level: 2,
    },
    {
      type: "paragraph",
      text: "Do not keep looking towards the top of the mountain. Pick a point up ahead and use it as your next mini challenge. Once that has been achieved, turn around and admire the view. Celebrating sub goals along the way is a wonderful way to keep committed.",
    },
    {
      type: "image",
      path: `${WP_UPLOADS}/gods-country.jpg`,
      alt: "God's country view",
      caption: "Tír dé (God's country) – Photo courtesy of David Grogan",
    },
    {
      type: "heading",
      text: "Pick the route according to your level",
      level: 2,
    },
    {
      type: "paragraph",
      text: "If you have not been very active leading into taking on 'toohil then you should choose the zig zag route as opposed to going up the devil's ladder (aptly named). My calves can attest to that today.",
    },
    {
      type: "image",
      path: `${WP_UPLOADS}/devils-ladder.jpg`,
      alt: "Devil's ladder break",
      caption:
        "A welcome break halfway up the devil's ladder for photos – Photo courtesy of David Grogan",
    },
    {
      type: "heading",
      text: "Go in a group and have the craic",
      level: 2,
    },
    {
      type: "paragraph",
      text: "I took it on with two great friends and we kept each other motivated along the way. Remember to smile and laugh often along the journey.",
    },
    {
      type: "paragraph",
      text: "We had committed to speaking Irish for our whole trip in Kerry and met some fellow Gaeilgeoirí (Irish speakers) on the way up which made for interesting conversation.",
    },
    {
      type: "image",
      path: `${WP_UPLOADS}/feic-ar-sinn.jpg`,
      alt: "At the top of Carrauntoohil",
      caption: "At the top – Photo courtesy of Sean McStay",
    },
    {
      type: "paragraph",
      text: "We often quoted from funny YouTube videos or sang bits of songs to keep the spirits up. Here's one of our go to songs on our Irish speaking weekend's away.",
    },
    {
      type: "heading",
      text: "Use carrots (or apple tarts) for motivation",
      level: 2,
    },
    {
      type: "image",
      path: `${WP_UPLOADS}/the-carrot-part-2.jpg`,
      alt: "Yumbles",
      caption: "One word, YUMBLES! Photo courtesy of David Grogan",
    },
    {
      type: "paragraph",
      text: "We had decided the after trek treat would be tea and cake which made for some good for thought during the journey. Visualising carrots helps to keep going throughout experiences particularly when the going gets tough.",
    },
    {
      type: "paragraph",
      text: "In all it took us 5 hours and 15 minutes. We ascended the devil's ladder route and came down the zig zag route. All in all a thoroughly enjoyable experience.",
    },
    {
      type: "image",
      path: `${WP_UPLOADS}/the-carrot.jpg`,
      alt: "Tea and cake",
      caption: "Tea and Cake – Photo courtesy of David Grogan",
    },
  ],
};
