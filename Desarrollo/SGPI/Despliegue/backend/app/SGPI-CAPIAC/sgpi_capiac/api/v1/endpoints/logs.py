from typing import Any, List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from sgpi_capiac.crud.crud_log import log
from sgpi_capiac.schemas.capiac_schemas import LogAuditoriaResponse
from app.core.security import require_admin

router = APIRouter()

@router.get("/", response_model=List[LogAuditoriaResponse])
async def read_logs(
    db: AsyncSession = Depends(get_db),
    tipo_evento: Optional[str] = None,
    id_usuario: Optional[str] = None,
    fecha_inicio: Optional[datetime] = None,
    fecha_fin: Optional[datetime] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    # Requiere que el usuario sea administrador para ver logs de sistema
    current_user: dict = Depends(require_admin)
) -> Any:
    """
    Consultar los logs de auditoría del sistema (CU14).
    Solo para el Administrador. Incluye filtros opcionales.
    """
    logs_recuperados = await log.get_multi_filtered(
        db=db,
        tipo_evento=tipo_evento,
        id_usuario=id_usuario,
        fecha_inicio=fecha_inicio,
        fecha_fin=fecha_fin,
        skip=skip,
        limit=limit
    )
    return logs_recuperados
