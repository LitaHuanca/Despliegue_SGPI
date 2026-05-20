// supabase/importar_renacyt.js
// ============================================================
// Script de importación masiva de investigadores desde la API RENACYT
// 
// USO:
//   node supabase/importar_renacyt.js                        → lee data/renacyt_input.json
//   node supabase/importar_renacyt.js ruta/al/archivo.json   → lee el archivo indicado
//   node supabase/importar_renacyt.js --all                  → sin filtro de institución
//
// FILTRO POR DEFECTO: Solo inserta investigadores de UNMSM.
// Usa --all para desactivar el filtro e importar cualquier institución.
// ============================================================

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import 'dotenv/config'

// ── Cliente administrativo (bypasa RLS) ──────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { auth: { persistSession: false } }
)

// ── Configuración ────────────────────────────────────────────
const INSTITUCION_FILTRO = 'UNIVERSIDAD NACIONAL MAYOR DE SAN MARCOS'
const CTI_BASE_URL = 'https://ctivitae.concytec.gob.pe/appDirectorioCTI/VerDatosInvestigador.do?id_investigador='

// ── Helpers ──────────────────────────────────────────────────
function toTitleCase(str) {
  if (!str) return null
  return str
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

/**
 * Mapea un registro RENACYT al esquema de la tabla `investigador`.
 * @param {object} item - Elemento del array `data` del JSON RENACYT
 * @returns {object} Registro listo para upsert
 */
function mapearRegistro(item) {
  return {
    dni:                  item.numero_documento?.trim(),
    nombres:              toTitleCase(item.nombres),
    apellidos:            toTitleCase(`${item.apellido_paterno ?? ''} ${item.apellido_materno ?? ''}`),
    codigo_renacyt:       item.codigo_registro?.trim() ?? null,
    orcid:                item.orcid?.trim() ?? null,
    categoria_renacyt:    item.nivel?.trim() ?? null,
    estado_renacyt:       item.condicion?.trim() ?? null,
    institucion_principal:item.institucion_laboral_principal?.trim() ?? null,
    url_cti_vitae:        item.cti_vitae
                            ? `${CTI_BASE_URL}${item.cti_vitae.trim()}`
                            : null,
  }
}

/**
 * Valida que un registro mapeado tenga los campos obligatorios.
 * @param {object} registro
 * @returns {{ valido: boolean, razon?: string }}
 */
function validarRegistro(registro) {
  if (!registro.dni)      return { valido: false, razon: 'dni vacío' }
  if (!registro.nombres)  return { valido: false, razon: 'nombres vacío' }
  if (!registro.apellidos)return { valido: false, razon: 'apellidos vacío' }
  return { valido: true }
}

// ── Lógica principal ─────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2)
  const sinFiltro = args.includes('--all')
  const rutaArchivo = args.find(a => !a.startsWith('--')) ?? 'data/renacyt_input.json'

  console.log('╔══════════════════════════════════════════════════════╗')
  console.log('║   SGPI — Importador RENACYT → Tabla investigador     ║')
  console.log('╚══════════════════════════════════════════════════════╝')
  console.log(`\n📂 Archivo fuente : ${rutaArchivo}`)
  console.log(`🏛️  Filtro activo  : ${sinFiltro ? '⛔ Desactivado (--all)' : `✅ Solo "${INSTITUCION_FILTRO}"`}`)

  // 1. Leer y parsear el JSON
  let jsonData
  try {
    const raw = readFileSync(resolve(rutaArchivo), 'utf-8')
    jsonData = JSON.parse(raw)
  } catch (err) {
    console.error(`\n❌ No se pudo leer el archivo "${rutaArchivo}": ${err.message}`)
    console.error('   Asegúrate de que el archivo exista en la ruta indicada.')
    process.exit(1)
  }

  if (!Array.isArray(jsonData?.data)) {
    console.error('\n❌ El JSON no tiene el formato esperado: { "total": N, "data": [...] }')
    process.exit(1)
  }

  const total = jsonData.data.length
  console.log(`\n📊 Registros en el JSON : ${total}`)

  // 2. Filtrar por institución
  const filtrados = sinFiltro
    ? jsonData.data
    : jsonData.data.filter(
        item => item.institucion_laboral_principal?.toUpperCase().includes(
          INSTITUCION_FILTRO.toUpperCase()
        )
      )

  const descartados = total - filtrados.length
  console.log(`🔍 Pasan el filtro     : ${filtrados.length}`)
  if (descartados > 0) {
    console.log(`⚠️  Descartados (otra institución): ${descartados}`)
  }

  if (filtrados.length === 0) {
    console.log('\n⚠️  No hay registros para importar. Saliendo.')
    return
  }

  // 3. Mapear y validar
  const registros = []
  const erroresValidacion = []

  for (const item of filtrados) {
    const registro = mapearRegistro(item)
    const { valido, razon } = validarRegistro(registro)
    if (valido) {
      registros.push(registro)
    } else {
      erroresValidacion.push({ id: item.id, nombre: item.nombre_completo, razon })
    }
  }

  if (erroresValidacion.length > 0) {
    console.log(`\n⚠️  Registros con errores de validación (${erroresValidacion.length}):`)
    erroresValidacion.forEach(e => console.log(`   · ID ${e.id} | ${e.nombre} → ${e.razon}`))
  }

  console.log(`\n✅ Registros listos para upsert: ${registros.length}`)

  // 4. Preview de registros a insertar
  console.log('\n📋 Preview:')
  registros.forEach((r, i) => {
    console.log(`   ${i + 1}. [${r.dni}] ${r.nombres} ${r.apellidos} | RENACYT ${r.codigo_renacyt ?? '—'} Nivel ${r.categoria_renacyt ?? '—'} | ${r.institucion_principal}`)
  })

  // 5. Upsert masivo en Supabase
  console.log('\n🔄 Ejecutando upsert en tabla `investigador`...')

  const { data: resultado, error } = await supabase
    .from('investigador')
    .upsert(registros, {
      onConflict: 'dni',
      ignoreDuplicates: false, // siempre actualiza los campos RENACYT si el DNI ya existe
    })
    .select('dni, nombres, apellidos, codigo_renacyt, categoria_renacyt')

  if (error) {
    console.error('\n❌ Error en upsert:', error.message)
    console.error('   Detalle:', error.details ?? '—')
    process.exit(1)
  }

  // 6. Resumen final
  console.log(`\n✅ Upsert completado: ${resultado?.length ?? 0} registro(s) procesados\n`)
  console.log('─'.repeat(80))
  resultado?.forEach((r, i) => {
    console.log(`  ${String(i + 1).padStart(3)}. [${r.dni}] ${r.nombres} ${r.apellidos} — RENACYT ${r.codigo_renacyt} (Nivel ${r.categoria_renacyt})`)
  })
  console.log('─'.repeat(80))
  console.log(`\n✨ Importación finalizada.\n`)
}

main().catch(console.error)
