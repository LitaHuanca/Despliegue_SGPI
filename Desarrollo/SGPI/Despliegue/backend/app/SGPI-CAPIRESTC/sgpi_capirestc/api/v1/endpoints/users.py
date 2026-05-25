from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import uuid

from app.db.session import get_db
from sgpi_capirestc.crud.crud_usuario import usuario
from sgpi_capirestc.schemas.domain_schemas import UsuarioBase, UsuarioUpdate, UsuarioResponse
from app.core.security import get_current_user, require_admin
from app.core.audit import log_audit_event

router = APIRouter()

@router.get("/", response_model=List[UsuarioResponse], dependencies=[Depends(require_admin)])
async def list_usuarios(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    return await usuario.get_multi(db, skip=skip, limit=limit)

@router.get("/{id_usuario}", response_model=UsuarioResponse)
async def get_usuario(id_usuario: str, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    try:
        user_uuid = uuid.UUID(id_usuario)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID")

    u = await usuario.get_by_id(db, id_usuario=user_uuid)
    if not u:
        raise HTTPException(status_code=404, detail="Usuario not found")
        
    # Only admin or the user themselves can view their profile
    rol = current_user.get("app_metadata", {}).get("rol_sistema")
    if rol != "Administrador" and current_user.get("sub") != str(user_uuid):
        raise HTTPException(status_code=403, detail="No tiene permisos para ver otro perfil")

    return u

@router.put("/{id_usuario}", response_model=UsuarioResponse, dependencies=[Depends(require_admin)])
async def update_usuario(id_usuario: str, obj_in: UsuarioUpdate, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    try:
        user_uuid = uuid.UUID(id_usuario)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID")

    u = await usuario.get_by_id(db, id_usuario=user_uuid)
    if not u:
        raise HTTPException(status_code=404, detail="Usuario not found")
        
    valor_anterior = {k: getattr(u, k) for k in obj_in.model_dump(exclude_unset=True).keys()}
    
    updated_u = await usuario.update(db, db_obj=u, obj_in=obj_in)
    
    await log_audit_event(
        db=db,
        tipo_evento="UPDATE",
        entidad_afectada="usuario",
        pk_entidad=id_usuario,
        valor_anterior=valor_anterior,
        valor_nuevo=obj_in.model_dump(exclude_unset=True, mode='json'),
        id_usuario=current_user.get("sub"),
    )
    return updated_u

@router.put("/{id_usuario}/deactivate", response_model=UsuarioResponse, dependencies=[Depends(require_admin)])
async def deactivate_usuario(id_usuario: str, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    try:
        user_uuid = uuid.UUID(id_usuario)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID")

    u = await usuario.get_by_id(db, id_usuario=user_uuid)
    if not u:
        raise HTTPException(status_code=404, detail="Usuario not found")
        
    if current_user.get("sub") == id_usuario:
        raise HTTPException(status_code=400, detail="No puede desactivar su propia cuenta")
        
    valor_anterior = {"estado_cuenta": getattr(u, "estado_cuenta")}
    
    updated_u = await usuario.update(db, db_obj=u, obj_in={"estado_cuenta": False})
    
    await log_audit_event(
        db=db,
        tipo_evento="USER_DEACTIVATED",
        entidad_afectada="usuario",
        pk_entidad=id_usuario,
        valor_anterior=valor_anterior,
        valor_nuevo={"estado_cuenta": False},
        id_usuario=current_user.get("sub"),
    )
    return updated_u
