from datetime import date as date_type
from datetime import datetime

from pydantic import BaseModel, Field, field_serializer, field_validator

from app.core.enums import MealType
from app.services.consumption_service import PORTION_STEP


class ConsumeIn(BaseModel):
    meal_plan_item_id: int
    portion: float = Field(default=1.0, ge=0.25, le=3.0, description="Fraction of the planned serving eaten.")

    @field_validator("portion")
    @classmethod
    def _step(cls, v: float) -> float:
        if (v / PORTION_STEP) != round(v / PORTION_STEP):
            raise ValueError("Portion must be a multiple of 0.25.")
        return v


class ConsumptionOut(BaseModel):
    model_config = {"from_attributes": True}
    id: int
    meal_plan_item_id: int | None
    consumed_on: date_type
    consumed_at: datetime
    meal_type: MealType
    food_name: str
    serving_size: str
    portion: float
    calories: float
    protein: float
    carbs: float
    fat: float

    @field_serializer("consumed_at")
    def _ser(self, v: datetime) -> str:
        return v.isoformat() + "Z"  # stored as naive UTC


class ConsumedTotals(BaseModel):
    calories: int
    protein: float
    carbs: float
    fat: float
    meals: int


class DayConsumption(BaseModel):
    date: date_type
    entries: list[ConsumptionOut]
    totals: ConsumedTotals
