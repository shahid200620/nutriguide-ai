from datetime import date, datetime

from sqlalchemy import Date, DateTime, Float, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, utcnow


class MealPlan(Base):
    __tablename__ = "meal_plans"
    __table_args__ = (UniqueConstraint("user_id", "date", name="uq_meal_plan_user_date"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    date: Mapped[date] = mapped_column(Date)
    daily_calorie_target: Mapped[int] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

    items: Mapped[list["MealPlanItem"]] = relationship(
        back_populates="meal_plan", cascade="all, delete-orphan", order_by="MealPlanItem.id"
    )


class MealPlanItem(Base):
    __tablename__ = "meal_plan_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    meal_plan_id: Mapped[int] = mapped_column(ForeignKey("meal_plans.id", ondelete="CASCADE"), index=True)
    meal_type: Mapped[str] = mapped_column(String(20))
    food_name: Mapped[str] = mapped_column(String(150))
    calories: Mapped[float] = mapped_column(Float)
    protein: Mapped[float] = mapped_column(Float)
    carbs: Mapped[float] = mapped_column(Float)
    fat: Mapped[float] = mapped_column(Float)
    serving_size: Mapped[str] = mapped_column(String(100))

    meal_plan: Mapped[MealPlan] = relationship(back_populates="items")
    # No delete cascade on purpose: deleting/regenerating a plan must NOT erase what the user ate.
    # SQLAlchemy sets consumption.meal_plan_item_id to NULL instead (the DB FK is ON DELETE SET NULL too).
    consumption: Mapped["MealConsumption | None"] = relationship(back_populates="plan_item", uselist=False)  # noqa: F821
