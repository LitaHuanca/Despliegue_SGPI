from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.db.session import get_db
from sgpi_capirestc.crud.crud_tesis import tesis
from sgpi_capirestc.schemas.domain_schemas import TesisBase, TesisResponse
from app.core.security import get_current_user
from app.core.audit import log_audit_event

router = APIRouter()

@router.get("/", response_model=List[TesisResponse])
async def list_tesis(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return await tesis.get_multi(db, skip=skip, limit=limit)

@router.get("/{url:path}", response_model=TesisResponse)
async def get_tesis(url: str, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    t = await tesis.get_by_url(db, url=url)
    if not t:
        raise HTTPException(status_code=404, detail="Tesis no encontrado")
    return t

@router.post("/", response_model=TesisResponse)
async def create_tesis(obj_in: TesisBase, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    new_tesis = await tesis.create(db, obj_in=obj_in)
    
    await log_audit_event(
        db=db,
        tipo_evento="INSERT",
        entidad_afectada="tesis",
        pk_entidad=new_tesis.url_cybertesis,
        valor_nuevo=obj_in.model_dump(mode='json'),
        id_usuario=current_user.get("sub"),
    )
    return new_tesis
