from datetime import datetime

from pydantic import BaseModel, Field, field_serializer

from app.schemas.nutrition import HydrationStatus


class HydrationIn(BaseModel):
    amount_ml: int = Field(ge=1, le=5000)


class HydrationLogOut(BaseModel):
    model_config = {"from_attributes": True}
    id: int
    amount_ml: int
    logged_at: datetime

    @field_serializer("logged_at")
    def _ser(self, v: datetime) -> str:
        return v.isoformat() + "Z"  # stored as naive UTC


class HydrationToday(HydrationStatus):
    entries: list[HydrationLogOut]
