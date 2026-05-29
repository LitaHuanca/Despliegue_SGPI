/**
 * @file _data/service.ts
 * @description Capa de servicio del módulo de Docentes/Investigadores (SGPI-CFMH).
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  INTEGRACIÓN CON SUPABASE                                               │
 * │                                                                         │
 * │  Para conectar al backend real (Supabase):                              │
 * │  1. Instalar: npm install @supabase/supabase-js                         │
 * │     (o @supabase/auth-helpers-nextjs si se usa autenticación de sesión) │
 * │  2. Crear el cliente en lib/supabase.ts (ver abajo).                    │
 * │  3. Descomentar los bloques ── SUPABASE ── y eliminar los bloques MOCK. │
 * │                                                                         │
 * │  Tablas esperadas en Supabase:                                          │
 * │    - docentes           → perfil principal                              │
 * │    - puntaje_historico  → relación 1:N con docentes (fk: docente_id)   │
 * │                                                                         │
 * │  Ejemplo de lib/supabase.ts:                                            │
 * │    import { createClient } from '@supabase/supabase-js';                │
 * │    export const supabase = createClient(                                │
 * │      process.env.NEXT_PUBLIC_SUPABASE_URL!,                             │
 * │      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!                         │
 * │    );                                                                   │
 * └─────────────────────────────────────────────────────────────────────────┘
 */

import type {
  DocenteInvestigador, FiltrosDocentes, DocentePayload, StatsDocentes,
  ProyectoHistorial,
} from './types';
import { MOCK_DOCENTES, MOCK_STATS, getMockHistorial } from './mock';

// Cuando se active Supabase, descomentar esta importación:
// import { supabase } from '@/lib/supabase';

const PAGE_SIZE = 10;

// ─────────────────────────────────────────────────────────────────────────────
// Listado paginado con filtros
// ─────────────────────────────────────────────────────────────────────────────

export interface PaginatedDocentes {
  items:  DocenteInvestigador[];
  total:  number;
  page:   number;
  pages:  number;
}

export async function getDocentes(
  filtros: FiltrosDocentes,
  page: number = 1,
): Promise<PaginatedDocentes> {

  /* ── SUPABASE ──────────────────────────────────────────────────────────────
  let query = supabase
    .from('docentes')
    .select('*, puntaje_historico(*)', { count: 'exact' })
    .order('apellidos', { ascending: true })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (filtros.buscar.trim()) {
    // Búsqueda por DNI exacto o apellidos/nombres con ILIKE
    query = query.or(
      `dni.eq.${filtros.buscar},apellidos.ilike.%${filtros.buscar}%,nombres.ilike.%${filtros.buscar}%`
    );
  }
  if (filtros.departamento) query = query.eq('departamento', filtros.departamento);
  if (filtros.nivelRenacyt) query = query.eq('nivel_renacyt', filtros.nivelRenacyt);
  if (filtros.estado)       query = query.eq('estado', filtros.estado);

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  const total = count ?? 0;
  return {
    items: data as DocenteInvestigador[],
    total,
    page,
    pages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
  ──────────────────────────────────────────────────────────────────────────── */

  // ── MOCK ──────────────────────────────────────────────────────────────────
  await new Promise((r) => setTimeout(r, 350));

  let list = [...MOCK_DOCENTES];

  if (filtros.buscar.trim()) {
    const q = filtros.buscar.toLowerCase();
    list = list.filter(
      (d) =>
        d.nombres.toLowerCase().includes(q) ||
        d.apellidos.toLowerCase().includes(q) ||
        d.dni.includes(q) ||
        d.email.toLowerCase().includes(q),
    );
  }
  if (filtros.departamento) list = list.filter((d) => d.departamento === filtros.departamento);
  if (filtros.nivelRenacyt) list = list.filter((d) => d.nivelRenacyt === filtros.nivelRenacyt);
  if (filtros.estado)       list = list.filter((d) => d.estado === filtros.estado);

  const total = list.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  return { items: list.slice(start, start + PAGE_SIZE), total, page, pages };
}

// ─────────────────────────────────────────────────────────────────────────────
// Obtener perfil completo por ID
// ─────────────────────────────────────────────────────────────────────────────

