"""agregamoms role a user en models.py

Revision ID: 9b235672c0b8
Revises: 8e04a25dc712
Create Date: 2025-08-28 12:06:20.581674

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9b235672c0b8'
down_revision: Union[str, Sequence[str], None] = '8e04a25dc712'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("role", sa.String(), nullable=True))
    op.execute("UPDATE users SET role='usuario'")
    op.alter_column("users", "role", nullable=False, server_default="usuario")


def downgrade() -> None:
    op.drop_column("users", "role")
