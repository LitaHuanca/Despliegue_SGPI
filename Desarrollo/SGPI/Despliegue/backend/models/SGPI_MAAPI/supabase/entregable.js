// supabase/entregable.js
// Módulo CRUD para la tabla `entregable` (Monitoreo de proyectos)

import { supabase } from './client.js'

// ─── SELECT ──────────────────────────────────────────────────────────────────

/** Obtiene todos los entregables de un proyecto. */
export async function getEntregablesByProyecto(codigoProyecto) {
  const { data, error } = await supabase
    .from('entregable')
    .select('*')
    .eq('codigo_proyecto', codigoProyecto)
    .order('fecha_limite_programada', { ascending: true })
  if (error) console.error(`❌ getEntregablesByProyecto(${codigoProyecto}):`, error.message)
  return { data, error }
}

/** Obtiene entregables filtrados por estado (ej: 'Pendiente', 'Entregado', 'Atrasado'). */
export async function getEntregablesByEstado(estado) {
  const { data, error } = await supabase
    .from('entregable')
    .select(`
      *,
      proyecto ( codigo_proyecto, titulo_proyecto )
    `)
    .eq('estado_entregable', estado)
    .order('fecha_limite_programada', { ascending: true })
  if (error) console.error(`❌ getEntregablesByEstado(${estado}):`, error.message)
  return { data, error }
}

/** Obtiene entregables pendientes con fecha límite próxima (dentro de N días). */
export async function getEntregablesProximos(diasLimite = 30) {
  const hoy = new Date()
  const limite = new Date()
  limite.setDate(hoy.getDate() + diasLimite)

  const { data, error } = await supabase
    .from('entregable')
    .select(`
      *,
      proyecto ( codigo_proyecto, titulo_proyecto )
    `)
    .eq('estado_entregable', 'Pendiente')
    .gte('fecha_limite_programada', hoy.toISOString().split('T')[0])
    .lte('fecha_limite_programada', limite.toISOString().split('T')[0])
    .order('fecha_limite_programada', { ascending: true })
  if (error) console.error('❌ getEntregablesProximos:', error.message)
  return { data, error }
}

// ─── INSERT ───────────────────────────────────────────────────────────────────

/**
 * Registra un nuevo entregable para un proyecto.
 * @param {object} datos - { codigo_proyecto, tipo_entregable, fecha_limite_programada, ... }
 */
export async function insertEntregable(datos) {
  const { data, error } = await supabase
    .from('entregable')
    .insert(datos)
    .select()
  if (error) console.error('❌ insertEntregable:', error.message)
  else console.log(`✅ Entregable registrado: ${datos.tipo_entregable} - Proyecto ${datos.codigo_proyecto}`)
  return { data, error }
}

// ─── UPDATE ───────────────────────────────────────────────────────────────────

/**
 * Actualiza un entregable por su ID.
 * @param {number} idEntregable
 * @param {object} cambios
 */
export async function updateEntregable(idEntregable, cambios) {
  const { data, error } = await supabase
    .from('entregable')
    .update(cambios)
    .eq('id_entregable', idEntregable)
    .select()
  if (error) console.error(`❌ updateEntregable(${idEntregable}):`, error.message)
  else console.log(`✅ Entregable ${idEntregable} actualizado`)
  return { data, error }
}

/**
 * Marca un entregable como entregado, registrando la fecha real.
 * @param {number} idEntregable
 * @param {string} [archivoUrl] - URL del archivo adjunto (opcional)
 */
export async function marcarEntregado(idEntregable, archivoUrl = null) {
  const cambios = {
    estado_entregable: 'Entregado',
    fecha_entrega_real: new Date().toISOString().split('T')[0],
  }
  if (archivoUrl) cambios.archivo_url = archivoUrl
  return updateEntregable(idEntregable, cambios)
}

// ─── DELETE ───────────────────────────────────────────────────────────────────

/** Elimina un entregable por su ID. */
export async function deleteEntregable(idEntregable) {
  const { data, error } = await supabase
    .from('entregable')
    .delete()
    .eq('id_entregable', idEntregable)
    .select()
  if (error) console.error(`❌ deleteEntregable(${idEntregable}):`, error.message)
  else console.log(`✅ Entregable ${idEntregable} eliminado`)
  return { data, error }
}
