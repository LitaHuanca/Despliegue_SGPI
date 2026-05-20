// supabase/historial.js
// Módulo CRUD para la tabla `historial_puntaje` (Auditoría RAIS)

import { supabase } from './client.js'

// ─── SELECT ──────────────────────────────────────────────────────────────────

/** Obtiene todo el historial de puntajes de un investigador por DNI. */
export async function getHistorialByDni(dni) {
  const { data, error } = await supabase
    .from('historial_puntaje')
    .select('*')
    .eq('dni_investigador', dni)
    .order('anio_evaluacion', { ascending: false })
  if (error) console.error(`❌ getHistorialByDni(${dni}):`, error.message)
  return { data, error }
}

/** Obtiene el historial de un investigador en un año específico. */
export async function getHistorialByDniYAnio(dni, anio) {
  const { data, error } = await supabase
    .from('historial_puntaje')
    .select('*')
    .eq('dni_investigador', dni)
    .eq('anio_evaluacion', anio)
    .single()
  if (error) console.error(`❌ getHistorialByDniYAnio(${dni}, ${anio}):`, error.message)
  return { data, error }
}

/** Obtiene todos los puntajes de un año de evaluación específico (ranking). */
export async function getRankingByAnio(anio) {
  const { data, error } = await supabase
    .from('historial_puntaje')
    .select(`
      puntaje_total,
      anio_evaluacion,
      investigador ( dni, nombres, apellidos, facultad_dependencia )
    `)
    .eq('anio_evaluacion', anio)
    .order('puntaje_total', { ascending: false })
  if (error) console.error(`❌ getRankingByAnio(${anio}):`, error.message)
  return { data, error }
}

// ─── INSERT ───────────────────────────────────────────────────────────────────

/**
 * Registra un nuevo puntaje anual para un investigador.
 * @param {object} datos - { dni_investigador, anio_evaluacion, puntaje_total, ... }
 */
export async function insertHistorial(datos) {
  const { data, error } = await supabase
    .from('historial_puntaje')
    .insert(datos)
    .select()
  if (error) console.error('❌ insertHistorial:', error.message)
  else console.log(`✅ Historial registrado: DNI ${datos.dni_investigador} - Año ${datos.anio_evaluacion}`)
  return { data, error }
}

// ─── UPDATE ───────────────────────────────────────────────────────────────────

/**
 * Actualiza el puntaje de un historial por su ID.
 * @param {number} idHistorial
 * @param {object} cambios
 */
export async function updateHistorial(idHistorial, cambios) {
  const { data, error } = await supabase
    .from('historial_puntaje')
    .update(cambios)
    .eq('id_historial', idHistorial)
    .select()
  if (error) console.error(`❌ updateHistorial(${idHistorial}):`, error.message)
  else console.log(`✅ Historial ${idHistorial} actualizado`)
  return { data, error }
}

// ─── DELETE ───────────────────────────────────────────────────────────────────

/** Elimina un historial de puntaje por su ID. */
export async function deleteHistorial(idHistorial) {
  const { data, error } = await supabase
    .from('historial_puntaje')
    .delete()
    .eq('id_historial', idHistorial)
    .select()
  if (error) console.error(`❌ deleteHistorial(${idHistorial}):`, error.message)
  else console.log(`✅ Historial ${idHistorial} eliminado`)
  return { data, error }
}
