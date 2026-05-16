"""transportista: recorridos, tipos_contenido, especificaciones

Revision ID: 0003
Revises: 0002
Create Date: 2026-05-16

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "0003"
down_revision: Union[str, None] = "0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("transportistas_profiles", sa.Column("recorridos_descripcion", sa.Text(), nullable=True))
    op.add_column("transportistas_profiles", sa.Column("tipos_contenido", sa.Text(), nullable=True))
    op.add_column("transportistas_profiles", sa.Column("especificaciones", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("transportistas_profiles", "especificaciones")
    op.drop_column("transportistas_profiles", "tipos_contenido")
    op.drop_column("transportistas_profiles", "recorridos_descripcion")
