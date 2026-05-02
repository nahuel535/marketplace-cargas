import resend

from app.config import settings

resend.api_key = settings.RESEND_API_KEY


def enviar_verificacion_email(email: str, nombre: str, token: str) -> None:
    if settings.ENVIRONMENT == "development":
        print(f"[DEV] Verificar email: {settings.FRONTEND_URL}/verificar-email?token={token}")
        return

    resend.Emails.send({
        "from": settings.FROM_EMAIL,
        "to": email,
        "subject": "Verificá tu email — Marketplace de Cargas",
        "html": f"""
        <h2>Hola {nombre}!</h2>
        <p>Hacé clic en el siguiente link para verificar tu email:</p>
        <a href="{settings.FRONTEND_URL}/verificar-email?token={token}" style="
            background:#2563eb;color:white;padding:12px 24px;
            border-radius:6px;text-decoration:none;display:inline-block">
            Verificar email
        </a>
        <p>El link expira en 24 horas.</p>
        <p>Si no creaste esta cuenta, ignorá este mensaje.</p>
        """,
    })


def enviar_reset_password(email: str, nombre: str, token: str) -> None:
    if settings.ENVIRONMENT == "development":
        print(f"[DEV] Reset password: {settings.FRONTEND_URL}/reset-password?token={token}")
        return

    resend.Emails.send({
        "from": settings.FROM_EMAIL,
        "to": email,
        "subject": "Resetear contraseña — Marketplace de Cargas",
        "html": f"""
        <h2>Hola {nombre}!</h2>
        <p>Recibimos un pedido para resetear tu contraseña.</p>
        <a href="{settings.FRONTEND_URL}/reset-password?token={token}" style="
            background:#2563eb;color:white;padding:12px 24px;
            border-radius:6px;text-decoration:none;display:inline-block">
            Resetear contraseña
        </a>
        <p>El link expira en 24 horas.</p>
        <p>Si no pediste esto, ignorá este mensaje.</p>
        """,
    })
