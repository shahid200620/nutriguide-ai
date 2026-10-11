"""
Reusable nutrition calculation service. Pure functions - no database, no HTTP.

Formulas
--------
BMI  = weight_kg / height_m^2
BMR  (Mifflin-St Jeor):
       male   = 10*weight_kg + 6.25*height_cm - 5*age + 5
       female = 10*weight_kg + 6.25*height_cm - 5*age - 161
TDEE = BMR x activity multiplier
Calorie target = TDEE + goal adjustment (never below the configured floor)
Macros: protein = g/kg by goal; fat = share of calories; carbs = remaining calories.
"""
from dataclasses import dataclass
from enum import Enum

from app.services import nutrition_config as cfg


def _v(x) -> str:
    """Accept either an Enum member or its plain string value."""
    return x.value if isinstance(x, Enum) else str(x)


@dataclass(frozen=True)
class MacroTargets:
    protein_g: int
    carbs_g: int
    fat_g: int


@dataclass(frozen=True)
class NutritionResult:
    bmi: float
    bmi_category: str
    bmr: float
    tdee: float
    daily_calorie_target: int
    macros: MacroTargets


def calculate_bmi(weight_kg: float, height_cm: float) -> float:
    height_m = height_cm / 100
    return round(weight_kg / (height_m * height_m), 1)


def bmi_category(bmi: float) -> str:
    for upper, label in cfg.BMI_CATEGORIES:
        if bmi < upper:
            return label
    return cfg.BMI_CATEGORIES[-1][1]


def calculate_bmr(weight_kg: float, height_cm: float, age: int, gender) -> float:
    base = 10 * weight_kg + 6.25 * height_cm - 5 * age
    return round(base + (5 if _v(gender) == "male" else -161), 1)


def calculate_tdee(bmr: float, activity_level) -> float:
    return round(bmr * cfg.ACTIVITY_MULTIPLIERS[_v(activity_level)], 1)


def calculate_calorie_target(tdee: float, goal, gender) -> int:
    target = tdee + cfg.GOAL_CALORIE_ADJUSTMENTS[_v(goal)]
    return int(round(max(target, cfg.MIN_CALORIES[_v(gender)])))


def calculate_macros(weight_kg: float, calories: int, goal) -> MacroTargets:
    protein_g = round(weight_kg * cfg.PROTEIN_G_PER_KG[_v(goal)])
    fat_g = round(calories * cfg.FAT_CALORIE_SHARE / cfg.KCAL_PER_G["fat"])
    remaining = calories - protein_g * cfg.KCAL_PER_G["protein"] - fat_g * cfg.KCAL_PER_G["fat"]
    carbs_g = max(0, round(remaining / cfg.KCAL_PER_G["carbs"]))
    return MacroTargets(protein_g=protein_g, carbs_g=carbs_g, fat_g=fat_g)


def calculate_hydration_target_ml(weight_kg: float) -> int:
    raw = weight_kg * cfg.HYDRATION_ML_PER_KG
    clamped = min(max(raw, cfg.HYDRATION_MIN_ML), cfg.HYDRATION_MAX_ML)
    step = cfg.HYDRATION_ROUND_TO_ML
    return int(round(clamped / step) * step)


def calculate_all(*, age: int, gender, height_cm: float, weight_kg: float, activity_level, fitness_goal) -> NutritionResult:
    bmi = calculate_bmi(weight_kg, height_cm)
    bmr = calculate_bmr(weight_kg, height_cm, age, gender)
    tdee = calculate_tdee(bmr, activity_level)
    calories = calculate_calorie_target(tdee, fitness_goal, gender)
    macros = calculate_macros(weight_kg, calories, fitness_goal)
    return NutritionResult(bmi, bmi_category(bmi), bmr, tdee, calories, macros)
