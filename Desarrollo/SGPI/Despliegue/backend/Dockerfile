# ============================================================
# Dockerfile para desplegar el backend de SGPI en Render
# ============================================================

# Usar una imagen oficial de Python como base (Debian-based slim)
FROM python:3.11-slim

# Evitar que Python escriba archivos .pyc en el disco
ENV PYTHONDONTWRITEBYTECODE=1

# Evitar que Python almacene en búfer los flujos de salida (útil para ver logs en tiempo real)
ENV PYTHONUNBUFFERED=1

# Configurar variables de entorno por defecto para el contenedor
ENV PORT=8000
ENV ENVIRONMENT=production

# Configurar TESSERACT_CMD para que pytesseract use el binario del sistema en Linux
ENV TESSERACT_CMD=tesseract

# Instalar dependencias del sistema necesarias
# - build-essential y libpq-dev por si se requiere compilar alguna dependencia
# - tesseract-ocr y tesseract-ocr-spa para el procesamiento de imágenes/PDFs con OCR en español
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    tesseract-ocr \
    tesseract-ocr-spa \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Establecer el directorio de trabajo en el contenedor
WORKDIR /app

# Copiar el archivo de requerimientos primero para aprovechar la caché de capas de Docker
COPY requirements.txt .

# Actualizar pip e instalar dependencias de Python
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copiar todo el código fuente del backend al contenedor
COPY . .

# Crear directorios necesarios para logs y cargas temporales con permisos de escritura
RUN mkdir -p logs tmp_uploads && chmod -R 777 logs tmp_uploads

# Exponer el puerto
EXPOSE 8000

# Comando para ejecutar la aplicación usando Uvicorn
# Se usa 'sh -c' para expandir la variable de entorno $PORT asignada dinámicamente por Render
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
