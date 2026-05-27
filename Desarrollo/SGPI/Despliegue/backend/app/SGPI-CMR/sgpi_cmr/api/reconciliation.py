from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Dict, Any, List

from app.db.session import get_db
from app.models.domain import Investigador, Proyecto, Publicacion, Tesis, ReconciliacionPendiente
from sgpi_cmr.schemas.incoming import BulkInvestigadorPayload, BulkProyectoPayload, BulkPublicacionPayload, BulkAsesorTesisPayload
from sgpi_cmr.services.rules_engine import rules_engine
from sgpi_cmr.services.persister import persister

router = APIRouter()

@router.post("/bulk/investigators", summary="Reconciliar investigadores en bulk", status_code=status.HTTP_202_ACCEPTED)
async def reconcile_investigadores_bulk(payload: BulkInvestigadorPayload, db: AsyncSession = Depends(get_db)):
    fuente = payload.fuente_origen
    stats = {"procesados": 0, "resueltos": 0, "cuarentena": 0}
    
    for registro in payload.registros:
        stats["procesados"] += 1
        
        # Leer de DB
        res = await db.execute(select(Investigador).where(Investigador.dni == registro.dni))
        existing_obj = res.scalars().first()
        current_db = existing_obj.__dict__ if existing_obj else None
        # Remove SQLAlchemy internal state
        if current_db and '_sa_instance_state' in current_db:
            del current_db['_sa_instance_state']
        
        merged, requires_quarantine, reason = rules_engine.reconcile_investigador(current_db, registro, fuente)
        
        if requires_quarantine:
            stats["cuarentena"] += 1
            await persister.persist_quarantine(
                db, entidad="investigador", llave_sugerida=registro.dni, 
                fuentes=[fuente], conflicto=merged, motivo=reason
            )
        else:
            stats["resueltos"] += 1
            await persister.persist_resolved(
                db, entidad="investigador", llave_pk=registro.dni, 
                merged_data=merged, fuente_ganadora=fuente
            )
            
    return {"message": "Lote de investigadores procesado", "stats": stats}


@router.post("/bulk/projects", summary="Reconciliar proyectos en bulk", status_code=status.HTTP_202_ACCEPTED)
async def reconcile_proyectos_bulk(payload: BulkProyectoPayload, db: AsyncSession = Depends(get_db)):
    fuente = payload.fuente_origen
    stats = {"procesados": 0, "resueltos": 0, "cuarentena": 0}
    
    for registro in payload.registros:
        stats["procesados"] += 1
        
        res = await db.execute(select(Proyecto).where(Proyecto.codigo_proyecto == registro.codigo_proyecto))
        existing_obj = res.scalars().first()
        current_db = existing_obj.__dict__ if existing_obj else None
        if current_db and '_sa_instance_state' in current_db:
            del current_db['_sa_instance_state']
            
        merged, requires_quarantine, reason = rules_engine.reconcile_proyecto(current_db, registro, fuente)
        
        if requires_quarantine:
            stats["cuarentena"] += 1
            await persister.persist_quarantine(
                db, entidad="proyecto", llave_sugerida=registro.codigo_proyecto, 
                fuentes=[fuente], conflicto=merged, motivo=reason
            )
        else:
            stats["resueltos"] += 1
            await persister.persist_resolved(
                db, entidad="proyecto", llave_pk=registro.codigo_proyecto, 
                merged_data=merged, fuente_ganadora=fuente
            )
            
    return {"message": "Lote de proyectos procesado", "stats": stats}


