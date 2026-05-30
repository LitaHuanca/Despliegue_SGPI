import os
import sys

# Agrega las carpetas al sys.path para que Python las reconozca
sys.path.append(os.path.join(os.path.dirname(__file__), "SGPI-CAPIRESTC"))
sys.path.append(os.path.join(os.path.dirname(__file__), "SGPI-CMR"))
sys.path.append(os.path.join(os.path.dirname(__file__), "SGPI-CRAPI"))
sys.path.append(os.path.join(os.path.dirname(__file__), "SGPI-CMEE"))
sys.path.append(os.path.join(os.path.dirname(__file__), "SGPI-CAPIAC"))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from sgpi_capirestc.api.v1.api import api_router
from sgpi_cmr.api.reconciliation import router as cmr_router
from sgpi_crapi.api.v1.api import api_router as crapi_router
from sgpi_cmee.api.v1.api import api_router as cmee_router
from sgpi_capiac.api.v1.api import api_router as capiac_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url="/api/v1/openapi.json"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Should be restricted in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")
# Registrar router del CMR (Central de Mapeo y Reconciliación)
app.include_router(cmr_router, prefix="/api/v1/reconciliation", tags=["Reconciliación y Normalización"])
# Registrar router del CRAPI (Reportes y Snapshots POI)
app.include_router(crapi_router, prefix="/api/v1")
# Registrar router del CMEE (Exportación Excel)
app.include_router(cmee_router, prefix="/api/v1")
# Registrar router del CAPIAC (Configuración y Auditoría)
app.include_router(capiac_router, prefix="/api/v1")

@app.get("/health")
async def health_check():
    return {"status": "ok"}
