// supabase/tesis.js
// Módulo CRUD + consultas para la tabla `tesis` (Producción Científica Cybertesis)

import { supabase } from './client.js'

// ─── SELECT ──────────────────────────────────────────────────────────────────

/** Obtiene todas las tesis ordenadas por año de publicación descendente. */
export async function getAllTesis() {
  const { data, error } = await supabase
    .from('tesis')
    .select('url_cybertesis, titulo_tesis, autor_estudiante_texto, asesor_texto, nivel_grado, anio_publicacion, escuela_profesional')
    .order('anio_publicacion', { ascending: false })
  if (error) console.error('❌ getAllTesis:', error.message)
  return { data, error }
}

/** Obtiene una tesis por su URL de Cybertesis (PK). */
export async function getTesisByUrl(urlCybertesis) {
  const { data, error } = await supabase
    .from('tesis')
    .select('*')
    .eq('url_cybertesis', urlCybertesis)
    .single()
  if (error) console.error('❌ getTesisByUrl:', error.message)
  return { data, error }
}

/** Obtiene tesis asesoradas por un investigador (por DNI). */
export async function getTesisByAsesor(dniAsesor) {
  const { data, error } = await supabase
    .from('tesis')
    .select(`
      url_cybertesis,
      titulo_tesis,
      autor_estudiante_texto,
      nivel_grado,
      anio_publicacion,
      escuela_profesional,
      grado_obtenido,
      investigador!tesis_dni_asesor_fkey ( nombres, apellidos )
    `)
    .eq('dni_asesor', dniAsesor)
    .order('anio_publicacion', { ascending: false })
  if (error) console.error(`❌ getTesisByAsesor(${dniAsesor}):`, error.message)
  return { data, error }
}

/** Filtra tesis por año de publicación. */
export async function getTesisByAnio(anio) {
  const { data, error } = await supabase
    .from('tesis')
    .select('*')
    .eq('anio_publicacion', anio)
    .order('titulo_tesis', { ascending: true })
  if (error) console.error(`❌ getTesisByAnio(${anio}):`, error.message)
  return { data, error }
}

/** Filtra tesis por nivel de grado (ej: 'Pregrado', 'Maestría', 'Doctorado'). */
export async function getTesisByNivelGrado(nivelGrado) {
  const { data, error } = await supabase
    .from('tesis')
    .select('url_cybertesis, titulo_tesis, autor_estudiante_texto, asesor_texto, anio_publicacion, grado_obtenido')
    .eq('nivel_grado', nivelGrado)
    .order('anio_publicacion', { ascending: false })
  if (error) console.error(`❌ getTesisByNivelGrado(${nivelGrado}):`, error.message)
  return { data, error }
}

/** Busca tesis por palabras en el título. */
export async function buscarTesisPorTitulo(texto) {
  const { data, error } = await supabase
    .from('tesis')
    .select('url_cybertesis, titulo_tesis, autor_estudiante_texto, anio_publicacion')
    .ilike('titulo_tesis', `%${texto}%`)
  if (error) console.error('❌ buscarTesisPorTitulo:', error.message)
  return { data, error }
}

// ─── INSERT ───────────────────────────────────────────────────────────────────

/**
 * Registra una nueva tesis.
 * @param {object} datos - Requiere: url_cybertesis, titulo_tesis, autor_estudiante_texto, asesor_texto
 */
export async function insertTesis(datos) {
  const { data, error } = await supabase
    .from('tesis')
    .insert(datos)
    .select()
  if (error) console.error('❌ insertTesis:', error.message)
  else console.log(`✅ Tesis registrada: ${datos.titulo_tesis?.substring(0, 50)}...`)
  return { data, error }
}

// ─── UPDATE ───────────────────────────────────────────────────────────────────

/**
 * Actualiza una tesis por su URL (PK).
 * @param {string} urlCybertesis
 * @param {object} cambios
 */
export async function updateTesis(urlCybertesis, cambios) {
  const { data, error } = await supabase
    .from('tesis')
    .update(cambios)
    .eq('url_cybertesis', urlCybertesis)
    .select()
  if (error) console.error('❌ updateTesis:', error.message)
  else console.log(`✅ Tesis actualizada: ${urlCybertesis}`)
  return { data, error }
}

// ─── DELETE ───────────────────────────────────────────────────────────────────

/** Elimina una tesis por su URL (PK). */
export async function deleteTesis(urlCybertesis) {
  const { data, error } = await supabase
    .from('tesis')
    .delete()
    .eq('url_cybertesis', urlCybertesis)
    .select()
  if (error) console.error('❌ deleteTesis:', error.message)
  else console.log(`✅ Tesis eliminada: ${urlCybertesis}`)
  return { data, error }
}
