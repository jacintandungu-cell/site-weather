"""add password reset codes"""

from alembic import op
import sqlalchemy as sa


revision = "0003_password_reset_codes"
down_revision = "0002_require_task_owner"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "password_reset_codes",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("code_hash", sa.String(length=64), nullable=False),
        sa.Column("expires_at", sa.DateTime(), nullable=False),
        sa.Column("attempts", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("used_at", sa.DateTime(), nullable=True),
    )


def downgrade():
    op.drop_table("password_reset_codes")