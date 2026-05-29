"""
Capa de acceso a datos usando Supabase (PostgreSQL).
Reemplaza sheets.py — misma interfaz, sin cache manual ni parseo de filas.
"""
from supabase import create_client, Client
from app.config import settings

_client: Client | None = None


def get_db() -> Client:
    global _client
    if _client is None:
        _client = create_client(settings.supabase_url, settings.supabase_service_key)
    return _client


def next_id(table: str, id_col: str, prefix: str) -> str:
    """Genera el siguiente ID correlativo (ALU-001, PKG-002, ...)."""
    db = get_db()
    result = db.table(table).select(id_col).execute()
    if not result.data:
        return f"{prefix}-001"
    nums = [
        int(r[id_col].split("-")[1])
        for r in result.data
        if r.get(id_col) and "-" in r[id_col]
    ]
    return f"{prefix}-{max(nums) + 1:03d}" if nums else f"{prefix}-001"
