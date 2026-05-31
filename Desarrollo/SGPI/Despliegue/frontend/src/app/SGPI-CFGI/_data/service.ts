/**
 * @file _data/service.ts
 * @description Capa de servicio del módulo de Gestión de Grupos de Investigación (SGPI-CFGI).
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  INTEGRACIÓN CON SUPABASE                                               │
 * │                                                                         │
 * │  Para conectar al backend real (Supabase):                              │
 * │  1. Instalar: npm install @supabase/supabase-js                         │
 * │  2. Crear el cliente en lib/supabase.ts                                 │
 * │  3. Descomentar los bloques ── SUPABASE ── y eliminar los bloques MOCK. │
 * │                                                                         │
 * │  Tablas esperadas en Supabase:                                          │
 * │    - grupo_investigacion      → datos del grupo                         │
 * │    - grupo_miembro            → miembros asociados al grupo             │
 * │    - proyecto                 → proyectos de investigación asociados    │
 * │    - docentes                 → padrón de investigadores                │
 * └─────────────────────────────────────────────────────────────────────────┘
 */

import type {
  GrupoInvestigacion,
  FiltrosGrupos,
  GrupoPayload,
  StatsGrupos,
  InvestigatorPadron,
  FuenteOrigen,
} from './types';
import { MOCK_GRUPOS, MOCK_PADRON_INVESTIGADORES, getMockStats } from './mock';

// Cuando se active Supabase, descomentar esta importación:
// import { supabase } from '@/lib/supabase';

const PAGE_SIZE = 10;

