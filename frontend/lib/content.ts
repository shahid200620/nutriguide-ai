import { Apple, CalendarCheck, Camera, Droplets, Dumbbell, Flame, ScanLine, ShieldCheck, Sparkles, UtensilsCrossed } from "lucide-react";

export interface Feature {
  title: string;
  body: string;
  /** One-line version for compact spaces (landing hero panel). */
  short?: string;
  status: "live" | "soon";
  icon: typeof Flame;
}

// "live" = works today. "soon" = on the roadmap, NOT implemented. Keep this honest.
export const FEATURES: Feature[] = [
  { title: "Personalized nutrition", short: "Calorie and macro targets from your profile and goal.", body: "BMI, BMR, TDEE, a daily calorie target and macro targets, calculated from your profile and goal.", status: "live", icon: Flame },
  { title: "Calorie dashboard", short: "Calories consumed and remaining, and macro progress.", body: "Your targets, calories consumed and remaining, macro progress, hydration and meal plan in one place, based on the meals you mark as eaten.", status: "live", icon: Apple },
  { title: "Meal planning", short: "A daily plan for your diet. Mark meals as eaten.", body: "A rule-based daily plan that respects your diet preference and approximates your calorie target. Regenerate it any time, and mark each meal as consumed (with undo).", status: "live", icon: UtensilsCrossed },
  { title: "Hydration tracking", short: "A weight-based water target with quick-add logging.", body: "A weight-based daily water estimate, quick-add buttons and a log you can correct.", status: "live", icon: Droplets },
  { title: "Consistency streaks", short: "A calendar of active days with your current streak.", body: "A calendar of the days you logged a meal or water, with your current and longest streak.", status: "live", icon: CalendarCheck },
  { title: "Private by design", body: "Every record belongs to your account. The server checks ownership on each request, so other users can never read or change your data.", status: "live", icon: ShieldCheck },
  { title: "AI food recognition", body: "Photograph a meal and have a trained detection model identify it. Needs a dataset, training and evaluation first.", status: "soon", icon: Camera },
  { title: "Packaged food scanning", body: "Read nutrition tables from labels with OCR, then confirm before saving.", status: "soon", icon: ScanLine },
  { title: "Workout tracking", body: "Log sessions and connect activity to your nutrition targets.", status: "soon", icon: Dumbbell },
  { title: "ML recommendations", body: "Ranked food suggestions from a model trained on your history. Only shipped after training and evaluation.", status: "soon", icon: Sparkles },
];

export const STEPS: [string, string][] = [
  ["Create an account", "Sign up with your name and email."],
  ["Tell us about you", "Age, height, weight, activity level, diet preference and goal."],
  ["Get your targets", "The server calculates BMI, BMR, TDEE, a calorie target and macros, and stores them."],
  ["Plan and track", "Generate a meal plan, mark meals as eaten, log your water and build a daily streak."],
];
