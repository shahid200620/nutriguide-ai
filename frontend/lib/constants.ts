import type { ActivityLevel, DietaryPreference, FitnessGoal, Gender, MealType } from "@/types";

type Option<T extends string> = { value: T; label: string; hint?: string };

export const GENDERS: Option<Gender>[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];
export const ACTIVITY_LEVELS: Option<ActivityLevel>[] = [
  { value: "sedentary", label: "Sedentary", hint: "Desk job, little exercise" },
  { value: "lightly_active", label: "Lightly active", hint: "Exercise 1–3 days a week" },
  { value: "moderately_active", label: "Moderately active", hint: "Exercise 3–5 days a week" },
  { value: "very_active", label: "Very active", hint: "Hard exercise 6–7 days a week" },
  { value: "extremely_active", label: "Extremely active", hint: "Physical job plus daily training" },
];
export const DIETS: Option<DietaryPreference>[] = [
  { value: "vegetarian", label: "Vegetarian" },
  { value: "non_vegetarian", label: "Non-vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "eggetarian", label: "Eggetarian" },
];
export const GOALS: Option<FitnessGoal>[] = [
  { value: "fat_loss", label: "Fat loss", hint: "A modest calorie deficit" },
  { value: "muscle_gain", label: "Muscle gain", hint: "A modest calorie surplus" },
  { value: "maintenance", label: "Maintenance", hint: "Stay at your current weight" },
  { value: "general_health", label: "General healthy lifestyle", hint: "Balanced eating, no specific target" },
];

export const MEAL_ORDER: MealType[] = ["breakfast", "lunch", "snack", "dinner"];
export const MEAL_LABELS: Record<MealType, string> = { breakfast: "Breakfast", lunch: "Lunch", snack: "Snack", dinner: "Dinner" };

export const labelOf = <T extends string>(opts: Option<T>[], v: T) => opts.find((o) => o.value === v)?.label ?? v;

export const DISCLAIMER =
  "Nutrition targets are estimates for general wellness and should not replace professional medical or dietary advice.";

export const QUICK_ADD_ML = [250, 500, 750, 1000];
