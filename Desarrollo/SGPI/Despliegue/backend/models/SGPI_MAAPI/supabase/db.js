// supabase/db.js
// Módulo de helpers CRUD genéricos para Supabase
// Usa el cliente singleton de client.js

import { supabase } from './client.js'

// ─────────────────────────────────────────────
// SELECT — Leer registros
// ─────────────────────────────────────────────

/**
 * Obtiene todos los registros de una tabla.
 * @param {string} table - Nombre de la tabla
 * @param {string} [columns='*'] - Columnas a seleccionar (separadas por coma)
 * @returns {Promise<{data: any[], error: any}>}
 */
export async function getAll(table, columns = '*') {
  const { data, error } = await supabase
    .from(table)
    .select(columns)

  if (error) console.error(`❌ getAll(${table}):`, error.message)
  return { data, error }
}

/**
 * Obtiene un registro por su ID.
 * @param {string} table - Nombre de la tabla
 * @param {number|string} id - Valor del ID
 * @param {string} [idColumn='id'] - Nombre de la columna ID
 * @returns {Promise<{data: any, error: any}>}
 */
export async function getById(table, id, idColumn = 'id') {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq(idColumn, id)
    .single()

  if (error) console.error(`❌ getById(${table}, ${id}):`, error.message)
  return { data, error }
}

/**
 * Filtra registros con condiciones personalizadas.
 * @param {string} table - Nombre de la tabla
 * @param {Record<string, any>} filters - Objeto { columna: valor }
 * @param {string} [columns='*'] - Columnas a seleccionar
 * @returns {Promise<{data: any[], error: any}>}
 */
export async function getWhere(table, filters = {}, columns = '*') {
  let query = supabase.from(table).select(columns)

  for (const [column, value] of Object.entries(filters)) {
    query = query.eq(column, value)
  }

  const { data, error } = await query

  if (error) console.error(`❌ getWhere(${table}):`, error.message)
  return { data, error }
}

// ─────────────────────────────────────────────
// INSERT — Crear registros
// ─────────────────────────────────────────────

/**
 * Inserta un nuevo registro (o varios).
 * @param {string} table - Nombre de la tabla
 * @param {object|object[]} payload - Objeto o array de objetos a insertar
 * @returns {Promise<{data: any, error: any}>}
 */
export async function insert(table, payload) {
  const { data, error } = await supabase
    .from(table)
    .insert(payload)
    .select()

  if (error) console.error(`❌ insert(${table}):`, error.message)
  else console.log(`✅ insert(${table}): ${Array.isArray(payload) ? payload.length : 1} registro(s) insertado(s)`)
  return { data, error }
}

// ─────────────────────────────────────────────
// UPDATE — Actualizar registros
// ─────────────────────────────────────────────

/**
 * Actualiza un registro por su ID.
 * @param {string} table - Nombre de la tabla
 * @param {number|string} id - Valor del ID
 * @param {object} payload - Campos a actualizar
 * @param {string} [idColumn='id'] - Nombre de la columna ID
 * @returns {Promise<{data: any, error: any}>}
 */
export async function updateById(table, id, payload, idColumn = 'id') {
  const { data, error } = await supabase
    .from(table)
    .update(payload)
    .eq(idColumn, id)
    .select()

  if (error) console.error(`❌ updateById(${table}, ${id}):`, error.message)
  else console.log(`✅ updateById(${table}, ${id}): actualizado`)
  return { data, error }
}

// ─────────────────────────────────────────────
// DELETE — Eliminar registros
// ─────────────────────────────────────────────

/**
 * Elimina un registro por su ID.
 * @param {string} table - Nombre de la tabla
 * @param {number|string} id - Valor del ID
 * @param {string} [idColumn='id'] - Nombre de la columna ID
 * @returns {Promise<{data: any, error: any}>}
 */
export async function deleteById(table, id, idColumn = 'id') {
  const { data, error } = await supabase
    .from(table)
    .delete()
    .eq(idColumn, id)
    .select()

  if (error) console.error(`❌ deleteById(${table}, ${id}):`, error.message)
  else console.log(`✅ deleteById(${table}, ${id}): eliminado`)
  return { data, error }
}

// ─────────────────────────────────────────────
// UTILIDAD — Verificar conexión
// ─────────────────────────────────────────────

/**
 * Verifica la conexión al servidor de Supabase.
 * Hace un ping simple y muestra el resultado.
 */
export async function testConnection() {
  console.log('\n🔌 Verificando conexión a Supabase...')
  try {
    // Intentamos listar las tablas públicas del schema (no requiere tabla específica)
    const { error } = await supabase.rpc('version').maybeSingle()

    if (error && error.code !== 'PGRST202') {
      // PGRST202 = función no encontrada, pero sí hay conexión
      console.warn('⚠️  Conexión establecida, pero con advertencia:', error.message)
    } else {
      console.log('✅ Conexión exitosa con Supabase!')
    }
  } catch (err) {
    console.error('❌ Error de red al conectar con Supabase:', err.message)
  }
}
