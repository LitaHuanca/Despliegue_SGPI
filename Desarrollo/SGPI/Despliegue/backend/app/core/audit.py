import uuid
from typing import Optional, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.domain import LogAuditoria

async def log_audit_event(
    db: AsyncSession,
    tipo_evento: str,
    entidad_afectada: Optional[str] = None,
    pk_entidad: Optional[str] = None,
    valor_anterior: Optional[Any] = None,
    valor_nuevo: Optional[Any] = None,
    id_usuario: Optional[str] = None,
    ip_origen: Optional[str] = None,
    resultado: str = "Exito",
    detalle_error: Optional[str] = None
):
    """
    Inserta un registro inmutable en la tabla de auditoría.
    """
    log_entry = LogAuditoria(
        id_log=uuid.uuid4(),
        tipo_evento=tipo_evento,
        entidad_afectada=entidad_afectada,
        pk_entidad=pk_entidad,
        valor_anterior=valor_anterior,
        valor_nuevo=valor_nuevo,
        id_usuario=uuid.UUID(id_usuario) if isinstance(id_usuario, str) else id_usuario,
        ip_origen=ip_origen,
        resultado=resultado,
        detalle_error=detalle_error
    )
    db.add(log_entry)
    await db.commit()
    await db.refresh(log_entry)
    return log_entry
