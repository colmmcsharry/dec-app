export type GymRoutineGuideRoute =
  | "/basic-beginner-guide"
  | "/two-day-beginner-guide"
  | "/gzclp-guide";

const ROUTE_BY_ID: Record<string, GymRoutineGuideRoute> = {
  "basic-beginner": "/basic-beginner-guide",
  "two-day-beginner": "/two-day-beginner-guide",
  gzclp: "/gzclp-guide",
};

export function getGymRoutineGuideRoute(id: string): GymRoutineGuideRoute {
  return ROUTE_BY_ID[id] ?? "/basic-beginner-guide";
}
