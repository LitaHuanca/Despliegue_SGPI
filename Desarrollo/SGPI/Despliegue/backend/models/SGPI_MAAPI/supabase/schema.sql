-- ====================================================================================
-- SISTEMA DE GESTIÓN DE PROYECTOS DE INVESTIGACIÓN (SGPI)
-- Script DDL Definitivo para PostgreSQL (Supabase)
-- ====================================================================================

-- 1. TABLA FUERTE: INVESTIGADOR (Padrón Central)
CREATE TABLE investigador (
    dni VARCHAR(15) PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(150) NOT NULL,
    codigo_interno_vrip VARCHAR(50),
    condicion_laboral VARCHAR(50),
    facultad_dependencia VARCHAR(100) DEFAULT 'Ingeniería de Sistemas e Informática',
    grado_academico_max VARCHAR(100),
    institucion_principal VARCHAR(150),
    codigo_renacyt VARCHAR(50) UNIQUE,
    orcid VARCHAR(50),
    categoria_renacyt VARCHAR(50),
    estado_renacyt VARCHAR(50),
    url_cti_vitae VARCHAR(255),
    tiene_deuda_gi BOOLEAN DEFAULT FALSE,
    tiene_deuda_pi BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. TABLA FUERTE: PROYECTO (Financiamiento y Planificación VRIP)
CREATE TABLE proyecto (
    codigo_proyecto VARCHAR(50) PRIMARY KEY,
    resolucion_aprobacion VARCHAR(100),
    titulo_proyecto TEXT NOT NULL,
    facultad_proyecto VARCHAR(100) DEFAULT 'Ingeniería de Sistemas e Informática',
    presupuesto_asignado DECIMAL(12,2) DEFAULT 0.00,
    grupo_investigacion_matriz VARCHAR(255),
    area_academica VARCHAR(100),
    anio_convocatoria INT,
    fecha_rendicion_35 DATE,
    fecha_rendicion_70 DATE,
    fecha_rendicion_100 DATE,
    fecha_informe_final DATE,
    estado_proyecto VARCHAR(50) DEFAULT 'Aprobado',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. TABLA DEPENDIENTE: HISTORIAL_PUNTAJE (Auditoría Académica RAIS)
CREATE TABLE historial_puntaje (
    id_historial SERIAL PRIMARY KEY,
    dni_investigador VARCHAR(15) REFERENCES investigador(dni) ON DELETE CASCADE,
    anio_evaluacion INT NOT NULL,
    puntaje_total DECIMAL(5,2) DEFAULT 0.00,
    puntaje_revistas DECIMAL(5,2) DEFAULT 0.00,
    puntaje_libros DECIMAL(5,2) DEFAULT 0.00,
    puntaje_proyectos DECIMAL(5,2) DEFAULT 0.00,
    puntaje_patentes DECIMAL(5,2) DEFAULT 0.00,
    puntaje_tesis DECIMAL(5,2) DEFAULT 0.00,
    puntaje_otros DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(dni_investigador, anio_evaluacion) 
);

-- 4. TABLA INTERMEDIA N:M: INVESTIGADOR_PROYECTO (Docentes en Proyectos)
CREATE TABLE investigador_proyecto (
    codigo_proyecto VARCHAR(50) REFERENCES proyecto(codigo_proyecto) ON DELETE CASCADE,
    dni_investigador VARCHAR(15) REFERENCES investigador(dni) ON DELETE CASCADE,
    condicion_rol VARCHAR(100) NOT NULL,
    tipo_vinculo VARCHAR(100),
    facultad_integrante VARCHAR(100),
    condicion_gi VARCHAR(100),
    PRIMARY KEY (codigo_proyecto, dni_investigador)
);

-- 5. TABLA SATÉLITE: ESTUDIANTE_PROYECTO (Alumnos en Proyectos)
CREATE TABLE estudiante_proyecto (
    id_registro SERIAL PRIMARY KEY,
    codigo_proyecto VARCHAR(50) REFERENCES proyecto(codigo_proyecto) ON DELETE CASCADE,
    codigo_matricula VARCHAR(20),
    apellidos_nombres VARCHAR(200) NOT NULL,
    condicion_rol VARCHAR(100) NOT NULL,
    tipo_vinculo VARCHAR(50),
    facultad_integrante VARCHAR(100)
);

-- 6. TABLA DEPENDIENTE: ENTREGABLE (Monitoreo)
CREATE TABLE entregable (
    id_entregable SERIAL PRIMARY KEY,
    codigo_proyecto VARCHAR(50) REFERENCES proyecto(codigo_proyecto) ON DELETE CASCADE,
    tipo_entregable VARCHAR(100) NOT NULL,
    fecha_limite_programada DATE,
    fecha_entrega_real DATE,
    estado_entregable VARCHAR(50) DEFAULT 'Pendiente',
    archivo_url VARCHAR(255)
);

-- 7. TABLA DEPENDIENTE: TESIS (Producción Científica Cybertesis)
CREATE TABLE tesis (
    url_cybertesis VARCHAR(255) PRIMARY KEY,
    titulo_tesis TEXT NOT NULL,
    resumen_abstract TEXT,
    cita_apa TEXT,
    derechos_licencia VARCHAR(100),
    url_licencia VARCHAR(255),
    formato_archivo VARCHAR(50),
    idioma_iso VARCHAR(10),
    tipo_recurso VARCHAR(50),
    anio_publicacion INT,
    fecha_registro_cybertesis TIMESTAMP,
    fecha_disponibilidad TIMESTAMP,
    autor_estudiante_texto VARCHAR(200) NOT NULL,
    dni_tesista VARCHAR(15),
    asesor_texto VARCHAR(200) NOT NULL,
    dni_asesor VARCHAR(15) REFERENCES investigador(dni) ON DELETE SET NULL, 
    orcid_asesor VARCHAR(255),
    codigo_disciplina VARCHAR(50),
    nivel_grado VARCHAR(100),
    tipo_trabajo VARCHAR(100),
    escuela_profesional VARCHAR(150),
    grado_obtenido VARCHAR(150),
    institucion_concedente VARCHAR(255),
    editorial VARCHAR(150),
    pais_publicacion VARCHAR(10),
    palabras_clave JSONB, 
    jurados_evaluadores JSONB, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 8. MÓDULO DE SEGURIDAD Y ACCESOS (Integración con Auth de Supabase)
CREATE TABLE usuario (
    id_usuario UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    correo_institucional VARCHAR(255) NOT NULL UNIQUE,
    rol_sistema VARCHAR(50) NOT NULL CHECK (rol_sistema IN ('Administrador', 'Secretaria', 'Docente')),
    dni_investigador VARCHAR(15) REFERENCES investigador(dni) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ====================================================================================
-- CREACIÓN DE ÍNDICES DE OPTIMIZACIÓN
-- ====================================================================================
CREATE INDEX idx_investigador_apellidos ON investigador(apellidos);
CREATE INDEX idx_proyecto_resolucion ON proyecto(resolucion_aprobacion);
CREATE INDEX idx_tesis_asesor ON tesis(dni_asesor);
CREATE INDEX idx_usuario_correo ON usuario(correo_institucional);
