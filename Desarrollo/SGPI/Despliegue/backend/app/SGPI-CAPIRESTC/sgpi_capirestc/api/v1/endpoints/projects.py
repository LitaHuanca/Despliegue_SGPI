from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.db.session import get_db
from sgpi_capirestc.crud.crud_proyecto import proyecto
from app.models.domain import Entregable, InvestigadorProyecto
from sgpi_capirestc.schemas.domain_schemas import ProyectoCreate, ProyectoUpdate, ProyectoResponse, EntregableCreate, EntregableResponse, InvestigadorProyectoCreate, InvestigadorProyectoResponse
from app.core.security import get_current_user
from app.core.audit import log_audit_event

router = APIRouter()

@router.get("/", response_model=List[ProyectoResponse])
async def list_proyectos(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return await proyecto.get_multi(db, skip=skip, limit=limit)

@router.get("/{codigo}", response_model=ProyectoResponse)
async def get_proyecto(codigo: str, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    p = await proyecto.get_by_codigo(db, codigo=codigo)
    if not p:
        raise HTTPException(status_code=404, detail="Proyecto not found")
    return p

@router.post("/", response_model=ProyectoResponse)
async def create_proyecto(obj_in: ProyectoCreate, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    p = await proyecto.get_by_codigo(db, codigo=obj_in.codigo_proyecto)
    if p:
        raise HTTPException(status_code=400, detail="Proyecto with this code already exists")
    
    new_proyecto = await proyecto.create(db, obj_in=obj_in)
    
    await log_audit_event(
        db=db,
        tipo_evento="INSERT",
        entidad_afectada="proyecto",
        pk_entidad=new_proyecto.codigo_proyecto,
        valor_nuevo=obj_in.model_dump(mode='json'),
        id_usuario=current_user.get("sub"),
    )
    return new_proyecto

@router.put("/{codigo}", response_model=ProyectoResponse)
async def update_proyecto(codigo: str, obj_in: ProyectoUpdate, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    p = await proyecto.get_by_codigo(db, codigo=codigo)
    if not p:
        raise HTTPException(status_code=404, detail="Proyecto not found")
        
    valor_anterior = {k: getattr(p, k) for k in obj_in.model_dump(exclude_unset=True).keys()}
    
    updated_p = await proyecto.update(db, db_obj=p, obj_in=obj_in)
    
    await log_audit_event(
        db=db,
        tipo_evento="UPDATE",
        entidad_afectada="proyecto",
        pk_entidad=codigo,
        valor_anterior=valor_anterior,
        valor_nuevo=obj_in.model_dump(exclude_unset=True, mode='json'),
        id_usuario=current_user.get("sub"),
    )
    return updated_p

@router.post("/{codigo}/deliverables", response_model=EntregableResponse)
async def create_deliverable(codigo: str, obj_in: EntregableCreate, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    p = await proyecto.get_by_codigo(db, codigo=codigo)
    if not p:
        raise HTTPException(status_code=404, detail="Proyecto not found")
        
    db_obj = Entregable(**obj_in.model_dump())
    db_obj.codigo_proyecto = codigo
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    
    await log_audit_event(
        db=db,
        tipo_evento="INSERT",
        entidad_afectada="entregable",
        pk_entidad=str(db_obj.id_entregable),
        valor_nuevo=obj_in.model_dump(mode='json'),
        id_usuario=current_user.get("sub"),
    )
    return db_obj

@router.post("/{codigo}/investigators", response_model=InvestigadorProyectoResponse)
async def add_investigator(codigo: str, obj_in: InvestigadorProyectoCreate, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    p = await proyecto.get_by_codigo(db, codigo=codigo)
    if not p:
        raise HTTPException(status_code=404, detail="Proyecto not found")
        
    db_obj = InvestigadorProyecto(**obj_in.model_dump())
    db_obj.codigo_proyecto = codigo
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    
    await log_audit_event(
        db=db,
        tipo_evento="INSERT",
        entidad_afectada="investigador_proyecto",
        pk_entidad=f"{codigo}-{db_obj.dni_investigador}",
        valor_nuevo=obj_in.model_dump(mode='json'),
        id_usuario=current_user.get("sub"),
    )
    return db_obj

