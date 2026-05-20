// supabase/ejecutar_migracion.js
// ============================================================
// Ejecutor de migraciones SQL contra la base de datos Supabase
// Conecta directamente via PostgreSQL (pg) para poder ejecutar
// DDL, funciones y triggers que no pueden correr por el REST API.
//
// USO:
//   node supabase/ejecutar_migracion.js                            → ejecuta 001_triggers.sql
//   node supabase/ejecutar_migracion.js ruta/al/archivo.sql        → ejecuta el SQL indicado
// ============================================================

import pg from 'pg'
import { readFileSync } from 'fs'
import { resolve, basename } from 'path'
import 'dotenv/config'

const { Client } = pg

// ── Validar variables de entorno ─────────────────────────────
const DB_URL = process.env.DATABASE_URL

if (!DB_URL) {
  console.error('\n❌ Falta la variable de entorno DATABASE_URL en el archivo .env')
  console.error('   Formato: postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres')
  console.error('   Encuéntrala en: Supabase → Settings → Database → Connection string → URI\n')
  process.exit(1)
}

// ── Leer archivo SQL ──────────────────────────────────────────
const args = process.argv.slice(2)
const rutaSQL = args[0] ?? 'supabase/migrations/001_triggers.sql'

let sqlContent
try {
  sqlContent = readFileSync(resolve(rutaSQL), 'utf-8')
} catch (err) {
  console.error(`\n❌ No se pudo leer el archivo SQL: "${rutaSQL}"`)
  console.error(`   Error: ${err.message}\n`)
  process.exit(1)
}

// ── Ejecutar migración ────────────────────────────────────────
async function ejecutarMigracion() {
  const nombreArchivo = basename(rutaSQL)

  console.log('╔══════════════════════════════════════════════════════╗')
  console.log('║   SGPI — Ejecutor de Migraciones SQL                 ║')
  console.log('╚══════════════════════════════════════════════════════╝')
  console.log(`\n📄 Archivo : ${nombreArchivo}`)
  console.log(`📏 Tamaño  : ${sqlContent.length} caracteres`)

  const client = new Client({ connectionString: DB_URL })

  try {
    console.log('\n🔌 Conectando a PostgreSQL (Supabase)...')
    await client.connect()
    console.log('✅ Conexión establecida\n')

    console.log('🔄 Ejecutando script SQL...')
    console.log('─'.repeat(60))

    await client.query(sqlContent)

    console.log('─'.repeat(60))
    console.log('\n✅ Migración ejecutada exitosamente')
    console.log(`\n📋 Triggers creados/actualizados:`)
    console.log('   · trg_investigador_updated_at    → tabla investigador')
    console.log('   · trg_proyecto_updated_at        → tabla proyecto')
    console.log('   · trg_historial_puntaje_updated_at → tabla historial_puntaje')
    console.log('   · trg_entregable_updated_at      → tabla entregable')
    console.log('   · on_auth_user_created           → auth.users (sync → public.usuario)')
    console.log('   · trg_calcular_deuda_pi          → tabla entregable (deuda PI)')
    console.log('   · trg_cierre_automatico_proyecto → tabla entregable (cierre proyecto)')

  } catch (err) {
    console.error('\n❌ Error al ejecutar la migración:')
    console.error(`   ${err.message}`)
    if (err.position) {
      // Mostrar contexto de dónde falló el SQL
      const linea = sqlContent.substring(0, parseInt(err.position)).split('\n').length
      console.error(`   Línea aproximada: ${linea}`)
    }
    process.exit(1)
  } finally {
    await client.end()
    console.log('\n🔌 Conexión cerrada.')
  }
}

ejecutarMigracion().catch(console.error)
