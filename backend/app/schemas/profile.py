from datetime import datetime

from pydantic import BaseModel, Field

from app.core.enums import ActivityLevel, DietaryPreference, FitnessGoal, Gender


class ProfileIn(BaseModel):
    age: int = Field(ge=13, le=100)
    gender: Gender
    height_cm: float = Field(ge=100, le=250)
    weight_kg: float = Field(ge=25, le=300)
    activity_level: ActivityLevel
    dietary_preference: DietaryPreference
    fitness_goal: FitnessGoal


class ProfileOut(ProfileIn):
    model_config = {"from_attributes": True}
    id: int
    user_id: int
    updated_at: datetime
