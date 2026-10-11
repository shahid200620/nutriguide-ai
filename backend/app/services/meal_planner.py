"""
Rule-based meal planner (NOT machine learning).

Algorithm
---------
1. Split the daily calorie target across meals (MEAL_CALORIE_SHARE).
2. For each meal, draw one food per slot from the catalog, keeping only foods the
   user's dietary preference allows.
3. Scale the portion of all foods in the meal by a common factor so the meal
   approximates its calorie share (factor is clamped and snapped to 0.25 steps).
Output is approximate. Phase 6 will replace this with a trained, evaluated model.
"""
import random
from dataclasses import dataclass

from app.services.food_catalog import DIET_ALLOWS, MEAL_TEMPLATES, Food

MEAL_CALORIE_SHARE = {"breakfast": 0.25, "lunch": 0.35, "snack": 0.10, "dinner": 0.30}
MIN_PORTION, MAX_PORTION, PORTION_STEP = 0.5, 2.5, 0.25
CANDIDATES_PER_MEAL = 10
ACCEPTABLE_ERROR = 0.10


@dataclass
class PlannedItem:
    meal_type: str
    food_name: str
    serving_size: str
    calories: float
    protein: float
    carbs: float
    fat: float


def _snap(x: float) -> float:
    x = min(max(x, MIN_PORTION), MAX_PORTION)
    return round(x / PORTION_STEP) * PORTION_STEP


def _fmt(x: float) -> str:
    return f"{x:g}"


def _scale_meal(foods: list[Food], target_kcal: float) -> tuple[float, float]:
    base = sum(f[2] for f in foods)
    factor = _snap(target_kcal / base)
    return factor, abs(base * factor - target_kcal) / target_kcal


def _pick_meal(meal_type: str, diet: str, target_kcal: float, rng: random.Random) -> list[PlannedItem]:
    allowed = DIET_ALLOWS[diet]
    slots = [[f for f in slot if f[6] in allowed] for slot in MEAL_TEMPLATES[meal_type]]

    candidates = []
    for _ in range(CANDIDATES_PER_MEAL):
        foods = [rng.choice(slot) for slot in slots if slot]
        if foods:
            candidates.append((foods, *_scale_meal(foods, target_kcal)))

    good = [c for c in candidates if c[2] <= ACCEPTABLE_ERROR]
    foods, factor, _ = rng.choice(good) if good else min(candidates, key=lambda c: c[2])

    return [
        PlannedItem(
            meal_type=meal_type,
            food_name=f[0],
            serving_size=f"{_fmt(factor)} x {f[1]}" if factor != 1 else f[1],
            calories=round(f[2] * factor),
            protein=round(f[3] * factor, 1),
            carbs=round(f[4] * factor, 1),
            fat=round(f[5] * factor, 1),
        )
        for f in foods
    ]


def generate_plan(daily_calorie_target: int, dietary_preference: str, rng: random.Random | None = None) -> list[PlannedItem]:
    rng = rng or random.Random()
    items: list[PlannedItem] = []
    for meal_type, share in MEAL_CALORIE_SHARE.items():
        items.extend(_pick_meal(meal_type, dietary_preference, daily_calorie_target * share, rng))
    return items
