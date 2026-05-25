from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.db.session import get_db
from sgpi_capirestc.crud.crud_investigador import investigador
from sgpi_capirestc.schemas.domain_schemas import InvestigadorCreate, InvestigadorUpdate, InvestigadorResponse
from app.core.security import get_current_user
from app.core.audit import log_audit_event

router = APIRouter()

@router.get("/", response_model=List[InvestigadorResponse])
async def list_investigadores(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return await investigador.get_multi(db, skip=skip, limit=limit)

@router.get("/{dni}", response_model=InvestigadorResponse)
async def get_investigador(dni: str, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    inv = await investigador.get_by_dni(db, dni=dni)
    if not inv:
        raise HTTPException(status_code=404, detail="Investigador not found")
    return inv

@router.post("/", response_model=InvestigadorResponse)
async def create_investigador(obj_in: InvestigadorCreate, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    inv = await investigador.get_by_dni(db, dni=obj_in.dni)
    if inv:
        raise HTTPException(status_code=400, detail="Investigador with this DNI already exists")
    
    new_inv = await investigador.create(db, obj_in=obj_in)
    
    await log_audit_event(
        db=db,
        tipo_evento="INSERT",
        entidad_afectada="investigador",
        pk_entidad=new_inv.dni,
        valor_nuevo=obj_in.model_dump(),
        id_usuario=current_user.get("sub"),
    )
    return new_inv

@router.put("/{dni}", response_model=InvestigadorResponse)
async def update_investigador(dni: str, obj_in: InvestigadorUpdate, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    inv = await investigador.get_by_dni(db, dni=dni)
    if not inv:
        raise HTTPException(status_code=404, detail="Investigador not found")
        
    valor_anterior = {k: getattr(inv, k) for k in obj_in.model_dump(exclude_unset=True).keys()}
    
    updated_inv = await investigador.update(db, db_obj=inv, obj_in=obj_in)
    
    await log_audit_event(
        db=db,
        tipo_evento="UPDATE",
        entidad_afectada="investigador",
        pk_entidad=dni,
        valor_anterior=valor_anterior,
        valor_nuevo=obj_in.model_dump(exclude_unset=True),
        id_usuario=current_user.get("sub"),
    )
    return updated_inv
