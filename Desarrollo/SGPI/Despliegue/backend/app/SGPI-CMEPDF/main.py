# main.py
import uvicorn
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router as pdf_router
from core.config import settings  # ← importa tu settings

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("pdf-service")

# Usa settings.ALLOWED_ORIGINS en vez de os.getenv
origins = settings.ALLOWED_ORIGINS
logger.info(f"ORIGINS LOADED: {origins}")

app = FastAPI(
    title="SGPI generic PDF Generator Engine",
    description="Motor microservicio genérico de compilación y streaming de documentos PDF para la FISI-UNMSM.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(pdf_router)

@app.get("/health", tags=["system"])
def health_check():
    logger.debug("Health check hit")
    return {
        "status": "healthy",
        "service": "SGPI-CMEPDF Engine",
        "engine_version": "1.0.0"
    }

if __name__ == "__main__":
    logger.info("Starting SGPI-CMEPDF Engine on port 8000...")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)