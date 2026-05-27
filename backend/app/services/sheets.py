"""
Capa de abstracción para Google Sheets.
Todos los routers interactúan con Sheets a través de este módulo.
Para migrar a otra base de datos, solo hay que modificar este archivo.
"""
import json
import time
from functools import lru_cache

from google.oauth2 import service_account
from googleapiclient.discovery import build

from app.config import get_settings

SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]
CACHE_TTL = 30  # segundos

SHEETS = {
    "alumnos": "Alumnos",
    "paquetes": "Paquetes",
    "inscripciones": "Inscripciones",
    "clases": "Clases",
    "reservas": "Reservas",
    "canchas": "Canchas",
    "push_subs": "PushSuscripciones",
    "pagos": "Pagos",
}

# Cache en memoria: { sheet_name: (timestamp, data) }
_cache: dict[str, tuple[float, list[dict]]] = {}


@lru_cache
def _get_service():
    settings = get_settings()
    creds_dict = json.loads(settings.google_service_account_json)
    creds = service_account.Credentials.from_service_account_info(
        creds_dict, scopes=SCOPES
    )
    return build("sheets", "v4", credentials=creds)


def _spreadsheet_id() -> str:
    return get_settings().google_sheets_id


def _invalidate(sheet_name: str) -> None:
    """Invalida el cache de una hoja tras una escritura."""
    _cache.pop(sheet_name, None)


# ── Lectura ────────────────────────────────────────────────────

def read_sheet(sheet_name: str) -> list[dict]:
    """Lee todas las filas de una hoja con cache de 30 segundos."""
    now = time.time()
    if sheet_name in _cache:
        ts, data = _cache[sheet_name]
        if now - ts < CACHE_TTL:
            return data

    service = _get_service()
    result = (
        service.spreadsheets()
        .values()
        .get(spreadsheetId=_spreadsheet_id(), range=sheet_name)
        .execute()
    )
    rows = result.get("values", [])
    if len(rows) < 2:
        data = []
    else:
        headers = rows[0]
        data = [
            {headers[i]: row[i] if i < len(
                row) else "" for i in range(len(headers))}
            for row in rows[1:]
        ]

    _cache[sheet_name] = (now, data)
    return data


def find_row(sheet_name: str, pk_field: str, pk_value: str) -> tuple[dict | None, int | None]:
    """Devuelve (fila_como_dict, numero_de_fila_1_indexed) o (None, None)."""
    rows = read_sheet(sheet_name)
    for i, row in enumerate(rows):
        if row.get(pk_field) == pk_value:
            return row, i + 2
    return None, None


# ── Escritura ──────────────────────────────────────────────────

def append_row(sheet_name: str, headers: list[str], data: dict) -> None:
    """Agrega una nueva fila al final de la hoja e invalida el cache."""
    service = _get_service()
    row = [str(data.get(h, "")) for h in headers]
    service.spreadsheets().values().append(
        spreadsheetId=_spreadsheet_id(),
        range=sheet_name,
        valueInputOption="USER_ENTERED",
        insertDataOption="INSERT_ROWS",
        body={"values": [row]},
    ).execute()
    _invalidate(sheet_name)


def update_row(sheet_name: str, row_number: int, headers: list[str], data: dict) -> None:
    """Actualiza una fila existente por número de fila e invalida el cache."""
    service = _get_service()
    row = [str(data.get(h, "")) for h in headers]
    range_ = f"{sheet_name}!A{row_number}"
    service.spreadsheets().values().update(
        spreadsheetId=_spreadsheet_id(),
        range=range_,
        valueInputOption="USER_ENTERED",
        body={"values": [row]},
    ).execute()
    _invalidate(sheet_name)


# ── Helpers de ID ──────────────────────────────────────────────

def next_id(sheet_name: str, prefix: str) -> str:
    """Genera el próximo ID correlativo (ej. ALU-001, ALU-002...)."""
    rows = read_sheet(sheet_name)
    if not rows:
        return f"{prefix}-001"
    pk_field = f"{prefix.lower()}_id"
    nums = []
    for row in rows:
        val = row.get(pk_field, "")
        try:
            nums.append(int(val.split("-")[-1]))
        except (ValueError, IndexError):
            pass
    next_num = max(nums, default=0) + 1
    return f"{prefix}-{next_num:03d}"
