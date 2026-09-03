"""require every task to have an owner"""

from alembic import op

revision = "0002_require_task_owner"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("tasks") as batch_op:
        batch_op.alter_column("user_id", nullable=False)


def downgrade():
    with op.batch_alter_table("tasks") as batch_op:
        batch_op.alter_column("user_id", nullable=True)