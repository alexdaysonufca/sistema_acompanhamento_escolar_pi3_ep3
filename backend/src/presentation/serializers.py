"""
Serializadores JSON para conversão segura de tipos de domínio, datas e Decimais.
"""
import json
from datetime import date, datetime
from decimal import Decimal
from enum import Enum
from typing import Any


class TracesJSONEncoder(json.JSONEncoder):
    """Encoder JSON customizado para o ecossistema TrAcEs."""

    def default(self, obj: Any) -> Any:
        if isinstance(obj, Decimal):
            return float(obj)
        if isinstance(obj, (date, datetime)):
            return obj.isoformat()
        if isinstance(obj, Enum):
            return obj.value
        if hasattr(obj, "__dict__"):
            return obj.__dict__
        return super().default(obj)


def to_json(data: Any) -> str:
    """Serializa estruturas de dados para JSON string."""
    return json.dumps(data, cls=TracesJSONEncoder, ensure_ascii=False, indent=2)


def from_json(json_str: str) -> Any:
    """Deserializa JSON string para estrutura Python."""
    return json.loads(json_str)
