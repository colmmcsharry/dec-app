/** Module summary reading sections (formerly workbook course content). */

export interface ModuleSummarySection {
  heading: string;
  body: string;
  /** Optional in-app navigation link shown below the body text. */
  link?: {
    label: string;
    route: string;
  };
}

export const MODULE_SUMMARIES: Record<string, ModuleSummarySection[]> = {
  sleep: [
    {
      heading: "Myth Busting",
      body: "Sleep is not a luxury but a necessity for prolonged peak performance. Why else would Roger Federer be sleeping 10 hours per night and playing top level tennis at 40?\n\nLuckily for us—as we may not have the lifestyle where 10 hours of sleep is possible—there are also ways to improve our sleep quality which will enable us to perform better and feel more energised.\n\nIf you suffer from a chronic lack of sleep, the research shows that we actually stop recognising the negative impact it has on performance.",
    },
    {
      heading: "Useful Thought Experiments",
      body: "Do you need an alarm to wake you? Do you fall asleep in front of the TV? Does a low dose of alcohol make you feel drowsy? Does a warm room make you sleepy? Do you feel like nodding off in a boring meeting?\n\nThe more you answer yes, the more sleep-deprived you are.\n\nThe last time you were on holiday, can you remember how long you slept each night? This is a good indicator of your ideal sleep length. If you can't remember, trial this on your next holiday—but use the second night's sleep as your barometer, as the first is often a 'catch up' sleep.",
    },
    {
      heading: "Important New Outlook",
      body: "Improving your quantity and quality of sleep begins a lot earlier in the day than most of us recognise. Simple decisions like trying to move more, eat better and access sunlight all have a significant role to play.\n\nAudit your evening with the exercise in the workbook to see where your time sinks are that stop you getting to bed earlier—e.g. you might notice 30 minutes of Facebook newsfeed browsing every evening that can be eliminated.",
    },
    {
      heading: "Sleep Cave & Runway",
      body: "Have you taken action to ensure where you sleep is dark, cool, quiet, clean and cosy? Investments from cheaper to more expensive: ear plugs, face mask, white noise machine, comfy linens and PJs, blackout blinds, soundproof windows.\n\nTry and get that room temperature around 18°C for optimal sleep.\n\nTry and make the last hour before bed something you look forward to by incorporating pleasurable things like scent (candles or diffuser), reading, stretching or deep breathing, but NOT looking at bright screens.",
    },
  ],
  "morning-routines": [
    {
      heading: "Myth Busting",
      body: "A good start is more than half the battle. Many of you might think that you have a missing ingredient from your morning routine in order to arrive at the office like 'annoyingly chirpy' early bird Alice. However, we will begin this journey with a different outlook.\n\nThe Dalai Lama describes the pursuit of happiness as not only pursuing the things that make us happy but eliminating the things which make us unhappy. We often make the mistake in the Western world of overly focusing on the former outlook—we will take the Dalai Lama's advice by placing more importance on what we can cut from your morning routine which is causing stress.\n\nResearch shows that cutting the usual (alarming) news from the earliest part of your day and replacing it with a more empowering/uplifting news clip gives you an 88% greater likelihood of reporting a good day 8 hours later. Mull over that for a few moments.",
    },
    {
      heading: "Useful Thought Experiments",
      body: "Are you making the morning process more difficult than it needs to be? Do you always put your keys back in the same place? Could you prepare your overnight oats the evening before? A successful morning routine looks to minimise decisions and distractions to keep energy stores nice and high.\n\nAngela Merkel, Barack Obama and Mark Zuckerberg all reduced their wardrobe options—eliminating yet another decision from their mornings.\n\nIf you want to get up earlier, ask yourself: if I had an hour which nobody else had in the morning but I had to use it on a passion project, what would it be? Even 15 minutes a day adds up to something amazing.",
    },
    {
      heading: "What To Cut Out?",
      body: "Three things to cut out as much as possible: an alarming alarm, social media/email and news.\n\nConsider a dawn simulator or linking a nice song via Bluetooth as your alarm—an infinitely more pleasurable way to wake up. Email and social media make us feel immediately under pressure, like time is shrinking with many decisions to make—this is energy depleting.\n\nAccording to IDC research, 80% of smartphone users check their phones within 15 minutes of waking up. Could these moments be spent more positively and productively?",
    },
    {
      heading: "Meaningful Few Things To Include",
      body: "Think in terms of MMM's—movement, mindfulness and motivation. It could be as simple as dedicating 5 minutes to just one of these.\n\nAmy Cuddy's research shows that stretching our arms out and expanding our physical space influences our feelings and thoughts, making us more positive.\n\nBefore launching into your day, rate the tasks you would like to complete on a scale of importance—where it is unclear, ask yourself a question based around a key determinant, e.g. 'how much does this task contribute to my promotion prospects?'",
    },
  ],
  "energy-management": [
    {
      heading: "Myth Busting",
      body: "We are limited to 2–3 high-potential hours per day. Many people suffer from hubris by believing their high-potential hours are infinite. All our energy levels fluctuate so we need to match tasks to the energy levels most suitable to them—e.g. easier admin during lower-potential hours.\n\nSaying 'yes' all the time is positive? Actually not. By learning to say 'no' strategically we protect our calendars and energy. It can also exchange popularity for respect.\n\nThere is a false belief that motivation is necessary for action. The truth: we need to do things even when unmotivated—often motivation follows after the initial forced action.",
    },
    {
      heading: "Useful Thought Experiments",
      body: "Am I matching my high-potential hours to my high-focus tasks? Consider blocking them in your calendar.\n\nCould I keep energy levels topped up better? Leverage exercise, breaks, healthy food and napping. Google, Zappos and Nike embrace napping facilities because they recognise a productivity return—research shows it can increase focus, ideally 6–7.5 hours after waking.\n\nAm I procrastinating because this task scares me, seems boring, or is unclear? Once you identify why, you can build willpower to act.",
    },
    {
      heading: "Protecting Your Calendar",
      body: "If you're committing too easily to events and meetings, start using a stock phrase like 'let me check my calendar and get back to you'. This saves you from time-wasting commitments you will later regret.\n\nAvoid time-wasting meetings with clear goals, agendas, and flexibility to let pressed speakers deliver their parts and leave.",
    },
    {
      heading: "Dealing With Distraction",
      body: "Internal distractions like buying things on Amazon or checking last night's scores can be boxed off to a certain point in your day. External distractions like a colleague popping over can be handled: 'sure I can help but I'm in the middle of something important—can I come find you in 20 minutes?'\n\nCognitive distortions like multitasking masquerade as productive—but Vanderbilt University research shows it leads to a 30% delay in work completion with twice as many errors.",
    },
    {
      heading: "Your Email Cheatsheet",
      body: "Enter your inbox with a mindset of action, not curiosity. Treat emails as:\n\n• Reply if it takes less than 2 minutes\n• Put in @Action folder if it needs more thought (reply briefly to say thanks)\n• Put in @WaitingFor folder if you're in CC or tracking\n• Delete or file if not relevant\n\nBe ruthless with unsubscribe. Install Boomerang to pause your inbox. Create a personalised signature. Save reusable templates.",
    },
  ],
  mindfulness: [
    {
      heading: "Myth Busting",
      body: "Creativity is for artists? Creativity is actually for anybody who needs solutions to everyday issues.\n\nCreativity is genetic? Not true—the best creative solutions come from those bold enough to believe there is a better way.\n\nNot allowing breaks will result in quicker solutions? Simply not true. We often hit an impasse and working through it just for completion can hold us back from excellent work.\n\nIf a difficult conversation scares us, we should avoid it? This is a mistake—by overemphasising short-term emotions we may cause ourselves great anxiety long-term.",
    },
    {
      heading: "Useful Thought Experiments for Better Decisions",
      body: "For a difficult decision needing a quick response: what would I advise my friend to do given all the details?\n\nIf you're avoiding an important conversation: how will I feel 10 minutes, 10 months, and 10 years after having this conversation?\n\nIf there appear to be only 2 options on the table: am I missing a creative third solution?\n\nWhen pressed to buy something: do I feel completely comfortable? Could I give myself a few hours to reassess? German researchers showed we are better at spotting liars once we step out of the situation.",
    },
    {
      heading: "What To Do When You Hit A Creative Impasse",
      body: "Give yourself permission to step away. Beethoven went for walks, Einstein played the violin, Woody Allen took showers—to spike productivity and creative thinking.\n\nWalking outdoors is optimal for creative thinking—new inputs while moving, reduced stress, elevated wellbeing.\n\nPlaces like bars, cafés and large spaces (museums) can help—a low dose of background noise supports diffuse attention which stops us zeroing in on minutiae.",
    },
  ],
  "move-2-perform": [
    {
      heading: "Myth Busting",
      body: "Downtime is a luxury? Complete fallacy—to perform over a sustained period without burnout we need to take downtime every bit as seriously as work.\n\nNot taking holidays helps promotion prospects? In the US, people who take all their holiday days versus those who left 11+ unused were still 7% more likely to get promoted.\n\nWorking longer means getting more done? We reach diminishing returns when thinking halts, motivation dips, and mistakes increase. On average, the tipping point is around 50 hours per week.",
    },
    {
      heading: "Downtime In The Evening",
      body: "Avoid or strictly moderate: online shopping, web surfing, and TV bingeing—they deplete rejuvenation and morale.\n\nInclude activities (great if they involve others): family rituals, movement like a jog with a friend, and reading (a proven stress reliever). It's much easier to go from 100 km/h at the office to 60 km/h in a different direction at home.\n\nBe deliberate about not allowing email or phones to take over your evening. Smartphone use has been shown to make us more selfish and deplete quality of interactions.",
    },
    {
      heading: "Downtime On Weekends",
      body: "Try not to let chores take over by considering outsourcing things like shopping or cleaning—or do them during high-potential hours when freshest.\n\nPlan your weekend earlier in the week so it's not left to the last minute.\n\nArt Aron found that couples still passionately in love after many years threw themselves into hobbies together—the weekend is a good opportunity for hiking or salsa with your partner.",
    },
    {
      heading: "Downtime On Holidays",
      body: "Many positive vibes from holidays come from the planning phase—dedicate good quality time to this.\n\nPlan exciting activities (lovely meals, a ski class, a hike, wine tasting) to accumulate great memories—it will feel longer in hindsight.\n\nHolidays offer a good opportunity to be a visitor, not just a tourist—immerse yourself in a new culture.\n\nLeaving a one-day runway (return home day off) can really reduce stress around your holiday.",
    },
  ],
  "thinking-2-perform": [
    {
      heading: "Myth Busting",
      body: "Mindfulness and meditation are long and boring? Completely untrue. Mindfulness is a way of living—turning focus and attention to the inner and outer world in the present moment.\n\nMy thoughts are all real? Simply not true. Sometimes we call ourselves terrible things like 'you're a loser', but we can challenge this by forcing ourselves to define a loser and think of a time we did something correctly.\n\nHigh performers have a higher level of positive thinking I'll never tap into? Not true—we can retrain our minds to frame scenarios as opportunities to grow.",
    },
    {
      heading: "Self-Talk",
      body: "If you talk to yourself in a way that you would never allow yourself to talk to a friend, you need to work on your self-talk. Negative self-talk affects how we look, feel and behave.\n\nGo through the distorted types of thinking in the module and use them to identify future negative patterns. Then think: how could I talk back to this thought in a more optimal way?\n\nExample: changing 'I should lose weight' to 'I could lose weight'—working from self-determination instead of guilt.",
    },
    {
      heading: "Framing",
      body: "Top performers work through adversity with powerful framing. 75% of job successes are predicted by optimism levels, social support, and an ability to frame stress as a challenge, not a threat.\n\nMusician Eimear McGeown told negative thoughts to go away and come back later before big performances.\n\nPat Spillane used negative media to say 'I'll prove them wrong' and positive media to say 'I'll prove them right'—win-win thinking.",
    },
    {
      heading: "Mindfulness",
      body: "Mindfulness is defined by expert Padraig O'Morain as 'returning, with acceptance, to what your senses are bringing you.'\n\nIt's simply noticing things you used to let float into the background—the feel of your footsteps, the smell of flowers, the freshness of wind on your face.\n\nIt helps us not focus on past injustices by inflicting the 'double arrow'—the first being the event itself, the second being the arrow we inflict by replaying incidents over and over.",
    },
  ],
  recovery: [
    {
      heading: "Myth Busting",
      body: "Work and physical activity are mutually exclusive? Not true—when we step away for a quick walk or stretch, we benefit from 'task reorientation' and return to work with fresh, clearer eyes.\n\n5,000 steps or less per day is sedentary behaviour—linked with 35 chronic health conditions. 75 minutes per week of brisk walking could add almost two more years to your life. Get moving!",
    },
    {
      heading: "The Habit Loop",
      body: "Relying on willpower and motivation for exercise is a bad idea—these are finite. Creating it into a habit like washing your teeth is a much better strategy.\n\nRemember the 3 R's:\n• Reminder: e.g. a calendar reminder at 10:55 AM to get up and stretch\n• Routine: what stretching movements or stroll you will do\n• Reward: appreciate the benefit—feeling spritelier and less tense",
    },
    {
      heading: "Make It Fun",
      body: "Exercise doesn't have to be long and arduous—as little as 20 minutes is enough for much of the benefit.\n\nWhat exercise, movement or physical activities do you enjoy? Basing exercise around what you enjoy makes it infinitely easier. If you enjoy very little, pair stretching with a TV programme.\n\nFind accountability—it's much harder to give up on a friend or coach than on yourself.",
    },
    {
      heading: "Silly Little Efforts Make A Big Difference",
      body: "Do not underestimate the power of mini habits. 3 minutes of stretching your hips in the morning could result in a lot more comfort as you age.\n\nBuild a new habit: see the elevator as a death trap and take the stairs the majority of the time.\n\nHow to start: 1) Start small (one push-up a day) 2) Take ownership—stop saying 'I don't have time' and admit 'I'm choosing not to give it my time' 3) Make it easy—leave your yoga mat in view 4) Use the 3 R's consistently.",
    },
    {
      heading: "Gym Routines & Strength Targets",
      body: "You'll find gym routines and strength/fitness targets in the Resources section — From Beginner to Advanced.",
      link: {
        label: "Go to Resources",
        route: "/(tabs)/resources",
      },
    },
  ],
  "fuel-2-perform": [
    {
      heading: "Myth Busting",
      body: "Eating to live longer will be enough motivation? It's better to eat for short-term productivity—a healthy super food salad at lunch to stay at the top of your game for an important afternoon.\n\nFat makes you fat? We need between 15–35% of total calorie intake from fat—it's important for healthy immune function and absorbing certain vitamins.",
    },
    {
      heading: "The Triangle of Focus",
      body: "Do you want mostly performance, health, or body composition? Perhaps somewhere in the middle of all three?\n\nWhat you eat, how much you eat and when you eat should be tailored towards your life goals—e.g. a marathon-training office worker needs more carbohydrates than a sedentary one.\n\nFor weight loss, you need a calorie deficit. For a generally healthy lifestyle, consider ethically sourced foods and a Vitamin D3 supplement in winter.",
    },
    {
      heading: "Transforming Principles",
      body: "Track your food for some period—using an app, notes on your phone, or pen and paper. Note the effect food decisions have on you—e.g. 'I feel constantly sluggish after an Irish fry for breakfast.'\n\nSurround yourself with good food. Cornell University found people with breakfast cereals on their counters weighed 20 lbs more than those who didn't—while those with a fruit bowl out weighed nearly 13 lbs less.\n\nTarget simple swaps that work for you and your goal.",
    },
    {
      heading: "Reconnect With Your Food",
      body: "Eating mindfully can improve digestion and reduce unnecessary eating.\n\n• Have one meal a week on your own and eat slower (chew more)\n• Start with a mindful tea—really feel the warm mug and soothing liquid\n• Don't eat and send emails or read memos—this adds stress\n• Take the first few minutes of a nice meal to appreciate the flavours and those who prepared it",
    },
  ],
  "stress-management": [
    {
      heading: "Myth Busting",
      body: "Feeling anxious in public settings is unique to me? This is one of the most common sources of anxiety in the world. You are not alone!\n\nWe fear people's reactions when we communicate our needs clearly—but the more we conceal them, the more painful life can be.\n\nCharisma is a god-given gift? Think about a friend with whom you're completely yourself—that's an example of your unique charisma, unfiltered.",
    },
    {
      heading: "Speaking Confidently",
      body: "We are all on a different point of the journey. Baby steps matter: small talk with your boss → suggesting an improvement → requesting an appraisal → leading a meeting → speaking at a conference.\n\nLearn from musician Eimear McGeown who used the 3 P's: Plan (organise practices), Prepare (execute meticulously), Perform (take confidence knowing you've done your best in the lead up).",
    },
    {
      heading: "Your Unique Charisma",
      body: "We don't need alcohol to be ourselves—it involves being a little more vulnerable in communication with potentially great returns.\n\nStart by: smiling at people more (puts them at ease), a firm handshake, and having pre-prepared conversation openers.\n\nOpen up conversations with good questions. If someone says their weekend was 'just ok', pry further: 'do you like those boring kinds of weekends?' This lets them open up.",
    },
    {
      heading: "Assertiveness",
      body: "Sometimes we're too quick to go for impulsive, unhelpful communication—e.g. receiving a compliment about your suit: 'ah this aul thing' instead of 'thanks, I really like it too.' The latter is much more self-appreciating.\n\nWhen overwhelmed at work, try: 'I'm at capacity right now so can't do this task unless we can discuss moving something else down on the priority list.'\n\nRemember your assertive rights: the right to ask for what you want, to express opinions, to say no, to change your mind, to make mistakes, and to be successful and acknowledge it.",
    },
  ],
  habits: [
    {
      heading: "All Begins With 4 Questions",
      body: "1. What do I really want from my life? You'd be amazed how many people never ask themselves this.\n\n2. What am I willing to give up to get there? People know what they want but aren't willing to give up their social life, for example.\n\n3. How will I set my mind to this? Do you have a plan to ensure you mentally stick? Pat Spillane used visualisation on the way to football matches.\n\n4. What's my next action? Amazingly, some people get through the first three questions and then don't take enough positive, assertive action.",
    },
    {
      heading: "4 Spheres",
      body: "Think in ink—write down your goal using SMART or OKR models. Fail to plan then plan to fail.\n\nLike a horse running a race, keep your blinkers on—install social media blocking apps, turn off notifications, lock yourself away for 2–3 hours of highly focused work.\n\nHave in-built reviews to assess whether you're on course, need help, and can course-correct.\n\nKeep it to one main goal for each of the four spheres: family, extracurricular, work, and personal. Neglect any sphere for too long and imbalance follows.",
    },
    {
      heading: "Focus For Success Boosters",
      body: "Use the 3 R's for work quality: Receive the task requirements clearly (ask clarifying questions if unclear), Review the resources at your disposal, then Respond with action.\n\nDedicate time to meditation—it helps you focus on one thing for a prolonged period, with crossover benefits to your work.\n\nAllow yourself occasional rewards—hit a milestone and treat yourself to a lovely latté, enjoyed mindfully and peacefully.",
    },
  ],
};
