import os
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

# ---------------------------------------------------------------------------
# Paths internos de los módulos SGPI
# ---------------------------------------------------------------------------
sys.path.append(os.path.join(os.path.dirname(__file__), "SGPI-CAPIRESTC"))
sys.path.append(os.path.join(os.path.dirname(__file__), "SGPI-CMR"))
sys.path.append(os.path.join(os.path.dirname(__file__), "SGPI-CRAPI"))
sys.path.append(os.path.join(os.path.dirname(__file__), "SGPI-CMEE"))
sys.path.append(os.path.join(os.path.dirname(__file__), "SGPI-CAPIAC"))

from app.core.config import settings
from app.db.session import engine

from sgpi_capirestc.api.v1.api import api_router
from sgpi_cmr.api.reconciliation import router as cmr_router
from sgpi_crapi.api.v1.api import api_router as crapi_router
from sgpi_cmee.api.v1.api import api_router as cmee_router
from sgpi_capiac.api.v1.api import api_router as capiac_router


# ---------------------------------------------------------------------------
# Lifespan: gestión del ciclo de vida del motor de base de datos
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Abre/cierra el pool de conexiones junto con la aplicación."""
    # startup
    yield
    # shutdown — libera todas las conexiones del pool
    await engine.dispose()


# ---------------------------------------------------------------------------
# Instancia principal de FastAPI
# ---------------------------------------------------------------------------
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url="/api/v1/openapi.json",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# Middleware CORS
# Usa la lista de orígenes definida en config (FRONTEND_ORIGINS en .env).
# En producción asegúrate de que FRONTEND_ORIGINS no incluya "*".
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(api_router, prefix="/api/v1")
# CMR — Central de Mapeo y Reconciliación
app.include_router(
    cmr_router,
    prefix="/api/v1/reconciliation",
    tags=["Reconciliación y Normalización"],
)
# CRAPI — Reportes y Snapshots POI
app.include_router(crapi_router, prefix="/api/v1")
# CMEE — Exportación Excel
app.include_router(cmee_router, prefix="/api/v1")
# CAPIAC — Configuración y Auditoría
app.include_router(capiac_router, prefix="/api/v1")


# ---------------------------------------------------------------------------
# Health-check
# Verifica conectividad real con la base de datos.
# ---------------------------------------------------------------------------
@app.get("/health", tags=["Infraestructura"])
async def health_check():
    """
    Retorna el estado del servidor y la conexión a la base de datos.
    - status: "ok" si todo funciona, "degraded" si la BD no responde.
    - database: "connected" | "unreachable"
    - environment: entorno actual ("development" | "production")
    """
    db_status = "unreachable"
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as exc:
        db_status = f"unreachable — {type(exc).__name__}: {exc}"

    overall = "ok" if db_status == "connected" else "degraded"

    return {
        "status": overall,
        "database": db_status,
        "environment": settings.ENVIRONMENT,
        "version": settings.VERSION,
    }