export interface PaginatedGrupos {
  items: GrupoInvestigacion[];
  total: number;
  page: number;
  pages: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Listado paginado con filtros
// ─────────────────────────────────────────────────────────────────────────────

export async function getGrupos(
  filtros: FiltrosGrupos,
  page: number = 1,
): Promise<PaginatedGrupos> {
  /* ── SUPABASE ──────────────────────────────────────────────────────────────
  let query = supabase
    .from('grupo_investigacion')
    .select('*, grupo_miembro(*), proyecto(*)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (filtros.buscar.trim()) {
    query = query.or(
      `code.ilike.%${filtros.buscar}%,name.ilike.%${filtros.buscar}%,acronym.ilike.%${filtros.buscar}%`
    );
  }
  if (filtros.estado)       query = query.eq('status', filtros.estado);
  if (filtros.fuente)       query = query.eq('fuente', filtros.fuente);

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  const total = count ?? 0;
  
  // Transformación de snake_case a camelCase si es necesario
  const items = (data || []).map((g: any) => ({
    id: g.code,
    code: g.code,
    name: g.name,
    acronym: g.acronym,
    description: g.description,
    coordinatorDni: g.coordinator_dni,
    coordinatorName: g.coordinator_name,
    researchLines: g.research_lines || [],
    status: g.status,
    recognitionDate: g.recognition_date,
    createdAt: g.created_at,
    updatedAt: g.updated_at,
    fuente: g.fuente,
    miembros: (g.grupo_miembro || []).map((m: any) => ({
      dni: m.docente_dni,
      nombre: m.nombre,
      rol: m.rol,
      fechaIncorporacion: m.fecha_incorporacion,
      estado: m.estado,
    })),
    proyectosVinculados: (g.proyecto || []).map((p: any) => ({
      codigo: p.codigo,
      titulo: p.titulo,
      estado: p.estado,
      convocatoria: p.convocatoria,
    })),
  }));

  return {
    items,
    total,
    page,
    pages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
  ──────────────────────────────────────────────────────────────────────────── */

  // ── MOCK ──────────────────────────────────────────────────────────────────
  await new Promise((r) => setTimeout(r, 350));

  let list = [...MOCK_GRUPOS];

  if (filtros.buscar.trim()) {
    const q = filtros.buscar.toLowerCase();
    list = list.filter(
      (g) =>
        g.code.toLowerCase().includes(q) ||
        g.name.toLowerCase().includes(q) ||
        (g.acronym && g.acronym.toLowerCase().includes(q)),
    );
  }
  if (filtros.estado) {
    list = list.filter((g) => g.status === filtros.estado);
  }
  if (filtros.fuente) {
    list = list.filter((g) => g.fuente === filtros.fuente);
  }

  const total = list.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;

  return {
    items: list.slice(start, start + PAGE_SIZE),
    total,
    page,
    pages,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Obtener grupo por ID
// ─────────────────────────────────────────────────────────────────────────────

export async function getGrupoById(id: string): Promise<GrupoInvestigacion | null> {
  /* ── SUPABASE ──────────────────────────────────────────────────────────────
  const { data: g, error } = await supabase
    .from('grupo_investigacion')
    .select('*, grupo_miembro(*), proyecto(*)')
    .eq('code', id)
    .single();

  if (error || !g) return null;

  return {
    id: g.code,
    code: g.code,
    name: g.name,
    acronym: g.acronym,
    description: g.description,
    coordinatorDni: g.coordinator_dni,
    coordinatorName: g.coordinator_name,
    researchLines: g.research_lines || [],
    status: g.status,
    recognitionDate: g.recognition_date,
    createdAt: g.created_at,
    updatedAt: g.updated_at,
    fuente: g.fuente,
    miembros: (g.grupo_miembro || []).map((m: any) => ({
      dni: m.docente_dni,
      nombre: m.nombre,
      rol: m.rol,
      fechaIncorporacion: m.fecha_incorporacion,
      estado: m.estado,
    })),
    proyectosVinculados: (g.proyecto || []).map((p: any) => ({
      codigo: p.codigo,
      titulo: p.titulo,
      estado: p.estado,
      convocatoria: p.convocatoria,
    })),
  };
  ──────────────────────────────────────────────────────────────────────────── */

  // ── MOCK ──────────────────────────────────────────────────────────────────
  await new Promise((r) => setTimeout(r, 200));
  return MOCK_GRUPOS.find((g) => g.id === id || g.code === id) ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Obtener estadísticas globales del módulo
// ─────────────────────────────────────────────────────────────────────────────

export async function getStats(): Promise<StatsGrupos> {
  /* ── SUPABASE ──────────────────────────────────────────────────────────────
  const { data, error } = await supabase
    .from('grupo_investigacion')
    .select('status');

  if (error) throw new Error(error.message);

  const total = data.length;
  const pending = data.filter((g: any) => g.status === 'pendiente_validacion').length;
  const active = data.filter((g: any) => g.status === 'validado_activo').length;
  const inactive = data.filter((g: any) => g.status === 'validado_inactivo').length;

  return {
    totalGrupos: total,
    pendientesValidar: pending,
    validadosActivos: active,
    validadosInactivos: inactive,
  };
  ──────────────────────────────────────────────────────────────────────────── */

  // ── MOCK ──────────────────────────────────────────────────────────────────
  await new Promise((r) => setTimeout(r, 100));
  return getMockStats();
}

// ─────────────────────────────────────────────────────────────────────────────
// Buscar investigadores en el Padrón de Investigadores (CUO4)
// ─────────────────────────────────────────────────────────────────────────────

export async function buscarInvestigadores(buscar: string): Promise<InvestigatorPadron[]> {
  /* ── SUPABASE ──────────────────────────────────────────────────────────────
  const { data, error } = await supabase
    .from('docentes')
    .select('dni, nombres, apellidos, email, facultad, departamento')
    .or(`dni.eq.${buscar},nombres.ilike.%${buscar}%,apellidos.ilike.%${buscar}%`)
    .limit(10);

  if (error) throw new Error(error.message);

  return (data || []).map((d: any) => ({
    dni: d.dni,
    nombre: `${d.nombres} ${d.apellidos}`,
    email: d.email,
    facultad: d.facultad || '',
    departamento: d.departamento || '',
  }));
  ──────────────────────────────────────────────────────────────────────────── */

  // ── MOCK ──────────────────────────────────────────────────────────────────
  await new Promise((r) => setTimeout(r, 150));
  if (!buscar.trim()) return [];
  const q = buscar.toLowerCase();
  return MOCK_PADRON_INVESTIGADORES.filter(
    (inv) =>
      inv.nombre.toLowerCase().includes(q) ||
      inv.dni.includes(q) ||
      inv.email.toLowerCase().includes(q),
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Guardar y Validar Grupo (Curación de Datos)
// ─────────────────────────────────────────────────────────────────────────────

export async function validarGrupo(
  id: string,
  payload: GrupoPayload,
): Promise<GrupoInvestigacion> {
  // Encontrar el Director en el payload
  const director = payload.miembros.find((m) => m.rol === 'Director' && m.estado === 'activo');
  const coordinatorDni = director?.dni || '';
  const coordinatorName = director?.nombre || '';

  /* ── SUPABASE ──────────────────────────────────────────────────────────────
  // 1. Actualizar el grupo principal
  const { data: g, error: errGrupo } = await supabase
    .from('grupo_investigacion')
    .update({
      name: payload.name,
      acronym: payload.acronym || null,
      research_lines: payload.researchLines,
      status: payload.status,
      recognition_date: payload.recognitionDate || new Date().toISOString().split('T')[0],
      coordinator_dni: coordinatorDni,
      coordinator_name: coordinatorName,
      updated_at: new Date().toISOString(),
    })
    .eq('code', id)
    .select()
    .single();

  if (errGrupo || !g) throw new Error(errGrupo?.message || 'Error al actualizar el grupo.');

  // 2. Sincronizar miembros: eliminar los antiguos e insertar los nuevos
  // (O realizar un upsert / diff)
  const { error: errDelMiembros } = await supabase
    .from('grupo_miembro')
    .delete()
    .eq('grupo_code', id);

  if (errDelMiembros) throw new Error(errDelMiembros.message);

  if (payload.miembros.length > 0) {
    const { error: errInsMiembros } = await supabase
      .from('grupo_miembro')
      .insert(
        payload.miembros.map((m) => ({
          grupo_code: id,
          docente_dni: m.dni,
          nombre: m.nombre,
          rol: m.rol,
          fecha_incorporacion: m.fechaIncorporacion || new Date().toISOString().split('T')[0],
          estado: m.estado,
        }))
      );
    if (errInsMiembros) throw new Error(errInsMiembros.message);
  }

  // Devolver el grupo actualizado completo
  const gActualizado = await getGrupoById(id);
  if (!gActualizado) throw new Error('Error al recuperar el grupo actualizado.');
  return gActualizado;
  ──────────────────────────────────────────────────────────────────────────── */

  // ── MOCK ──────────────────────────────────────────────────────────────────
  await new Promise((r) => setTimeout(r, 600));

  const idx = MOCK_GRUPOS.findIndex((g) => g.id === id || g.code === id);
  if (idx === -1) throw new Error('Grupo no encontrado.');

  const original = MOCK_GRUPOS[idx];

  // Regla EX1: Validar que no se desactive o quite el Director si hay proyectos activos
  // (La UI ya lo valida, pero aquí reforzamos)
  const hasActiveProjects = original.proyectosVinculados.some((p) => p.estado === 'active');
  if (hasActiveProjects) {
    // Si el estado es de desactivación
    if (payload.status === 'validado_inactivo') {
      throw new Error('Regla de Negocio (EX1): No se puede desactivar un grupo con proyectos activos.');
    }
    // Si no hay director
    if (!director) {
      throw new Error('Regla de Negocio (EX1): No se puede remover el Director mientras existan proyectos activos.');
    }
  }

  const updated: GrupoInvestigacion = {
    ...original,
    name: payload.name,
    acronym: payload.acronym,
    researchLines: payload.researchLines,
    status: payload.status,
    recognitionDate: payload.recognitionDate || original.recognitionDate || new Date().toISOString().split('T')[0],
    coordinatorDni,
    coordinatorName,
    miembros: payload.miembros,
    updatedAt: new Date().toISOString(),
  };

  MOCK_GRUPOS[idx] = updated;
  return updated;
}

// ─────────────────────────────────────────────────────────────────────────────
// Validar unicidad del código (EX2)
// ─────────────────────────────────────────────────────────────────────────────

export async function validarCodigoGrupo(codigo: string, excluirId?: string): Promise<boolean> {
  /* ── SUPABASE ──────────────────────────────────────────────────────────────
  let query = supabase
    .from('grupo_investigacion')
    .select('code')
    .eq('code', codigo);

  if (excluirId) {
    query = query.ne('code', excluirId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return data.length === 0;
  ──────────────────────────────────────────────────────────────────────────── */

  // ── MOCK ──────────────────────────────────────────────────────────────────
  await new Promise((r) => setTimeout(r, 100));
  const normalizado = codigo.trim().toUpperCase();
  const existe = MOCK_GRUPOS.some(
    (g) => g.code.toUpperCase() === normalizado && g.id !== excluirId,
  );
  return !existe;
}

// ─────────────────────────────────────────────────────────────────────────────
// Exportar Ficha (Simulación de descarga)
// ─────────────────────────────────────────────────────────────────────────────

export async function exportarFicha(
  id: string,
  formato: 'pdf' | 'excel',
): Promise<Blob> {
  /* ── SUPABASE ──────────────────────────────────────────────────────────────
  // En producción, esto haría una llamada al endpoint del backend que genera el reporte
  // Ej: fetch(`/api/grupos/${id}/exportar?formato=${formato}`)
  ──────────────────────────────────────────────────────────────────────────── */

  await new Promise((r) => setTimeout(r, 1000));
  const dummyContent = `Ficha del Grupo ${id} en formato ${formato.toUpperCase()} - Generado a las ${new Date().toISOString()}`;
  return new Blob([dummyContent], { type: formato === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

// ─────────────────────────────────────────────────────────────────────────────
// Crear Nuevo Grupo (Ingreso Manual)
// ─────────────────────────────────────────────────────────────────────────────

export async function crearGrupo(
  payload: GrupoPayload & { code: string; fuente: FuenteOrigen },
): Promise<GrupoInvestigacion> {
  // Encontrar el Director en el payload
  const director = payload.miembros.find((m) => m.rol === 'Director' && m.estado === 'activo');
  const coordinatorDni = director?.dni || '';
  const coordinatorName = director?.nombre || '';

  /* ── SUPABASE ──────────────────────────────────────────────────────────────
  // En producción real:
  // const { data: g, error: errGrupo } = await supabase
  //   .from('grupo_investigacion')
  //   .insert({
  //     code: payload.code,
  //     name: payload.name,
  //     acronym: payload.acronym || null,
  //     research_lines: payload.researchLines,
  //     status: payload.status,
  //     recognition_date: payload.recognitionDate || new Date().toISOString().split('T')[0],
  //     coordinator_dni: coordinatorDni,
  //     coordinator_name: coordinatorName,
  //     fuente: payload.fuente,
  //     created_at: new Date().toISOString(),
  //     updated_at: new Date().toISOString(),
  //   })
  //   .select()
  //   .single();
  // if (errGrupo || !g) throw new Error(errGrupo?.message || 'Error al crear el grupo.');
  
  // if (payload.miembros.length > 0) {
  //   const { error: errMiembros } = await supabase
  //     .from('grupo_miembro')
  //     .insert(
  //       payload.miembros.map((m) => ({
  //         grupo_code: payload.code,
  //         docente_dni: m.dni,
  //         nombre: m.nombre,
  //         rol: m.rol,
  //         fecha_incorporacion: m.fechaIncorporacion || new Date().toISOString().split('T')[0],
  //         estado: m.estado,
  //       }))
  //     );
  //   if (errMiembros) throw new Error(errMiembros.message);
  // }
  // return getGrupoById(payload.code);
  ──────────────────────────────────────────────────────────────────────────── */

  // ── MOCK ──────────────────────────────────────────────────────────────────
  await new Promise((r) => setTimeout(r, 600));

  const existe = MOCK_GRUPOS.some(
    (g) => g.code.toUpperCase() === payload.code.trim().toUpperCase(),
  );
  if (existe) {
    throw new Error('El código de grupo ya existe.');
  }

  const nuevo: GrupoInvestigacion = {
    id: payload.code,
    code: payload.code,
    name: payload.name,
    acronym: payload.acronym || '',
    coordinatorDni,
    coordinatorName,
    researchLines: payload.researchLines,
    status: payload.status,
    recognitionDate: payload.recognitionDate || new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    fuente: payload.fuente,
    miembros: payload.miembros,
    proyectosVinculados: [],
  };

  MOCK_GRUPOS.push(nuevo);
  return nuevo;
}
