"""init

Revision ID: 0001
Revises:
Create Date: 2026-05-02

"""
from typing import Sequence, Union
import sqlalchemy as sa
from alembic import op

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto")

    op.execute("""
        CREATE TYPE user_role AS ENUM ('dador', 'transportista', 'admin')
    """)
    op.execute("""
        CREATE TYPE user_status AS ENUM (
            'pendiente_verificacion', 'verificado', 'suspendido', 'rechazado'
        )
    """)
    op.execute("""
        CREATE TYPE persona_tipo AS ENUM (
            'particular', 'monotributista', 'responsable_inscripto', 'empresa'
        )
    """)

    op.create_table(
        "users",
        sa.Column("id", sa.UUID(), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("email", sa.String(255), unique=True, nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("telefono", sa.String(30)),
        sa.Column("nombre", sa.String(100), nullable=False),
        sa.Column("apellido", sa.String(100)),
        sa.Column("rol", sa.Enum("dador", "transportista", "admin", name="user_role"), nullable=False),
        sa.Column("status", sa.Enum(
            "pendiente_verificacion", "verificado", "suspendido", "rechazado",
            name="user_status"
        ), nullable=False, server_default="pendiente_verificacion"),
        sa.Column("avatar_url", sa.Text()),
        sa.Column("email_verificado", sa.Boolean(), server_default="false"),
        sa.Column("telefono_verificado", sa.Boolean(), server_default="false"),
        sa.Column("ultimo_login", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )
    op.create_index("idx_users_email", "users", ["email"])
    op.create_index("idx_users_rol_status", "users", ["rol", "status"])

    op.create_table(
        "transportistas_profiles",
        sa.Column("user_id", sa.UUID(), sa.ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("cuit", sa.String(13), unique=True, nullable=False),
        sa.Column("razon_social", sa.String(200)),
        sa.Column("tipo", sa.Enum("particular", "monotributista", "responsable_inscripto", "empresa", name="persona_tipo"), nullable=False),
        sa.Column("domicilio", sa.Text()),
        sa.Column("ciudad", sa.String(100)),
        sa.Column("provincia", sa.String(100)),
        sa.Column("ruta_numero", sa.String(50)),
        sa.Column("ruta_vencimiento", sa.Date()),
        sa.Column("radio_operacion_km", sa.Integer(), server_default="500"),
        sa.Column("bio", sa.Text()),
        sa.Column("rating_promedio", sa.Numeric(3, 2), server_default="0"),
        sa.Column("cantidad_viajes", sa.Integer(), server_default="0"),
        sa.Column("suscripcion_activa", sa.Boolean(), server_default="false"),
        sa.Column("suscripcion_vence_at", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )
    op.create_index("idx_transp_provincia", "transportistas_profiles", ["provincia"])
    op.create_index("idx_transp_suscripcion", "transportistas_profiles", ["suscripcion_activa", "suscripcion_vence_at"])

    op.create_table(
        "dadores_profiles",
        sa.Column("user_id", sa.UUID(), sa.ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("cuit_dni", sa.String(13), nullable=False),
        sa.Column("razon_social", sa.String(200)),
        sa.Column("tipo", sa.Enum("particular", "monotributista", "responsable_inscripto", "empresa", name="persona_tipo"), nullable=False),
        sa.Column("sector", sa.String(100)),
        sa.Column("ciudad", sa.String(100)),
        sa.Column("provincia", sa.String(100)),
        sa.Column("cantidad_publicaciones", sa.Integer(), server_default="0"),
        sa.Column("rating_promedio", sa.Numeric(3, 2), server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )

    op.create_table(
        "refresh_tokens",
        sa.Column("id", sa.UUID(), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", sa.UUID(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("token_hash", sa.String(255), unique=True, nullable=False),
        sa.Column("revocado", sa.Boolean(), server_default="false"),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )


def downgrade() -> None:
    op.drop_table("refresh_tokens")
    op.drop_table("dadores_profiles")
    op.drop_table("transportistas_profiles")
    op.drop_table("users")
    op.execute("DROP TYPE IF EXISTS persona_tipo")
    op.execute("DROP TYPE IF EXISTS user_status")
    op.execute("DROP TYPE IF EXISTS user_role")
