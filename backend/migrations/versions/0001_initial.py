"""create users and tasks tables"""

from alembic import op
import sqlalchemy as sa

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("email", sa.String(120), nullable=False, unique=True),
        sa.Column("role", sa.String(50), nullable=False),
        sa.Column("password_hash", sa.String(128), nullable=False),
    )
    op.create_table(
        "tasks",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("location", sa.String(200), nullable=True),
        sa.Column("scheduled_date", sa.Date(), nullable=True),
        sa.Column("weather_sensitive", sa.Boolean(), default=False),
        sa.Column("status", sa.String(50), default="pending"),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
    )


def downgrade():
    op.drop_table("tasks")
    op.drop_table("users")