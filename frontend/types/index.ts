export type Gender = "male" | "female";
export type ActivityLevel = "sedentary" | "lightly_active" | "moderately_active" | "very_active" | "extremely_active";
export type DietaryPreference = "vegetarian" | "non_vegetarian" | "vegan" | "eggetarian";
export type FitnessGoal = "fat_loss" | "muscle_gain" | "maintenance" | "general_health";
export type MealType = "breakfast" | "lunch" | "snack" | "dinner";

export interface User {
  id: number;
  name: string;
  email: string;
  profile_complete: boolean;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface UserProfileInput {
  age: number;
  gender: Gender;
  height_cm: number;
  weight_kg: number;
  activity_level: ActivityLevel;
  dietary_preference: DietaryPreference;
  fitness_goal: FitnessGoal;
}

export interface UserProfile extends UserProfileInput {
  id: number;
  user_id: number;
  updated_at: string;
}

export interface NutritionTargets {
  bmi: number;
  bmi_category: string;
  bmr: number;
  tdee: number;
  daily_calorie_target: number;
  protein_target: number;
  carbs_target: number;
  fat_target: number;
  updated_at: string;
  disclaimer: string;
}

export interface HydrationLog {
  id: number;
  amount_ml: number;
  logged_at: string;
}

export interface HydrationToday {
  target_ml: number;
  consumed_ml: number;
  remaining_ml: number;
  percent: number;
  is_estimate: boolean;
  entries: HydrationLog[];
}

/** A meal the user marked as eaten. Nutrition values are for the portion actually eaten. */
export interface ConsumptionRecord {
  id: number;
  meal_plan_item_id: number | null; // null once the plan it came from was regenerated or deleted
  consumed_on: string; // local calendar day, YYYY-MM-DD
  consumed_at: string; // ISO UTC
  meal_type: MealType;
  food_name: string;
  serving_size: string;
  portion: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface ConsumedTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meals: number;
}

export interface DayConsumption {
  date: string;
  entries: ConsumptionRecord[];
  totals: ConsumedTotals;
}

export interface MealPlanItem {
  id: number;
  meal_type: MealType;
  food_name: string;
  serving_size: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  consumption: ConsumptionRecord | null;
}

export interface MealPlan {
  id: number;
  date: string;
  daily_calorie_target: number;
  generator: string;
  items: MealPlanItem[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
}

export interface NutritionSummary {
  user_name: string;
  profile: UserProfile;
  targets: NutritionTargets;
  /** remaining = target - consumed; negative when the user is over target. */
  calories: { target: number; consumed: number; remaining: number; food_logging_available: boolean };
  consumed: ConsumedTotals;
  hydration: Omit<HydrationToday, "entries">;
  meal_plan: MealPlan | null;
}

export interface ActivityDay {
  date: string; // local calendar day, YYYY-MM-DD
  active: boolean;
  meals: number;
  hydration: number;
}

export interface StreakSummary {
  today: string;
  rule: string;
  current_streak: number;
  longest_streak: number;
  today_active: boolean;
  window_days: number;
  active_days: number;
  total_active_days: number;
  days: ActivityDay[]; // oldest -> newest; last item is today
}
