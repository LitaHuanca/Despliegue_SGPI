-- ====================================================================================
-- SISTEMA DE GESTIÓN DE PROYECTOS DE INVESTIGACIÓN (SGPI)
-- SCRIPT DE AUTOMATIZACIÓN Y TRIGGERS (DBA: Ange)
-- ====================================================================================

-- ------------------------------------------------------------------------------------
-- 1. TRIGGER DE AUDITORÍA: CAMPOS 'updated_at' (Caso 4)
-- ------------------------------------------------------------------------------------

-- A. Añadir la columna a las tablas principales
ALTER TABLE investigador ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
ALTER TABLE proyecto ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
ALTER TABLE historial_puntaje ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
ALTER TABLE entregable ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- B. Crear la función genérica
CREATE OR REPLACE FUNCTION public.actualizar_campo_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- C. Enganchar los triggers a las tablas
CREATE TRIGGER trg_investigador_updated_at BEFORE UPDATE ON investigador
FOR EACH ROW EXECUTE FUNCTION public.actualizar_campo_updated_at();

CREATE TRIGGER trg_proyecto_updated_at BEFORE UPDATE ON proyecto
FOR EACH ROW EXECUTE FUNCTION public.actualizar_campo_updated_at();

CREATE TRIGGER trg_historial_puntaje_updated_at BEFORE UPDATE ON historial_puntaje
FOR EACH ROW EXECUTE FUNCTION public.actualizar_campo_updated_at();

CREATE TRIGGER trg_entregable_updated_at BEFORE UPDATE ON entregable
FOR EACH ROW EXECUTE FUNCTION public.actualizar_campo_updated_at();


-- ------------------------------------------------------------------------------------
-- 2. TRIGGER DE SINCRONIZACIÓN DE USUARIOS (Caso 1 - Supabase Auth)
-- ------------------------------------------------------------------------------------

-- A. Crear la función que traslada datos del esquema auth al esquema public
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.usuario (id_usuario, correo_institucional, rol_sistema)
  VALUES (new.id, new.email, 'Docente'); -- Rol por defecto
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- B. Enganchar el trigger al esquema de autenticación de Supabase
-- Nota: Si el trigger ya existe, lo eliminamos primero para evitar errores
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- ------------------------------------------------------------------------------------
-- 3. TRIGGER DE CÁLCULO AUTOMÁTICO DE DEUDAS (Caso 2)
-- ------------------------------------------------------------------------------------

-- A. Crear la función que evalúa si un docente cae en falta por entregables
CREATE OR REPLACE FUNCTION public.calcular_deuda_investigador()
RETURNS TRIGGER AS $$
BEGIN
    -- Si el estado del entregable pasa a Vencido o No Entregado
    IF NEW.estado_entregable IN ('Vencido', 'No Entregado') THEN
        -- Actualizamos a deuda = TRUE a los investigadores que son Responsables de ese proyecto
        UPDATE investigador 
        SET tiene_deuda_pi = TRUE
        WHERE dni IN (
            SELECT dni_investigador 
            FROM investigador_proyecto 
            WHERE codigo_proyecto = NEW.codigo_proyecto 
            AND condicion_rol = 'Responsable'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- B. Enganchar el trigger a la tabla entregable
CREATE TRIGGER trg_calcular_deuda_pi
AFTER UPDATE OF estado_entregable ON entregable
FOR EACH ROW
EXECUTE FUNCTION public.calcular_deuda_investigador();


-- ------------------------------------------------------------------------------------
-- 4. TRIGGER DE CIERRE AUTOMÁTICO DE PROYECTO (Caso 3)
-- ------------------------------------------------------------------------------------

-- A. Crear la función que evalúa si el proyecto ya finalizó todos sus entregables
CREATE OR REPLACE FUNCTION public.verificar_cierre_proyecto()
RETURNS TRIGGER AS $$
DECLARE
    entregables_pendientes INT;
BEGIN
    -- Solo evaluamos si el entregable fue Aprobado
    IF NEW.estado_entregable = 'Aprobado' THEN
        -- Contamos cuántos entregables de este proyecto NO están aprobados
        SELECT COUNT(*) INTO entregables_pendientes
        FROM entregable
        WHERE codigo_proyecto = NEW.codigo_proyecto
          AND estado_entregable != 'Aprobado';

        -- Si no hay pendientes, el proyecto se da por Culminado
        IF entregables_pendientes = 0 THEN
            UPDATE proyecto
            SET estado_proyecto = 'Culminado'
            WHERE codigo_proyecto = NEW.codigo_proyecto;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- B. Enganchar el trigger a la tabla entregable
CREATE TRIGGER trg_cierre_automatico_proyecto
AFTER UPDATE OF estado_entregable ON entregable
FOR EACH ROW
EXECUTE FUNCTION public.verificar_cierre_proyecto();

-- ====================================================================================
-- FIN DEL SCRIPT
-- ====================================================================================
