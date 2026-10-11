"""initial tables

Revision ID: 0001
Revises:
"""
from alembic import op
import sqlalchemy as sa

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.Column("updated_at", sa.DateTime, nullable=False),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "user_profiles",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("age", sa.Integer, nullable=False),
        sa.Column("gender", sa.String(20), nullable=False),
        sa.Column("height_cm", sa.Float, nullable=False),
        sa.Column("weight_kg", sa.Float, nullable=False),
        sa.Column("activity_level", sa.String(30), nullable=False),
        sa.Column("dietary_preference", sa.String(30), nullable=False),
        sa.Column("fitness_goal", sa.String(30), nullable=False),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.Column("updated_at", sa.DateTime, nullable=False),
    )
    op.create_index("ix_user_profiles_user_id", "user_profiles", ["user_id"], unique=True)

    op.create_table(
        "nutrition_targets",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("bmi", sa.Float, nullable=False),
        sa.Column("bmr", sa.Float, nullable=False),
        sa.Column("tdee", sa.Float, nullable=False),
        sa.Column("daily_calorie_target", sa.Integer, nullable=False),
        sa.Column("protein_target", sa.Integer, nullable=False),
        sa.Column("carbs_target", sa.Integer, nullable=False),
        sa.Column("fat_target", sa.Integer, nullable=False),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.Column("updated_at", sa.DateTime, nullable=False),
    )
    op.create_index("ix_nutrition_targets_user_id", "nutrition_targets", ["user_id"], unique=True)

    op.create_table(
        "hydration_logs",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("amount_ml", sa.Integer, nullable=False),
        sa.Column("logged_at", sa.DateTime, nullable=False),
    )
    op.create_index("ix_hydration_logs_user_id", "hydration_logs", ["user_id"])
    op.create_index("ix_hydration_logs_logged_at", "hydration_logs", ["logged_at"])

    op.create_table(
        "meal_plans",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("date", sa.Date, nullable=False),
        sa.Column("daily_calorie_target", sa.Integer, nullable=False),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.UniqueConstraint("user_id", "date", name="uq_meal_plan_user_date"),
    )
    op.create_index("ix_meal_plans_user_id", "meal_plans", ["user_id"])

    op.create_table(
        "meal_plan_items",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("meal_plan_id", sa.Integer, sa.ForeignKey("meal_plans.id", ondelete="CASCADE"), nullable=False),
        sa.Column("meal_type", sa.String(20), nullable=False),
        sa.Column("food_name", sa.String(150), nullable=False),
        sa.Column("calories", sa.Float, nullable=False),
        sa.Column("protein", sa.Float, nullable=False),
        sa.Column("carbs", sa.Float, nullable=False),
        sa.Column("fat", sa.Float, nullable=False),
        sa.Column("serving_size", sa.String(100), nullable=False),
    )
    op.create_index("ix_meal_plan_items_meal_plan_id", "meal_plan_items", ["meal_plan_id"])


def downgrade() -> None:
    for t in ("meal_plan_items", "meal_plans", "hydration_logs", "nutrition_targets", "user_profiles", "users"):
        op.drop_table(t)
