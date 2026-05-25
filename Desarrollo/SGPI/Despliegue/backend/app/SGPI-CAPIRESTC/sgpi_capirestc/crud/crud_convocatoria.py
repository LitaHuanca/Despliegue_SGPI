from sgpi_capirestc.crud.crud_base import CRUDBase
from app.models.domain import Convocatoria
from sgpi_capirestc.schemas.domain_schemas import ConvocatoriaCreate, ConvocatoriaUpdate
from sqlalchemy.ext.asyncio import AsyncSession

class CRUDConvocatoria(CRUDBase[Convocatoria, ConvocatoriaCreate, ConvocatoriaUpdate]):
    pass

convocatoria = CRUDConvocatoria(Convocatoria)
