// supabase/proyecto.js
// Módulo CRUD + consultas para la tabla `proyecto`

import { supabase } from './client.js'

// ─── SELECT ──────────────────────────────────────────────────────────────────

/** Obtiene todos los proyectos ordenados por año de convocatoria descendente. */
export async function getAllProyectos() {
  const { data, error } = await supabase
    .from('proyecto')
    .select('*')
    .order('anio_convocatoria', { ascending: false })
  if (error) console.error('❌ getAllProyectos:', error.message)
  return { data, error }
}

/** Obtiene un proyecto por su código. */
export async function getProyectoByCodigo(codigoProyecto) {
  const { data, error } = await supabase
    .from('proyecto')
    .select('*')
    .eq('codigo_proyecto', codigoProyecto)
    .single()
  if (error) console.error(`❌ getProyectoByCodigo(${codigoProyecto}):`, error.message)
  return { data, error }
}

/** Filtra proyectos por estado (ej: 'Aprobado', 'En ejecución', 'Finalizado'). */
export async function getProyectosByEstado(estado) {
  const { data, error } = await supabase
    .from('proyecto')
    .select('*')
    .eq('estado_proyecto', estado)
    .order('anio_convocatoria', { ascending: false })
  if (error) console.error(`❌ getProyectosByEstado(${estado}):`, error.message)
  return { data, error }
}

/** Filtra proyectos por año de convocatoria. */
export async function getProyectosByAnio(anio) {
  const { data, error } = await supabase
    .from('proyecto')
    .select('*')
    .eq('anio_convocatoria', anio)
    .order('titulo_proyecto', { ascending: true })
  if (error) console.error(`❌ getProyectosByAnio(${anio}):`, error.message)
  return { data, error }
}

/** Busca proyectos por título (búsqueda parcial). */
export async function buscarProyectosPorTitulo(texto) {
  const { data, error } = await supabase
    .from('proyecto')
    .select('*')
    .ilike('titulo_proyecto', `%${texto}%`)
  if (error) console.error('❌ buscarProyectosPorTitulo:', error.message)
  return { data, error }
}

/**
 * Obtiene un proyecto con todos sus investigadores asignados (con rol).
 */
export async function getProyectoConInvestigadores(codigoProyecto) {
  const { data, error } = await supabase
    .from('proyecto')
    .select(`
      *,
      investigador_proyecto (
        condicion_rol,
        tipo_vinculo,
        condicion_gi,
        facultad_integrante,
        investigador (
          dni,
          nombres,
          apellidos,
          grado_academico_max,
          codigo_renacyt
        )
      )
    `)
    .eq('codigo_proyecto', codigoProyecto)
    .single()
  if (error) console.error(`❌ getProyectoConInvestigadores(${codigoProyecto}):`, error.message)
  return { data, error }
}

/**
 * Obtiene un proyecto con sus estudiantes asignados.
 */
export async function getProyectoConEstudiantes(codigoProyecto) {
  const { data, error } = await supabase
    .from('proyecto')
    .select(`
      codigo_proyecto,
      titulo_proyecto,
      estado_proyecto,
      estudiante_proyecto (
        id_registro,
        codigo_matricula,
        apellidos_nombres,
        condicion_rol,
        tipo_vinculo,
        facultad_integrante
      )
    `)
    .eq('codigo_proyecto', codigoProyecto)
    .single()
  if (error) console.error(`❌ getProyectoConEstudiantes(${codigoProyecto}):`, error.message)
  return { data, error }
}

/**
 * Obtiene un proyecto con todos sus entregables de monitoreo.
 */
export async function getProyectoConEntregables(codigoProyecto) {
  const { data, error } = await supabase
    .from('proyecto')
    .select(`
      codigo_proyecto,
      titulo_proyecto,
      estado_proyecto,
      entregable (
        id_entregable,
        tipo_entregable,
        fecha_limite_programada,
        fecha_entrega_real,
        estado_entregable,
        archivo_url
      )
    `)
    .eq('codigo_proyecto', codigoProyecto)
    .single()
  if (error) console.error(`❌ getProyectoConEntregables(${codigoProyecto}):`, error.message)
  return { data, error }
}

