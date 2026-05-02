"""init

Revision ID: 0001
Revises:
Create Date: 2026-05-02

"""
from typing import Sequence, Union
from alembic import op

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto")

    op.execute("""
        DO $$ BEGIN
            CREATE TYPE user_role AS ENUM ('dador', 'transportista', 'admin');
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$
    """)
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE user_status AS ENUM (
                'pendiente_verificacion', 'verificado', 'suspendido', 'rechazado'
            );
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$
    """)
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE persona_tipo AS ENUM (
                'particular', 'monotributista', 'responsable_inscripto', 'empresa'
            );
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$
    """)

    op.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            telefono VARCHAR(30),
            nombre VARCHAR(100) NOT NULL,
            apellido VARCHAR(100),
            rol user_role NOT NULL,
            status user_status NOT NULL DEFAULT 'pendiente_verificacion',
            avatar_url TEXT,
            email_verificado BOOLEAN DEFAULT FALSE,
            telefono_verificado BOOLEAN DEFAULT FALSE,
            ultimo_login TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )
    """)
    op.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)")
    op.execute("CREATE INDEX IF NOT EXISTS idx_users_rol_status ON users(rol, status)")

    op.execute("""
        CREATE TABLE IF NOT EXISTS transportistas_profiles (
            user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
            cuit VARCHAR(13) UNIQUE NOT NULL,
            razon_social VARCHAR(200),
            tipo persona_tipo NOT NULL,
            domicilio TEXT,
            ciudad VARCHAR(100),
            provincia VARCHAR(100),
            ruta_numero VARCHAR(50),
            ruta_vencimiento DATE,
            radio_operacion_km INT DEFAULT 500,
            bio TEXT,
            rating_promedio DECIMAL(3,2) DEFAULT 0,
            cantidad_viajes INT DEFAULT 0,
            suscripcion_activa BOOLEAN DEFAULT FALSE,
            suscripcion_vence_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )
    """)
    op.execute("CREATE INDEX IF NOT EXISTS idx_transp_provincia ON transportistas_profiles(provincia)")
    op.execute("CREATE INDEX IF NOT EXISTS idx_transp_suscripcion ON transportistas_profiles(suscripcion_activa, suscripcion_vence_at)")

    op.execute("""
        CREATE TABLE IF NOT EXISTS dadores_profiles (
            user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
            cuit_dni VARCHAR(13) NOT NULL,
            razon_social VARCHAR(200),
            tipo persona_tipo NOT NULL,
            sector VARCHAR(100),
            ciudad VARCHAR(100),
            provincia VARCHAR(100),
            cantidad_publicaciones INT DEFAULT 0,
            rating_promedio DECIMAL(3,2) DEFAULT 0,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )
    """)

    op.execute("""
        CREATE TABLE IF NOT EXISTS refresh_tokens (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            token_hash VARCHAR(255) UNIQUE NOT NULL,
            revocado BOOLEAN DEFAULT FALSE,
            expires_at TIMESTAMPTZ NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    """)


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS refresh_tokens")
    op.execute("DROP TABLE IF EXISTS dadores_profiles")
    op.execute("DROP TABLE IF EXISTS transportistas_profiles")
    op.execute("DROP TABLE IF EXISTS users")
    op.execute("DROP TYPE IF EXISTS persona_tipo")
    op.execute("DROP TYPE IF EXISTS user_status")
    op.execute("DROP TYPE IF EXISTS user_role")
