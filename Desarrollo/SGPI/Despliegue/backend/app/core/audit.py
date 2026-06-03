import uuid
import logging
from typing import Optional, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.domain import LogAuditoria

logger = logging.getLogger(__name__)

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
    Evita fallos por UUID inválido y no propaga errores para no romper la transacción principal.
    """
    try:
        if isinstance(id_usuario, str):
            try:
                parsed_user_id = uuid.UUID(id_usuario)
            except (ValueError, AttributeError):
                logger.warning(f"ID usuario '{id_usuario}' no es un UUID válido. Se guardará como NULL en el log de auditoría.")
                parsed_user_id = None
        else:
            parsed_user_id = id_usuario
    except Exception as parse_err:
        logger.warning(f"Error procesando id_usuario '{id_usuario}': {parse_err}")
        parsed_user_id = None

    log_entry = LogAuditoria(
        id_log=uuid.uuid4(),
        tipo_evento=tipo_evento,
        entidad_afectada=entidad_afectada,
        pk_entidad=pk_entidad,
        valor_anterior=valor_anterior,
        valor_nuevo=valor_nuevo,
        id_usuario=parsed_user_id,
        ip_origen=ip_origen,
        resultado=resultado,
        detalle_error=detalle_error
    )
    
    try:
        db.add(log_entry)
        await db.commit()
        await db.refresh(log_entry)
        return log_entry
    except Exception as db_err:
        logger.error(f"Error al guardar log de auditoría (operación no crítica): {db_err}")
        try:
            await db.rollback()
        except Exception as rb_err:
            logger.error(f"Error al hacer rollback después de fallo de auditoría: {rb_err}")
        return None