/**
 * Vista completa de un proyecto: investigadores + estudiantes + entregables.
 */
export async function getProyectoCompleto(codigoProyecto) {
  const { data, error } = await supabase
    .from('proyecto')
    .select(`
      *,
      investigador_proyecto (
        condicion_rol, tipo_vinculo, condicion_gi,
        investigador ( dni, nombres, apellidos, grado_academico_max )
      ),
      estudiante_proyecto ( codigo_matricula, apellidos_nombres, condicion_rol ),
      entregable ( tipo_entregable, estado_entregable, fecha_limite_programada, fecha_entrega_real )
    `)
    .eq('codigo_proyecto', codigoProyecto)
    .single()
  if (error) console.error(`❌ getProyectoCompleto(${codigoProyecto}):`, error.message)
  return { data, error }
}

// ─── INSERT ───────────────────────────────────────────────────────────────────

/**
 * Registra un nuevo proyecto.
 * @param {object} datos - Incluir codigo_proyecto y titulo_proyecto como mínimo
 */
export async function insertProyecto(datos) {
  const { data, error } = await supabase
    .from('proyecto')
    .insert(datos)
    .select()
  if (error) console.error('❌ insertProyecto:', error.message)
  else console.log(`✅ Proyecto registrado: ${datos.codigo_proyecto}`)
  return { data, error }
}

// ─── UPDATE ───────────────────────────────────────────────────────────────────

/**
 * Actualiza datos de un proyecto.
 * @param {string} codigoProyecto
 * @param {object} cambios
 */
export async function updateProyecto(codigoProyecto, cambios) {
  const { data, error } = await supabase
    .from('proyecto')
    .update(cambios)
    .eq('codigo_proyecto', codigoProyecto)
    .select()
  if (error) console.error(`❌ updateProyecto(${codigoProyecto}):`, error.message)
  else console.log(`✅ Proyecto ${codigoProyecto} actualizado`)
  return { data, error }
}

/** Cambia el estado de un proyecto. */
export async function cambiarEstadoProyecto(codigoProyecto, nuevoEstado) {
  return updateProyecto(codigoProyecto, { estado_proyecto: nuevoEstado })
}

// ─── DELETE ───────────────────────────────────────────────────────────────────

/**
 * Elimina un proyecto. ⚠️ Elimina en cascada investigador_proyecto,
 * estudiante_proyecto y entregable relacionados.
 */
export async function deleteProyecto(codigoProyecto) {
  const { data, error } = await supabase
    .from('proyecto')
    .delete()
    .eq('codigo_proyecto', codigoProyecto)
    .select()
  if (error) console.error(`❌ deleteProyecto(${codigoProyecto}):`, error.message)
  else console.log(`✅ Proyecto ${codigoProyecto} eliminado`)
  return { data, error }
}

// ─── INVESTIGADOR_PROYECTO (relación N:M) ─────────────────────────────────────

/**
 * Asigna un investigador a un proyecto.
 * @param {string} codigoProyecto
 * @param {string} dniInvestigador
 * @param {object} extras - { condicion_rol, tipo_vinculo, facultad_integrante, condicion_gi }
 */
export async function asignarInvestigador(codigoProyecto, dniInvestigador, extras = {}) {
  const { data, error } = await supabase
    .from('investigador_proyecto')
    .insert({ codigo_proyecto: codigoProyecto, dni_investigador: dniInvestigador, ...extras })
    .select()
  if (error) console.error('❌ asignarInvestigador:', error.message)
  else console.log(`✅ Investigador ${dniInvestigador} asignado a proyecto ${codigoProyecto}`)
  return { data, error }
}

/** Desvincula un investigador de un proyecto. */
export async function desasignarInvestigador(codigoProyecto, dniInvestigador) {
  const { data, error } = await supabase
    .from('investigador_proyecto')
    .delete()
    .eq('codigo_proyecto', codigoProyecto)
    .eq('dni_investigador', dniInvestigador)
    .select()
  if (error) console.error('❌ desasignarInvestigador:', error.message)
  else console.log(`✅ Investigador ${dniInvestigador} desvinculado de proyecto ${codigoProyecto}`)
  return { data, error }
}
