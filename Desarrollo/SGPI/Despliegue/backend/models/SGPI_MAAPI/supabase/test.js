// supabase/test.js
// Script de verificación de conexión y tablas del SGPI
// Ejecutar con: node supabase/test.js

import { supabase } from './client.js'

const TABLAS = [
  'investigador',
  'proyecto',
  'historial_puntaje',
  'investigador_proyecto',
  'estudiante_proyecto',
  'entregable',
  'tesis',
  'usuario',
]

async function testTabla(tabla) {
  const { count, error } = await supabase
    .from(tabla)
    .select('*', { count: 'exact', head: true })

  if (error) {
    console.log(`  ❌ ${tabla.padEnd(25)} → ${error.message}`)
  } else {
    console.log(`  ✅ ${tabla.padEnd(25)} → ${count ?? 0} registro(s)`)
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════╗')
  console.log('║   SGPI — Sistema de Gestión de Proyectos (VRIP)    ║')
  console.log('║   Verificación de Conexión y Tablas - Supabase     ║')
  console.log('╚════════════════════════════════════════════════════╝')
  console.log()

  console.log('📡 Verificando conexión...')
  const { error: pingError } = await supabase.rpc('version').maybeSingle()
  if (pingError && pingError.code !== 'PGRST202') {
    console.error('❌ Sin conexión a Supabase:', pingError.message)
    process.exit(1)
  }
  console.log('✅ Conectado a Supabase correctamente\n')

  console.log('🗃️  Verificando tablas del esquema SGPI:')
  for (const tabla of TABLAS) {
    await testTabla(tabla)
  }

  console.log()
  console.log('📦 Módulos disponibles:')
  console.log('  · supabase/investigador.js  → CRUD + búsquedas + JOINs')
  console.log('  · supabase/proyecto.js      → CRUD + vista completa + N:M')
  console.log('  · supabase/historial.js     → CRUD + ranking por año')
  console.log('  · supabase/tesis.js         → CRUD + búsqueda por asesor/título')
  console.log('  · supabase/entregable.js    → CRUD + alertas de fechas')
  console.log('  · supabase/usuario.js       → CRUD + Auth (login/logout)')
  console.log('  · supabase/db.js            → Helpers genéricos')
  console.log('  · supabase/index.js         → Exportación central (barrel)')
  console.log()
  console.log('✨ SGPI listo para desarrollo.\n')
}

main().catch(console.error)
