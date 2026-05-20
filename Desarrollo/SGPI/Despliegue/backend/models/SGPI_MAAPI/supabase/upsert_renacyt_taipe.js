// supabase/upsert_renacyt_taipe.js — temporal, puede eliminarse luego
import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

// Cliente con service_role → bypasa RLS para operaciones administrativas
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { auth: { persistSession: false } }
)


function toTitleCase(str) {
  return str.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

const raw = {
  numero_documento:             '19809928',
  nombres:                      'NESTOR GODOFREDO',
  apellido_paterno:             'TAIPE',
  apellido_materno:             'CAMPOS',
  codigo_registro:              'P0156870',
  orcid:                        '0000-0002-8194-7946',
  cti_vitae:                    '156870',
  nivel:                        'V',
  condicion:                    'Activo',
  institucion_laboral_principal:'UNIVERSIDAD NACIONAL DE SAN CRISTOBAL DE HUAMANGA',
}

const registro = {
  dni:                  raw.numero_documento,
  nombres:              toTitleCase(raw.nombres),
  apellidos:            toTitleCase(`${raw.apellido_paterno} ${raw.apellido_materno}`),
  codigo_renacyt:       raw.codigo_registro,
  orcid:                raw.orcid,
  categoria_renacyt:    raw.nivel,
  estado_renacyt:       raw.condicion,
  institucion_principal:raw.institucion_laboral_principal,
  url_cti_vitae:        `https://ctivitae.concytec.gob.pe/appDirectorioCTI/VerDatosInvestigador.do?id_investigador=${raw.cti_vitae}`,
}

console.log('\n📋 Registro mapeado:')
console.table(registro)

const { data, error } = await supabase
  .from('investigador')
  .upsert(registro, { onConflict: 'dni', ignoreDuplicates: false })
  .select()

if (error) {
  console.error('\n❌ Error en upsert:', error.message, error.details ?? '')
  process.exit(1)
}

console.log('\n✅ UPSERT exitoso')
console.log('   DNI:         ', registro.dni)
console.log('   Nombre:      ', `${registro.nombres} ${registro.apellidos}`)
console.log('   RENACYT:     ', registro.codigo_renacyt, `(Nivel ${registro.categoria_renacyt})`)
console.log('   Institución: ', registro.institucion_principal)
console.log('   CTI Vitae:   ', registro.url_cti_vitae)
console.log('   Registro BD: ', JSON.stringify(data?.[0], null, 2))