@router.post("/bulk/publications", summary="Reconciliar publicaciones en bulk", status_code=status.HTTP_202_ACCEPTED)
async def reconcile_publicaciones_bulk(payload: BulkPublicacionPayload, db: AsyncSession = Depends(get_db)):
    fuente = payload.fuente_origen
    stats = {"procesados": 0, "resueltos": 0, "cuarentena": 0}
    
    for registro in payload.registros:
        stats["procesados"] += 1
        
        # Buscar por DOI si existe, sino por Título
        stmt = select(Publicacion)
        if registro.doi_codigo:
            stmt = stmt.where(Publicacion.doi_codigo == registro.doi_codigo)
        else:
            stmt = stmt.where(Publicacion.titulo_articulo == registro.titulo_articulo)
            
        res = await db.execute(stmt)
        existing_obj = res.scalars().first()
        current_db = existing_obj.__dict__ if existing_obj else None
        if current_db and '_sa_instance_state' in current_db:
            del current_db['_sa_instance_state']
            
        merged, requires_quarantine, reason = rules_engine.reconcile_publicacion(current_db, registro, fuente)
        llave = registro.doi_codigo if registro.doi_codigo else "NEW"
        
        if requires_quarantine:
            stats["cuarentena"] += 1
            await persister.persist_quarantine(
                db, entidad="publicacion", llave_sugerida=llave, 
                fuentes=[fuente], conflicto=merged, motivo=reason
            )
        else:
            stats["resueltos"] += 1
            await persister.persist_resolved(
                db, entidad="publicacion", llave_pk=llave, 
                merged_data=merged, fuente_ganadora=fuente
            )
            
    return {"message": "Lote de publicaciones procesado", "stats": stats}


@router.post("/bulk/theses_advisors", summary="Reconciliar asesores de tesis (Cybertesis)", status_code=status.HTTP_202_ACCEPTED)
async def reconcile_asesores_tesis(payload: BulkAsesorTesisPayload, db: AsyncSession = Depends(get_db)):
    fuente = payload.fuente_origen
    stats = {"procesados": 0, "resueltos": 0, "cuarentena": 0}
    
    # Pre-cargar padrón de investigadores para Fuzzy Matching
    res_inv = await db.execute(select(Investigador.dni, Investigador.nombres, Investigador.apellidos))
    padron = {row.dni: f"{row.nombres} {row.apellidos}" for row in res_inv.all()}
    
    for registro in payload.registros:
        stats["procesados"] += 1
        
        merged, requires_quarantine, reason = rules_engine.reconcile_asesor_tesis(padron, registro)
        
        if requires_quarantine:
            stats["cuarentena"] += 1
            await persister.persist_quarantine(
                db, entidad="tesis", llave_sugerida=registro.url_cybertesis, 
                fuentes=[fuente], conflicto=merged, motivo=reason
            )
        else:
            stats["resueltos"] += 1
            await persister.persist_resolved(
                db, entidad="tesis", llave_pk=registro.url_cybertesis, 
                merged_data=merged, fuente_ganadora=fuente
            )
            
    return {"message": "Lote de tesis procesado", "stats": stats}


# ==========================================
# ENDPOINTS DE ADMINISTRACIÓN (CUARENTENA)
# ==========================================

@router.get("/quarantine", summary="Obtener registros en cuarentena")
async def get_quarantine_items(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ReconciliacionPendiente).where(ReconciliacionPendiente.estado == 'Pendiente'))
    items = result.scalars().all()
    
    return [
        {
            "id_pendiente": item.id_pendiente,
            "entidad_afectada": item.entidad_afectada,
            "llave_primaria_sugerida": item.llave_primaria_sugerida,
            "fuentes_involucradas": item.fuentes_involucradas,
            "datos_conflicto": item.datos_conflicto,
            "motivo_cuarentena": item.motivo_cuarentena,
            "estado": item.estado,
            "fecha_registro": item.fecha_registro
        }
        for item in items
    ]

@router.post("/quarantine/{id_pendiente}/resolve", summary="Resolver un item de cuarentena")
async def resolve_quarantine_item(id_pendiente: int, action: str, db: AsyncSession = Depends(get_db)):
    if action not in ["aprobar", "rechazar"]:
        raise HTTPException(status_code=400, detail="Acción inválida. Usa 'aprobar' o 'rechazar'.")
        
    try:
        await persister.resolve_quarantine_item(db, id_pendiente, action)
        return {"message": f"Item {id_pendiente} fue {action}do con éxito."}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
