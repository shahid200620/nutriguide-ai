"""meal consumption records (mark planned meals as eaten)

Revision ID: 0002
Revises: 0001
"""
from alembic import op
import sqlalchemy as sa

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "meal_consumptions",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("meal_plan_item_id", sa.Integer, sa.ForeignKey("meal_plan_items.id", ondelete="SET NULL"), nullable=True),
        sa.Column("consumed_on", sa.Date, nullable=False),
        sa.Column("consumed_at", sa.DateTime, nullable=False),
        sa.Column("meal_type", sa.String(20), nullable=False),
        sa.Column("food_name", sa.String(150), nullable=False),
        sa.Column("serving_size", sa.String(100), nullable=False),
        sa.Column("portion", sa.Float, nullable=False, server_default="1"),
        sa.Column("calories", sa.Float, nullable=False),
        sa.Column("protein", sa.Float, nullable=False),
        sa.Column("carbs", sa.Float, nullable=False),
        sa.Column("fat", sa.Float, nullable=False),
        sa.UniqueConstraint("meal_plan_item_id", name="uq_meal_consumption_plan_item"),
    )
    op.create_index("ix_meal_consumptions_user_id", "meal_consumptions", ["user_id"])
    op.create_index("ix_meal_consumptions_user_day", "meal_consumptions", ["user_id", "consumed_on"])


def downgrade() -> None:
    op.drop_index("ix_meal_consumptions_user_day", table_name="meal_consumptions")
    op.drop_index("ix_meal_consumptions_user_id", table_name="meal_consumptions")
    op.drop_table("meal_consumptions")
