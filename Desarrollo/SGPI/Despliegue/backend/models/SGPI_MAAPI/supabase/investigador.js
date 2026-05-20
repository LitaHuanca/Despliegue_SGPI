// supabase/investigador.js
// Módulo CRUD + consultas para la tabla `investigador`

import { supabase } from './client.js'

// ─── SELECT ──────────────────────────────────────────────────────────────────

/** Obtiene todos los investigadores. */
export async function getAllInvestigadores() {
  const { data, error } = await supabase
    .from('investigador')
    .select('*')
    .order('apellidos', { ascending: true })
  if (error) console.error('❌ getAllInvestigadores:', error.message)
  return { data, error }
}

/** Obtiene un investigador por su DNI. */
export async function getInvestigadorByDni(dni) {
  const { data, error } = await supabase
    .from('investigador')
    .select('*')
    .eq('dni', dni)
    .single()
  if (error) console.error(`❌ getInvestigadorByDni(${dni}):`, error.message)
  return { data, error }
}

/** Busca investigadores por apellido (búsqueda parcial, insensible a mayúsculas). */
export async function buscarPorApellido(apellido) {
  const { data, error } = await supabase
    .from('investigador')
    .select('*')
    .ilike('apellidos', `%${apellido}%`)
    .order('apellidos', { ascending: true })
  if (error) console.error('❌ buscarPorApellido:', error.message)
  return { data, error }
}

/** Obtiene investigadores registrados en RENACYT (con código asignado). */
export async function getInvestigadoresRenacyt() {
  const { data, error } = await supabase
    .from('investigador')
    .select('dni, nombres, apellidos, codigo_renacyt, categoria_renacyt, estado_renacyt')
    .not('codigo_renacyt', 'is', null)
    .order('apellidos', { ascending: true })
  if (error) console.error('❌ getInvestigadoresRenacyt:', error.message)
  return { data, error }
}

/** Obtiene investigadores con deuda (GI o PI). */
export async function getInvestigadoresConDeuda() {
  const { data, error } = await supabase
    .from('investigador')
    .select('dni, nombres, apellidos, tiene_deuda_gi, tiene_deuda_pi')
    .or('tiene_deuda_gi.eq.true,tiene_deuda_pi.eq.true')
  if (error) console.error('❌ getInvestigadoresConDeuda:', error.message)
  return { data, error }
}

/**
 * Obtiene un investigador con todos sus proyectos asignados (JOIN).
 * Incluye el rol de cada proyecto.
 */
export async function getInvestigadorConProyectos(dni) {
  const { data, error } = await supabase
    .from('investigador')
    .select(`
      *,
      investigador_proyecto (
        condicion_rol,
        tipo_vinculo,
        condicion_gi,
        proyecto (
          codigo_proyecto,
          titulo_proyecto,
          estado_proyecto,
          anio_convocatoria,
          presupuesto_asignado
        )
      )
    `)
    .eq('dni', dni)
    .single()
  if (error) console.error(`❌ getInvestigadorConProyectos(${dni}):`, error.message)
  return { data, error }
}

/**
 * Obtiene un investigador con su historial de puntajes RAIS.
 */
export async function getInvestigadorConHistorial(dni) {
  const { data, error } = await supabase
    .from('investigador')
    .select(`
      dni, nombres, apellidos,
      historial_puntaje (
        anio_evaluacion,
        puntaje_total,
        puntaje_revistas,
        puntaje_libros,
        puntaje_proyectos,
        puntaje_patentes,
        puntaje_tesis,
        puntaje_otros
      )
    `)
    .eq('dni', dni)
    .single()
  if (error) console.error(`❌ getInvestigadorConHistorial(${dni}):`, error.message)
  return { data, error }
}

/**
 * Obtiene un investigador con las tesis que ha asesorado.
 */
export async function getInvestigadorConTesis(dni) {
  const { data, error } = await supabase
    .from('investigador')
    .select(`
      dni, nombres, apellidos, orcid,
      tesis (
        url_cybertesis,
        titulo_tesis,
        autor_estudiante_texto,
        nivel_grado,
        anio_publicacion,
        escuela_profesional
      )
    `)
    .eq('dni', dni)
    .single()
  if (error) console.error(`❌ getInvestigadorConTesis(${dni}):`, error.message)
  return { data, error }
}

// ─── INSERT ───────────────────────────────────────────────────────────────────

/**
 * Registra un nuevo investigador en el padrón.
 * @param {object} datos - Campos del investigador (dni, nombres, apellidos son obligatorios)
 */
export async function insertInvestigador(datos) {
  const { data, error } = await supabase
    .from('investigador')
    .insert(datos)
    .select()
  if (error) console.error('❌ insertInvestigador:', error.message)
  else console.log(`✅ Investigador registrado: ${datos.apellidos}, ${datos.nombres}`)
  return { data, error }
}

// ─── UPDATE ───────────────────────────────────────────────────────────────────

/**
 * Actualiza datos de un investigador por su DNI.
 * @param {string} dni
 * @param {object} cambios - Campos a actualizar
 */
export async function updateInvestigador(dni, cambios) {
  const { data, error } = await supabase
    .from('investigador')
    .update(cambios)
    .eq('dni', dni)
    .select()
  if (error) console.error(`❌ updateInvestigador(${dni}):`, error.message)
  else console.log(`✅ Investigador ${dni} actualizado`)
  return { data, error }
}

/**
 * Marca o desmarca la deuda de un investigador.
 * @param {string} dni
 * @param {'GI'|'PI'} tipo - Tipo de deuda
 * @param {boolean} valor
 */
export async function setDeudaInvestigador(dni, tipo, valor) {
  const campo = tipo === 'GI' ? 'tiene_deuda_gi' : 'tiene_deuda_pi'
  return updateInvestigador(dni, { [campo]: valor })
}

// ─── DELETE ───────────────────────────────────────────────────────────────────

/**
 * Elimina un investigador del padrón por su DNI.
 * ⚠️  Elimina en cascada sus historial_puntaje e investigador_proyecto.
 */
export async function deleteInvestigador(dni) {
  const { data, error } = await supabase
    .from('investigador')
    .delete()
    .eq('dni', dni)
    .select()
  if (error) console.error(`❌ deleteInvestigador(${dni}):`, error.message)
  else console.log(`✅ Investigador ${dni} eliminado`)
  return { data, error }
}
