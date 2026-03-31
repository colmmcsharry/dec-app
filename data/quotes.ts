export interface DailyQuote {
  text: string;
  author: string;
}

export const DAILY_DIESEL_QUOTES: DailyQuote[] = [
  {
    text: "Be kind to those you meet on the way up…you could easily meet them on your way down.",
    author: "Daily Diesel",
  },
  {
    text: "Don't burn your bridges — think you may need to retrace your steps.",
    author: "Daily Diesel",
  },
  {
    text: "The fact you washed your face this morning doesn't mean you won't have to do the same tomorrow.",
    author: "Daily Diesel",
  },
  {
    text: "If you are going through hell — don't stop — keep going.",
    author: "Winston Churchill",
  },
  {
    text: "Even though good times don't last — remember neither do bad times or acute distress.",
    author: "Daily Diesel",
  },
];

export function getQuoteOfTheDay(date: Date = new Date()): DailyQuote {
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return DAILY_DIESEL_QUOTES[dayOfYear % DAILY_DIESEL_QUOTES.length];
}
