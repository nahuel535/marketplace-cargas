"""vehiculos y documentos

Revision ID: 0002
Revises: 0001
Create Date: 2026-05-02

"""
from typing import Sequence, Union
from alembic import op

revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE vehiculo_tipo AS ENUM (
                'utilitario','furgon','camion_chico','camion_grande',
                'semi','tractor','batea','tolva','cisterna','porta_contenedor','otro'
            );
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$
    """)
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE documento_tipo AS ENUM (
                'dni','cuit','ruta','poliza_seguro','vtv','cedula_verde',
                'cedula_azul','licencia_conducir','libreta_sanitaria','monotributo','otro'
            );
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$
    """)
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE documento_estado AS ENUM ('pendiente','aprobado','rechazado','vencido');
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$
    """)

    op.execute("""
        CREATE TABLE IF NOT EXISTS vehiculos (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            transportista_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            tipo vehiculo_tipo NOT NULL,
            patente VARCHAR(20) UNIQUE NOT NULL,
            marca VARCHAR(50),
            modelo VARCHAR(50),
            anio INT,
            capacidad_kg INT NOT NULL,
            capacidad_m3 DECIMAL(8,2),
            refrigerado BOOLEAN DEFAULT FALSE,
            tiene_hidrogrua BOOLEAN DEFAULT FALSE,
            features JSONB DEFAULT '{}',
            foto_principal_url TEXT,
            fotos_adicionales JSONB DEFAULT '[]',
            verificado BOOLEAN DEFAULT FALSE,
            activo BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    """)
    op.execute("CREATE INDEX IF NOT EXISTS idx_vehiculos_transp ON vehiculos(transportista_id)")

    op.execute("""
        CREATE TABLE IF NOT EXISTS documentos (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            vehiculo_id UUID REFERENCES vehiculos(id) ON DELETE CASCADE,
            tipo documento_tipo NOT NULL,
            archivo_url TEXT NOT NULL,
            vencimiento DATE,
            estado documento_estado DEFAULT 'pendiente',
            motivo_rechazo TEXT,
            verificado_por UUID REFERENCES users(id),
            verificado_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            CHECK (user_id IS NOT NULL OR vehiculo_id IS NOT NULL)
        )
    """)
    op.execute("CREATE INDEX IF NOT EXISTS idx_documentos_user ON documentos(user_id)")
    op.execute("CREATE INDEX IF NOT EXISTS idx_documentos_vehiculo ON documentos(vehiculo_id)")
    op.execute("CREATE INDEX IF NOT EXISTS idx_documentos_estado ON documentos(estado)")


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS documentos")
    op.execute("DROP TABLE IF EXISTS vehiculos")
    op.execute("DROP TYPE IF EXISTS documento_estado")
    op.execute("DROP TYPE IF EXISTS documento_tipo")
    op.execute("DROP TYPE IF EXISTS vehiculo_tipo")