export async function getDocenteById(id: string): Promise<DocenteInvestigador | null> {

  /* ── SUPABASE ──────────────────────────────────────────────────────────────
  const { data, error } = await supabase
    .from('docentes')
    .select('*, puntaje_historico(*)')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data as DocenteInvestigador;
  ──────────────────────────────────────────────────────────────────────────── */

  await new Promise((r) => setTimeout(r, 200));
  return MOCK_DOCENTES.find((d) => d.id === id) ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Crear docente
// ─────────────────────────────────────────────────────────────────────────────

export async function crearDocente(payload: DocentePayload): Promise<DocenteInvestigador> {

  /* ── SUPABASE ──────────────────────────────────────────────────────────────
  // 1. Insertar el perfil principal
  const { data: docente, error: errDoc } = await supabase
    .from('docentes')
    .insert([{
      nombres:        payload.nombres,
      apellidos:      payload.apellidos,
      dni:            payload.dni,
      email:          payload.email,
      departamento:   payload.departamento,
      nivel_renacyt:  payload.nivelRenacyt,
      condicion_sm:   payload.condicionSM,
      estado:         payload.estado,
      fecha_vigencia: payload.fechaVigencia ?? null,
      codigo_docente: payload.codigoDocente ?? null,
    }])
    .select()
    .single();

  if (errDoc || !docente) throw new Error(errDoc?.message ?? 'Error al crear docente.');

  // 2. Insertar el historial de puntaje
  if (payload.puntajeHistorico.length > 0) {
    const { error: errHist } = await supabase
      .from('puntaje_historico')
      .insert(
        payload.puntajeHistorico.map((p) => ({
          docente_id: docente.id,
          anio:       p.anio,
          puntaje:    p.puntaje,
          articulos:  p.articulos,
          tesis:      p.tesis,
          proyectos:  p.proyectos,
        }))
      );
    if (errHist) throw new Error(errHist.message);
  }

  return docente as DocenteInvestigador;
  ──────────────────────────────────────────────────────────────────────────── */

  await new Promise((r) => setTimeout(r, 600));

  const nuevo: DocenteInvestigador = {
    ...payload,
    id:            `DOC-${Date.now()}`,
    creadoEn:      new Date().toISOString(),
    actualizadoEn: new Date().toISOString(),
  };
  MOCK_DOCENTES.unshift(nuevo);
  return nuevo;
}

// ─────────────────────────────────────────────────────────────────────────────
// Actualizar docente
// ─────────────────────────────────────────────────────────────────────────────

export async function actualizarDocente(
  id: string,
  payload: DocentePayload,
): Promise<DocenteInvestigador> {

  /* ── SUPABASE ──────────────────────────────────────────────────────────────
  // 1. Actualizar el perfil principal
  const { data: docente, error: errDoc } = await supabase
    .from('docentes')
    .update({
      nombres:        payload.nombres,
      apellidos:      payload.apellidos,
      dni:            payload.dni,
      email:          payload.email,
      departamento:   payload.departamento,
      nivel_renacyt:  payload.nivelRenacyt,
      condicion_sm:   payload.condicionSM,
      estado:         payload.estado,
      fecha_vigencia: payload.fechaVigencia ?? null,
      actualizado_en: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (errDoc || !docente) throw new Error(errDoc?.message ?? 'Error al actualizar docente.');

  // 2. Sincronizar historial: upsert por (docente_id, anio)
  if (payload.puntajeHistorico.length > 0) {
    const { error: errHist } = await supabase
      .from('puntaje_historico')
      .upsert(
        payload.puntajeHistorico.map((p) => ({
          docente_id: id,
          anio:       p.anio,
          puntaje:    p.puntaje,
          articulos:  p.articulos,
          tesis:      p.tesis,
          proyectos:  p.proyectos,
        })),
        { onConflict: 'docente_id,anio' }
      );
    if (errHist) throw new Error(errHist.message);
  }

  return docente as DocenteInvestigador;
  ──────────────────────────────────────────────────────────────────────────── */

  await new Promise((r) => setTimeout(r, 600));

  const idx = MOCK_DOCENTES.findIndex((d) => d.id === id);
  if (idx === -1) throw new Error('Docente no encontrado.');

  const updated: DocenteInvestigador = {
    ...MOCK_DOCENTES[idx],
    ...payload,
    id,
    actualizadoEn: new Date().toISOString(),
  };
  MOCK_DOCENTES[idx] = updated;
  return updated;
}

// ─────────────────────────────────────────────────────────────────────────────
// Validar unicidad de DNI — EX1
// ─────────────────────────────────────────────────────────────────────────────

export async function validarDNI(
  dni: string,
  excluirId?: string,
): Promise<{ duplicado: boolean; existenteId?: string }> {

  /* ── SUPABASE ──────────────────────────────────────────────────────────────
  let query = supabase
    .from('docentes')
    .select('id')
    .eq('dni', dni);

  // Excluir el propio registro cuando se edita (evita falso positivo)
  if (excluirId) query = query.neq('id', excluirId);

  const { data, error } = await query.maybeSingle();
  if (error) throw new Error(error.message);

  return { duplicado: !!data, existenteId: data?.id };
  ──────────────────────────────────────────────────────────────────────────── */

  await new Promise((r) => setTimeout(r, 150));
  const existente = MOCK_DOCENTES.find(
    (d) => d.dni === dni && d.id !== excluirId,
  );
  return { duplicado: !!existente, existenteId: existente?.id };
}

// ─────────────────────────────────────────────────────────────────────────────
// KPIs del tablero
// ─────────────────────────────────────────────────────────────────────────────

export async function getStats(): Promise<StatsDocentes> {

  /* ── SUPABASE ──────────────────────────────────────────────────────────────
  // Consultas paralelas para construir los KPIs
  const [
    { count: totalDocentes },
    { count: investigadoresRenacyt },
    { count: vigenciasPorVencer },
    { count: proyectosActivos },
  ] = await Promise.all([
    supabase.from('docentes').select('*', { count: 'exact', head: true }),
    supabase.from('docentes').select('*', { count: 'exact', head: true })
      .neq('nivel_renacyt', 'Sin nivel'),
    supabase.from('docentes').select('*', { count: 'exact', head: true })
      .eq('estado', 'por_vencer'),
    supabase.from('proyectos').select('*', { count: 'exact', head: true })
      .eq('estado', 'activo'),
  ]);

  return {
    totalDocentes:         totalDocentes         ?? 0,
    deltaEsteMes:          0,  // calcular con created_at >= inicio_mes
    investigadoresRenacyt: investigadoresRenacyt ?? 0,
    porcentajeRenacyt:     totalDocentes
      ? Math.round(((investigadoresRenacyt ?? 0) / totalDocentes) * 100)
      : 0,
    vigenciasPorVencer:    vigenciasPorVencer    ?? 0,
    proyectosActivos:      proyectosActivos      ?? 0,
    cicloAcademico:        '2024-I',  // traer de tabla configuracion
  };
  ──────────────────────────────────────────────────────────────────────────── */

  await new Promise((r) => setTimeout(r, 200));
  return MOCK_STATS;
}

// ─────────────────────────────────────────────────────────────────────────────
// Historial de Proyectos del investigador (Línea de Tiempo)
// ─────────────────────────────────────────────────────────────────────────────


/**
 * Obtiene la lista de proyectos asociados a un docente/investigador.
 *
 * Supabase: tabla `proyecto_investigador`
 *   - docente_id   UUID / string  → FK hacia `docentes`
 *   - codigo       text           → Código del proyecto (ej: "PRJ-2023-684")
 *   - titulo       text
 *   - rol          text           → RolProyecto
 *   - anio_inicio  integer
 *   - anio_fin     integer | null → null = "Presente"
 *   - presupuesto  numeric
 *   - entidad_financiadora text
 *   - estado       text           → EstadoProyecto
 *
 * TODO (real API):
 *   GET /api/v1/docentes/{id}/historial
 *   → array de ProyectoHistorial ordenado por anio_inicio DESC
 */
export async function getHistorialProyectos(
  docenteId: string,
): Promise<ProyectoHistorial[]> {

  /* ── SUPABASE ──────────────────────────────────────────────────────────────
  const { data, error } = await supabase
    .from('proyecto_investigador')
    .select(`
      id,
      codigo,
      titulo,
      rol,
      anio_inicio,
      anio_fin,
      presupuesto,
      entidad_financiadora,
      estado
    `)
    .eq('docente_id', docenteId)
    .order('anio_inicio', { ascending: false });

  if (error) throw new Error(error.message);

  // Mapear snake_case de la BD → camelCase del tipo ProyectoHistorial
  return (data ?? []).map((row) => ({
    id:                  String(row.id),
    codigo:              row.codigo,
    titulo:              row.titulo,
    rol:                 row.rol,
    anioInicio:          row.anio_inicio,
    anioFin:             row.anio_fin ?? undefined,
    presupuesto:         Number(row.presupuesto),
    entidadFinanciadora: row.entidad_financiadora,
    estado:              row.estado,
  }));
  ──────────────────────────────────────────────────────────────────────────── */

  // ── MOCK ──────────────────────────────────────────────────────────────────
  await new Promise((r) => setTimeout(r, 300));
  return getMockHistorial(docenteId);
}

// ─────────────────────────────────────────────────────────────────────────────
// Generar Certificado PDF
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Solicita la generación del certificado PDF de participación en proyectos
 * para el docente/investigador indicado y dispara la descarga en el navegador.
 *
 * Supabase / API:
 *   POST /api/v1/docentes/{id}/certificado
 *   Body: { incluirMontos: boolean }
 *   Response: application/pdf (blob)
 *
 * El servidor genera el PDF con:
 *   - Datos del investigador (nombre, DNI, categoría, departamento)
 *   - Listado cronológico de proyectos con rol, período, estado
 *   - Si incluirMontos = true → columna de presupuesto asignado
 *   - Sello y firma digital del Vicerrector de Investigación
 *   - Código QR de validación
 */
export async function generarCertificadoPDF(
  docenteId: string,
  incluirMontos: boolean,
): Promise<void> {

  /* ── REAL API ────────────────────────────────────────────────────────────────
  const res = await fetch(`/api/v1/docentes/${docenteId}/certificado`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ incluirMontos }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? 'Error al generar el certificado PDF.');
  }

  const blob     = await res.blob();
  const url      = URL.createObjectURL(blob);
  const anchor   = document.createElement('a');
  anchor.href     = url;
  anchor.download  = `certificado_participacion_${docenteId}.pdf`;
  anchor.click();
  URL.revokeObjectURL(url);
  ─────────────────────────────────────────────────────────────────────────── */

  // ── MOCK ──────────────────────────────────────────────────────────────────
  // Simula el tiempo de generación del PDF en el servidor (~1.4 s)
  await new Promise((r) => setTimeout(r, 1400));
  console.info(
    `[MOCK] Certificado PDF generado para docenteId="${docenteId}", incluirMontos=${incluirMontos}`,
  );
}
