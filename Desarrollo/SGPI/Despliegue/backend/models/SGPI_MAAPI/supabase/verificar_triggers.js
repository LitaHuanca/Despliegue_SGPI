// supabase/verificar_triggers.js
// Verifica que los triggers estén funcionando en la BD
// Ejecutar: node supabase/verificar_triggers.js

import { supabaseAdmin } from './admin.js'

async function verificar() {
  console.log('╔══════════════════════════════════════════════════════╗')
  console.log('║   SGPI — Verificación de Triggers                    ║')
  console.log('╚══════════════════════════════════════════════════════╝\n')

  // ── 1. Trigger on_auth_user_created ──────────────────────────
  console.log('🔍 [Trigger 1] on_auth_user_created (Auth → public.usuario)')
  const { data: usuarios, error: errU } = await supabaseAdmin
    .from('usuario')
    .select('id_usuario, correo_institucional, rol_sistema, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  if (errU) {
    console.error('   ❌ Error:', errU.message)
  } else if (!usuarios?.length) {
    console.log('   ⚠️  Tabla usuario vacía — el trigger aún no se ha activado')
    console.log('       (Confirma el email del usuario registrado en Supabase Auth)')
  } else {
    console.log(`   ✅ ${usuarios.length} usuario(s) encontrado(s) en public.usuario:`)
    usuarios.forEach(u => {
      console.log(`      · [${u.rol_sistema}] ${u.correo_institucional}  (ID: ${u.id_usuario.slice(0, 8)}...)`)
    })
  }

  // ── 2. Columnas updated_at (triggers de auditoría) ────────────
  console.log('\n🔍 [Trigger 2-5] Columnas updated_at en tablas principales')
  const tablas = ['investigador', 'proyecto', 'historial_puntaje', 'entregable']
  for (const tabla of tablas) {
    const { data, error } = await supabaseAdmin
      .from(tabla)
      .select('updated_at')
      .limit(1)
    if (error) {
      console.log(`   ❌ ${tabla.padEnd(20)} → columna updated_at NO encontrada`)
    } else {
      console.log(`   ✅ ${tabla.padEnd(20)} → columna updated_at OK`)
    }
  }

  // ── 3. Resumen del estado de la BD ────────────────────────────
  console.log('\n🔍 Conteo de registros por tabla:')
  const todasTablas = [
    'investigador', 'proyecto', 'usuario',
    'historial_puntaje', 'investigador_proyecto',
    'estudiante_proyecto', 'entregable', 'tesis'
  ]
  for (const tabla of todasTablas) {
    const { count, error } = await supabaseAdmin
      .from(tabla)
      .select('*', { count: 'exact', head: true })
    if (error) {
      console.log(`   ❌ ${tabla.padEnd(25)} → ${error.message}`)
    } else {
      console.log(`   ✅ ${tabla.padEnd(25)} → ${count} registro(s)`)
    }
  }

  console.log('\n✨ Verificación completa.\n')
}

verificar().catch(console.error)
