from datetime import date as date_type

from pydantic import BaseModel, Field, computed_field

from app.core.enums import MealType
from app.schemas.consumption import ConsumptionOut


class MealPlanItemOut(BaseModel):
    model_config = {"from_attributes": True}
    id: int
    meal_type: MealType
    food_name: str
    serving_size: str
    calories: float
    protein: float
    carbs: float
    fat: float
    consumption: ConsumptionOut | None = None  # set once the user marks this item as eaten


class MealPlanOut(BaseModel):
    model_config = {"from_attributes": True}
    id: int
    date: date_type
    daily_calorie_target: int
    items: list[MealPlanItemOut]
    generator: str = "rule_based"  # not ML - see services/meal_planner.py

    @computed_field
    @property
    def total_calories(self) -> float:
        return round(sum(i.calories for i in self.items))

    @computed_field
    @property
    def total_protein(self) -> float:
        return round(sum(i.protein for i in self.items), 1)

    @computed_field
    @property
    def total_carbs(self) -> float:
        return round(sum(i.carbs for i in self.items), 1)

    @computed_field
    @property
    def total_fat(self) -> float:
        return round(sum(i.fat for i in self.items), 1)


class GenerateMealPlanRequest(BaseModel):
    date: date_type | None = Field(default=None, description="Local date; defaults to server UTC today.")
