export type SupplementalResource = {
  title: string;
  url?: string;
  assetModule?: number;
  description?: string;
  buttonLabel?: string;
};

export const SUPPLEMENTAL_RESOURCES: Record<string, SupplementalResource[]> = {
  "sleep:1159439402": [
    {
      title: "Additional Resource",
      url: "https://www.youtube.com/watch?v=5MuIMqhT8DM",
    },
    {
      title: "Matt Walker TED Talk",
      url: "https://www.ted.com/talks/matt_walker_sleep_is_your_superpower?language=en",
      description:
        "A great talk on why sleep is one of the biggest levers for health and performance.",
    },
  ],
  "sleep:1159439541": [
    {
      title: "Evening-Time Audit",
      assetModule: require("@/assets/documents/module-resources/Module1/Evening-time-audit.pdf"),
      description:
        "A worksheet to track how you spend your evenings and spot the habits that delay or damage sleep.",
      buttonLabel: "Open PDF",
    },
  ],
  "sleep:1159439628": [
    {
      title: "KonMari Intro Video",
      url: "https://www.youtube.com/watch?v=2T-DXav9PtQ",
      description:  
        "A simple introduction to the KonMari method for creating a calmer, tidier space.",
    },
  ],
  "sleep:1159439649": [
    {
      title: "Journaling Made Simple",
      assetModule: require("@/assets/documents/module-resources/Module1/Journaling-made-simple.pdf"),
      description:
        "A short guided journaling worksheet with prompts to help you wind down and reflect.",
      buttonLabel: "Open PDF",
    },
  ],
  "sleep:1159439753": [
    {
      title: "1 Week for Better Sleep",
      assetModule: require("@/assets/documents/module-resources/Module1/1-week-for-better-sleep.pdf"),
      description:
        "A 7-day sleep improvement planner. You can also use the in-app digital workbook for this module.",
      buttonLabel: "Open PDF",
    },
  ],
  "morning-routines:1162879354": [
    {
      title: "Morning Routine Overview",
      assetModule: require("@/assets/documents/module-resources/Module2/Module-2_sheet1.pdf"),
      description:
        "A quick summary sheet covering the key ideas behind a calmer, more effective morning routine. Use the digital workbook on the module screen for typed, saved exercises.",
      buttonLabel: "Open PDF",
    },
  ],
  "morning-routines:1162879373": [
    {
      title: "William McRaven Speech",
      url: "https://www.youtube.com/watch?v=pxBQLFLei70&t=900s",
      description:
        "A strong reminder about ownership, discipline, and the value of small wins.",
    },
  ],
  "morning-routines:1162879387": [
    {
      title: "Morning Mindset Worksheet",
      assetModule: require("@/assets/documents/module-resources/Module2/Module-2_sheet2.pdf"),
      description:
        "A worksheet on movement, mindfulness, motivation, and bringing more intention to the start of your day.",
      buttonLabel: "Open PDF",
    },
  ],
  "morning-routines:1162887323": [
    {
      title: "Today's Priorities",
      assetModule: require("@/assets/documents/module-resources/Module2/Today-priorities.pdf"),
      description:
        "A prioritisation exercise to help you focus on the few things that matter most each day.",
      buttonLabel: "Open PDF",
    },
  ],
  "morning-routines:1162887336": [
    {
      title: "Your Go-To Rise & Shine Routine",
      assetModule: require("@/assets/documents/module-resources/Module2/Your-go-to-Rise-&-Shine-routine.pdf"),
      description:
        "A practical routine planner to help you build a repeatable morning flow that works for you.",
      buttonLabel: "Open PDF",
    },
  ],
  "energy-management:1162888191": [
    {
      title: "Energy Management Overview",
      assetModule: require("@/assets/documents/module-resources/Module3/Module-3_sheet1.pdf"),
      description:
        "An overview sheet on high-potential hours, energy management, and using your time more intentionally. Use the digital workbook on the module screen for typed, saved exercises.",
      buttonLabel: "Open PDF",
    },
  ],
  "energy-management:1162888202": [
    {
      title: "Dealing With Distraction",
      assetModule: require("@/assets/documents/module-resources/Module3/Module-3_sheet2.pdf"),
      description:
        "A support sheet on internal and external distractions and how to keep them from hijacking your day.",
      buttonLabel: "Open PDF",
    },
  ],
  "energy-management:1162888219": [
    {
      title: "Track Your Energy",
      assetModule: require("@/assets/documents/module-resources/Module3/Track-your-energy.pdf"),
      description:
        "A tracker to help you spot when your energy is highest and which tasks belong in those windows.",
      buttonLabel: "Open PDF",
    },
  ],
  "energy-management:1162888247": [
    {
      title: "Your Email Cheatsheet",
      assetModule: require("@/assets/documents/module-resources/Module3/Your-email-cheatsheet.pdf"),
      description:
        "A quick-reference guide for handling email more deliberately and with less interruption.",
      buttonLabel: "Open PDF",
    },
  ],
  "energy-management:1162888255": [
    {
      title: "Time-Saving Email Templates",
      assetModule: require("@/assets/documents/module-resources/Module3/Time_saving_email-templates.pdf"),
      description:
        "Template ideas to reduce email friction and save time on repetitive communication.",
      buttonLabel: "Open PDF",
    },
  ],
  "energy-management:1162888268": [
    {
      title: "Plan Use Your Time Wisely",
      assetModule: require("@/assets/documents/module-resources/Module3/Plan-use-your-time-wisely.pdf"),
      description:
        "A planning worksheet to help you protect your calendar and spend more time on meaningful work.",
      buttonLabel: "Open PDF",
    },
  ],
  "energy-management:1162888280": [
    {
      title: "Stay Energized",
      assetModule: require("@/assets/documents/module-resources/Module3/Stay-energized.pdf"),
      description:
        "A worksheet with prompts to support steadier energy through movement, recovery, and better habits.",
      buttonLabel: "Open PDF",
    },
  ],
  "energy-management:1162888293": [
    {
      title: "Procrastination Buster",
      assetModule: require("@/assets/documents/module-resources/Module3/Procrastination-buster.pdf"),
      description:
        "A practical exercise for identifying why you are putting things off and what to do next.",
      buttonLabel: "Open PDF",
    },
  ],
  "energy-management:1162888320": [
    {
      title: "Weekly Review",
      assetModule: require("@/assets/documents/module-resources/Module3/Weekly_Review.pdf"),
      description:
        "A short review template to help you step back, assess your week, and reset for the next one.",
      buttonLabel: "Open PDF",
    },
  ],
  "mindfulness:1162888376": [
    {
      title: "Creative Thinking Overview",
      assetModule: require("@/assets/documents/module-resources/Module4/Module-4_sheet1.pdf"),
      description:
        "A summary sheet on creativity, problem solving, and bringing a more flexible mindset to challenges. Use the digital workbook on the module screen for typed, saved exercises.",
      buttonLabel: "Open PDF",
    },
  ],
  "mindfulness:1162888393": [
    {
      title: "The 9-Dot Problem",
      assetModule: require("@/assets/documents/module-resources/Module4/The-nine-dot-problem.pdf"),
      description:
        "A classic creativity challenge that rewards thinking beyond the obvious constraints.",
      buttonLabel: "Open PDF",
    },
  ],
  "mindfulness:1162888402": [
    {
      title: "Your Best Creative Solutions",
      assetModule: require("@/assets/documents/module-resources/Module4/Your-best-creative-solutions.pdf"),
      description:
        "A worksheet to capture, refine, and build on your most useful creative ideas.",
      buttonLabel: "Open PDF",
    },
  ],
  "mindfulness:1162888421": [
    {
      title: "Emilie Wapnick TED Talk",
      url: "https://www.ted.com/talks/emilie_wapnick_why_some_of_us_don_t_have_one_true_calling?language=en",
      description:
        "A TED Talk on the strengths of having diverse interests and talents.",
    },
  ],
  "mindfulness:1162888469": [
    {
      title: "Creative Thinking Boosters",
      assetModule: require("@/assets/documents/module-resources/Module4/Module-4_sheet2.pdf"),
      description:
        "A resource on using movement, nature, and new inputs to unlock more creative thinking.",
      buttonLabel: "Open PDF",
    },
  ],
  "mindfulness:1162888508": [
    {
      title: "Selective Attention Test",
      url: "https://www.youtube.com/watch?v=KB_lTKZm1Ts",
      description:
        "A quick awareness test on how focusing on one thing can make you miss the bigger picture.",
    },
  ],
  "mindfulness:1162888573": [
    {
      title: "How to Make Difficult Decisions",
      assetModule: require("@/assets/documents/module-resources/Module4/How-to-make-difficult-decisions.pdf"),
      description:
        "A decision-making worksheet to help you work through tough calls with more clarity.",
      buttonLabel: "Open PDF",
    },
  ],
  "move-2-perform:1162888592": [
    {
      title: "Downtime Overview",
      assetModule: require("@/assets/documents/module-resources/Module5/Module-5_sheet1.pdf"),
      description:
        "A summary sheet on why downtime is essential for sustained performance and better recovery. Use the digital workbook on the module screen for typed, saved exercises.",
      buttonLabel: "Open PDF",
    },
  ],
  "move-2-perform:1162888604": [
    {
      title: "Evening Downtime Plan",
      assetModule: require("@/assets/documents/module-resources/Module5/Evening-downtime-plan.pdf"),
      description:
        "A worksheet to help you use your evenings more intentionally so you recover your energy at home.",
      buttonLabel: "Open PDF",
    },
  ],
  "move-2-perform:1162888716": [
    {
      title: "To Outsource Or Not To Outsource?",
      assetModule: require("@/assets/documents/module-resources/Module5/To-outsource-or-not-to-outsource.pdf"),
      description:
        "A practical exercise to decide which chores to keep, drop, or outsource.",
      buttonLabel: "Open PDF",
    },
  ],
  "move-2-perform:1162888734": [
    {
      title: "Holiday Reflection Guide",
      assetModule: require("@/assets/documents/module-resources/Module5/Module-5_sheet2.pdf"),
      description:
        "A holiday-focused reflection sheet on how to restore, plan well, and come back with better energy.",
      buttonLabel: "Open PDF",
    },
  ],
  "move-2-perform:1162888748": [
    {
      title: "Holiday Reflection",
      assetModule: require("@/assets/documents/module-resources/Module5/Holiday-reflection.pdf"),
      description:
        "A guided reflection worksheet to help you think clearly about where you are and where you want to go.",
      buttonLabel: "Open PDF",
    },
  ],
  "thinking-2-perform:1162889869": [
    {
      title: "Inner Game Overview",
      assetModule: require("@/assets/documents/module-resources/Module6/Module-6_sheet1.pdf"),
      description:
        "A summary sheet on self-talk, mindfulness, and building a healthier internal dialogue. Use the digital workbook on the module screen for typed, saved exercises.",
      buttonLabel: "Open PDF",
    },
  ],
  "thinking-2-perform:1162890051": [
    {
      title: "Mindfulness Guide",
      assetModule: require("@/assets/documents/module-resources/Module6/Module-6_sheet2.pdf"),
      description:
        "A simple guide to mindfulness and returning attention to what is happening right now.",
      buttonLabel: "Open PDF",
    },
  ],
  "thinking-2-perform:1162889946": [
    {
      title: "Healthy Thinking",
      assetModule: require("@/assets/documents/module-resources/Module6/Healthy-thinking.pdf"),
      description:
        "A worksheet for identifying distorted thoughts and replacing them with healthier patterns.",
      buttonLabel: "Open PDF",
    },
  ],
  "recovery:1162890240": [
    {
      title: "Exercise & Physical Activity Overview",
      assetModule: require("@/assets/documents/module-resources/Module7/Module-7_sheet1.pdf"),
      description:
        "A summary resource on why movement matters and how to make it work alongside real life and work. Use the digital workbook on the module screen for typed, saved exercises.",
      buttonLabel: "Open PDF",
    },
  ],
  "recovery:1162890268": [
    {
      title: "Make Exercise A Habit",
      assetModule: require("@/assets/documents/module-resources/Module7/Make-exercise-a-habit.pdf"),
      description:
        "A practical worksheet to make exercise more consistent and easier to maintain.",
      buttonLabel: "Open PDF",
    },
  ],
  "recovery:1162890360": [
    {
      title: "Work and Physical Activity Guide",
      assetModule: require("@/assets/documents/module-resources/Module7/Module-7_sheet2.pdf"),
      description:
        "A support sheet on blending exercise, recovery, and performance more effectively into daily life.",
      buttonLabel: "Open PDF",
    },
  ],
  "fuel-2-perform:1162890534": [
    {
      title: "Nutrition & Hydration Overview",
      assetModule: require("@/assets/documents/module-resources/Module8/Module-8_sheet1.pdf"),
      description:
        "A summary sheet on eating and drinking for better energy, concentration, and performance. Use the digital workbook on the module screen for typed, saved exercises.",
      buttonLabel: "Open PDF",
    },
  ],
  "fuel-2-perform:1162890588": [
    {
      title: "Eating for Performance",
      assetModule: require("@/assets/documents/module-resources/Module8/Eating-for-performance.pdf"),
      description:
        "A practical guide to eating in a way that supports health, energy, and high performance.",
      buttonLabel: "Open PDF",
    },
  ],
  "fuel-2-perform:1162890604": [
    {
      title: "Macronutrients Guide",
      assetModule: require("@/assets/documents/module-resources/Module8/Macronutrients.pdf"),
      description:
        "A simple reference guide to the main macronutrients and food sources for each.",
      buttonLabel: "Open PDF",
    },
  ],
  "fuel-2-perform:1162890694": [
    {
      title: "Shopping List",
      assetModule: require("@/assets/documents/module-resources/Module8/EatingOnWildSide_ShoppingList_2020.pdf"),
      description:
        "A shopping list resource to make better food choices easier and more visible in your environment.",
      buttonLabel: "Open PDF",
    },
  ],
  "fuel-2-perform:1162890726": [
    {
      title: "Reconnect With Food",
      assetModule: require("@/assets/documents/module-resources/Module8/Module-8_sheet2.pdf"),
      description:
        "A mindful eating guide to help you slow down, reconnect with food, and notice your habits more clearly.",
      buttonLabel: "Open PDF",
    },
    {
      title: "Food Diary",
      assetModule: require("@/assets/documents/module-resources/Module8/Food-diary.pdf"),
      description:
        "A tracker for noticing how meals and snacks affect your energy and mood.",
      buttonLabel: "Open PDF",
    },
    {
      title: "Food Journal Continuation Plan",
      assetModule: require("@/assets/documents/module-resources/Module8/Food-journal-continuation-plan.pdf"),
      description:
        "A follow-on worksheet for turning your food diary insights into a clearer plan.",
      buttonLabel: "Open PDF",
    },
  ],
  "fuel-2-perform:1162890753": [
    {
      title: "Hydrating for Performance",
      assetModule: require("@/assets/documents/module-resources/Module8/Hydrating-for-performance.pdf"),
      description:
        "A hydration guide with practical advice on avoiding low-energy dips caused by dehydration.",
      buttonLabel: "Open PDF",
    },
  ],
  "stress-management:1162890955": [
    {
      title: "Confidence, Charisma & Assertiveness Overview",
      assetModule: require("@/assets/documents/module-resources/Module9/Module-9_sheet1.pdf"),
      description:
        "A summary sheet on confidence, public anxiety, presence, and becoming more authentic under pressure. Use the digital workbook on the module screen for typed, saved exercises.",
      buttonLabel: "Open PDF",
    },
  ],
  "stress-management:1162890996": [
    {
      title: "David JP Phillips TED Talk",
      url: "https://www.youtube.com/watch?v=Iwpi1Lm6dFo",
      description:
        "A practical talk on presentations, visuals, and communicating with more impact.",
    },
    {
      title: "Public Speaking Improvement Tips",
      assetModule: require("@/assets/documents/module-resources/Module9/Public-speaking-improvement-tips.pdf"),
      description:
        "A step-by-step guide to building public-speaking confidence by progressing gradually.",
      buttonLabel: "Open PDF",
    },
  ],
  "stress-management:1162891013": [
    {
      title: "Assertiveness Guide",
      assetModule: require("@/assets/documents/module-resources/Module9/Module-9_sheet2.pdf"),
      description:
        "A support sheet on clearer, more helpful communication and becoming more assertive without becoming aggressive.",
      buttonLabel: "Open PDF",
    },
  ],
  "stress-management:1162891025": [
    {
      title: "Assertiveness Action Plan",
      assetModule: require("@/assets/documents/module-resources/Module9/Assertiveness-action-plan.pdf"),
      description:
        "A structured plan for identifying where you want to be more assertive and how to build that skill.",
      buttonLabel: "Open PDF",
    },
  ],
  "stress-management:1162891034": [
    {
      title: "Assertive Rights",
      assetModule: require("@/assets/documents/module-resources/Module9/Assertive-rights.pdf"),
      description:
        "A reference sheet on the rights you can keep in mind when speaking up more clearly and respectfully.",
      buttonLabel: "Open PDF",
    },
  ],
  "stress-management:1162891058": [
    {
      title: "Confidence Building",
      assetModule: require("@/assets/documents/module-resources/Module9/Confidence-building.pdf"),
      description:
        "A confidence-building exercise to help you become more present, aware, and self-assured.",
      buttonLabel: "Open PDF",
    },
  ],
  "habits:1162891189": [
    {
      title: "4 Questions Reflection Sheet",
      assetModule: require("@/assets/documents/module-resources/Module10/Module-10_sheet1.pdf"),
      description:
        "A self-reflection worksheet to help you clarify what you want and why it matters. Use the digital workbook on the module screen for typed, saved exercises.",
      buttonLabel: "Open PDF",
    },
  ],
  "habits:1162891250": [
    {
      title: "Weekly Key 3",
      assetModule: require("@/assets/documents/module-resources/Module10/Weekly-Key-3.pdf"),
      description:
        "A worksheet for setting the three most important tasks you need to deliver this week.",
      buttonLabel: "Open PDF",
    },
  ],
  "habits:1162891277": [
    {
      title: "Wheel of Life",
      assetModule: require("@/assets/documents/module-resources/Module10/Wheel-of-life.pdf"),
      description:
        "A guided self-assessment to take stock of where you are now and where you want to go.",
      buttonLabel: "Open PDF",
    },
  ],
  "habits:1162891283": [
    {
      title: "Focus Boosters Sheet",
      assetModule: require("@/assets/documents/module-resources/Module10/Module-10_sheet2.pdf"),
      description:
        "A resource on using the 3 R's and other focus boosters to deliver work more consistently.",
      buttonLabel: "Open PDF",
    },
  ],
};
