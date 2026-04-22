export const travelerOptions = ["Solo", "Couple", "Family", "Friends"] as const;

export const budgetOptions = ["Shoestring", "Standard", "Luxury"] as const;

export const dietaryOptions = [
  "None",
  "Vegan",
  "Vegetarian",
  "Halal",
  "Gluten-Free"
] as const;

export const vibeOptions = [
  "Chill",
  "Adventure",
  "Culture",
  "Party",
  "Food-focused",
  "Nature",
  "Luxury"
] as const;

export type TravelerOption = (typeof travelerOptions)[number];
export type BudgetOption = (typeof budgetOptions)[number];
export type DietaryOption = (typeof dietaryOptions)[number];
export type VibeOption = (typeof vibeOptions)[number];

const vibeAliasMap: Record<string, VibeOption> = {
  chill: "Chill",
  adventure: "Adventure",
  culture: "Culture",
  party: "Party",
  "food-focused": "Food-focused",
  foodie: "Food-focused",
  urban: "Culture",
  relaxation: "Chill",
  nature: "Nature",
  history: "Culture",
  luxury: "Luxury"
};

export function normalizePlannerVibes(values: unknown): string[] {
  if (!Array.isArray(values)) return [];

  const normalized = values
    .map((value) => String(value || "").trim())
    .map((value) => vibeAliasMap[value.toLowerCase()])
    .filter(Boolean);

  return Array.from(new Set(normalized));
}

export function isBudgetOption(value: unknown): value is BudgetOption {
  return typeof value === "string" && budgetOptions.some((option) => option === value);
}

export function isTravelerOption(value: unknown): value is TravelerOption {
  return typeof value === "string" && travelerOptions.some((option) => option === value);
}

export function isDietaryOption(value: unknown): value is DietaryOption {
  return typeof value === "string" && dietaryOptions.some((option) => option === value);
}

export function getTodayIsoDate() {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
}

export function isPastPlannerDate(dateValue: string) {
  if (!dateValue) return false;
  return dateValue < getTodayIsoDate();
}
