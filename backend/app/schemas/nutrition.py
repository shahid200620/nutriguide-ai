from datetime import datetime

from pydantic import BaseModel

from app.schemas.consumption import ConsumedTotals
from app.schemas.meal_plan import MealPlanOut
from app.schemas.profile import ProfileOut
from app.services.nutrition_config import DISCLAIMER


class NutritionTargetsOut(BaseModel):
    model_config = {"from_attributes": True}
    bmi: float
    bmi_category: str = ""
    bmr: float
    tdee: float
    daily_calorie_target: int
    protein_target: int
    carbs_target: int
    fat_target: int
    updated_at: datetime
    disclaimer: str = DISCLAIMER


class HydrationStatus(BaseModel):
    target_ml: int
    consumed_ml: int
    remaining_ml: int
    percent: int
    is_estimate: bool = True


class CalorieStatus(BaseModel):
    target: int
    consumed: int
    remaining: int  # target - consumed; negative means the user is over target
    food_logging_available: bool = True  # meals marked as consumed in the planner


class NutritionSummary(BaseModel):
    user_name: str
    profile: ProfileOut
    targets: NutritionTargetsOut
    calories: CalorieStatus
    consumed: ConsumedTotals  # calories + macros eaten on the requested day
    hydration: HydrationStatus
    meal_plan: MealPlanOut | None
