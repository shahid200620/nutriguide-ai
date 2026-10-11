from datetime import date, datetime

from sqlalchemy import Date, DateTime, Float, ForeignKey, Index, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, utcnow


class MealConsumption(Base):
    """A meal the user actually ate.

    This table is the source of truth for "calories consumed". Nutrition values are a
    SNAPSHOT of the portion eaten (planned value x portion), so the history stays correct even
    if the meal plan is regenerated or deleted afterwards (then meal_plan_item_id becomes NULL).

    The unique constraint on meal_plan_item_id guarantees a planned item can be consumed only
    once, even if two requests arrive at the same time.
    """

    __tablename__ = "meal_consumptions"
    __table_args__ = (
        UniqueConstraint("meal_plan_item_id", name="uq_meal_consumption_plan_item"),
        Index("ix_meal_consumptions_user_day", "user_id", "consumed_on"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    meal_plan_item_id: Mapped[int | None] = mapped_column(
        ForeignKey("meal_plan_items.id", ondelete="SET NULL"), nullable=True
    )
    consumed_on: Mapped[date] = mapped_column(Date)  # the user's LOCAL calendar day the meal belongs to
    consumed_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)  # naive UTC, like every timestamp here
    meal_type: Mapped[str] = mapped_column(String(20))
    food_name: Mapped[str] = mapped_column(String(150))
    serving_size: Mapped[str] = mapped_column(String(100))  # the planned serving label
    portion: Mapped[float] = mapped_column(Float, default=1.0)  # fraction of the planned serving eaten
    calories: Mapped[float] = mapped_column(Float)  # values for the portion eaten
    protein: Mapped[float] = mapped_column(Float)
    carbs: Mapped[float] = mapped_column(Float)
    fat: Mapped[float] = mapped_column(Float)

    plan_item: Mapped["MealPlanItem | None"] = relationship(back_populates="consumption")  # noqa: F821
