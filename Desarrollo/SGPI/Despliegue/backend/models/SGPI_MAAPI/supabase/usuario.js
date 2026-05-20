// supabase/usuario.js
// Módulo CRUD para la tabla `usuario` (Seguridad y Accesos - integrado con Supabase Auth)

import { supabase } from './client.js'

// ─── SELECT ──────────────────────────────────────────────────────────────────

/** Obtiene todos los usuarios del sistema con su investigador vinculado. */
export async function getAllUsuarios() {
  const { data, error } = await supabase
    .from('usuario')
    .select(`
      id_usuario,
      correo_institucional,
      rol_sistema,
      created_at,
      investigador ( dni, nombres, apellidos )
    `)
    .order('rol_sistema', { ascending: true })
  if (error) console.error('❌ getAllUsuarios:', error.message)
  return { data, error }
}

/** Obtiene un usuario por correo institucional. */
export async function getUsuarioByCorreo(correo) {
  const { data, error } = await supabase
    .from('usuario')
    .select(`
      id_usuario,
      correo_institucional,
      rol_sistema,
      investigador ( dni, nombres, apellidos, facultad_dependencia )
    `)
    .eq('correo_institucional', correo)
    .single()
  if (error) console.error(`❌ getUsuarioByCorreo(${correo}):`, error.message)
  return { data, error }
}

/** Obtiene usuarios filtrados por rol del sistema. */
export async function getUsuariosByRol(rol) {
  const { data, error } = await supabase
    .from('usuario')
    .select(`
      id_usuario,
      correo_institucional,
      investigador ( dni, nombres, apellidos )
    `)
    .eq('rol_sistema', rol)
  if (error) console.error(`❌ getUsuariosByRol(${rol}):`, error.message)
  return { data, error }
}

// ─── INSERT ───────────────────────────────────────────────────────────────────

/**
 * Registra un usuario en la tabla `usuario` después de que Supabase Auth
 * haya creado el auth.users correspondiente.
 * 
 * ⚠️ El `id_usuario` debe ser el UUID devuelto por Supabase Auth al crear el usuario.
 * 
 * @param {object} datos - { id_usuario (UUID), correo_institucional, rol_sistema, dni_investigador? }
 */
export async function insertUsuario(datos) {
  const { data, error } = await supabase
    .from('usuario')
    .insert(datos)
    .select()
  if (error) console.error('❌ insertUsuario:', error.message)
  else console.log(`✅ Usuario registrado: ${datos.correo_institucional} [${datos.rol_sistema}]`)
  return { data, error }
}

// ─── UPDATE ───────────────────────────────────────────────────────────────────

/**
 * Actualiza el rol o vinculación de un usuario por su UUID.
 * @param {string} idUsuario - UUID del usuario
 * @param {object} cambios - { rol_sistema?, dni_investigador? }
 */
export async function updateUsuario(idUsuario, cambios) {
  const { data, error } = await supabase
    .from('usuario')
    .update(cambios)
    .eq('id_usuario', idUsuario)
    .select()
  if (error) console.error(`❌ updateUsuario(${idUsuario}):`, error.message)
  else console.log(`✅ Usuario ${idUsuario} actualizado`)
  return { data, error }
}

// ─── DELETE ───────────────────────────────────────────────────────────────────

/**
 * Elimina un usuario de la tabla `usuario`.
 * ⚠️ Esto NO elimina el usuario de auth.users. Para eliminar completamente,
 * usa el Admin SDK o el panel de Supabase.
 */
export async function deleteUsuario(idUsuario) {
  const { data, error } = await supabase
    .from('usuario')
    .delete()
    .eq('id_usuario', idUsuario)
    .select()
  if (error) console.error(`❌ deleteUsuario(${idUsuario}):`, error.message)
  else console.log(`✅ Usuario ${idUsuario} eliminado de tabla usuario`)
  return { data, error }
}

// ─── AUTH HELPERS ─────────────────────────────────────────────────────────────

/**
 * Inicia sesión con correo y contraseña (Supabase Auth).
 * @param {string} correo
 * @param {string} password
 */
export async function login(correo, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: correo,
    password: password,
  })
  if (error) console.error('❌ login:', error.message)
  else console.log(`✅ Sesión iniciada: ${correo}`)
  return { data, error }
}

/** Cierra la sesión del usuario actual. */
export async function logout() {
  const { error } = await supabase.auth.signOut()
  if (error) console.error('❌ logout:', error.message)
  else console.log('✅ Sesión cerrada')
  return { error }
}

/** Obtiene el usuario autenticado actualmente (desde Auth). */
export async function getUsuarioActual() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) console.error('❌ getUsuarioActual:', error.message)
  return { user, error }
}
