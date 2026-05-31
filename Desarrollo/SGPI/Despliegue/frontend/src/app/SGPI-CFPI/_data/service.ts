/**
 * @file _data/service.ts
 * @description Capa de servicio del módulo de Gestión de Proyectos de Investigación (SGPI-CFPI).
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
 * │    - proyecto                 → datos del proyecto de investigación     │
 * │    - proyecto_miembro         → co-investigadores y roles asignados     │
 * │    - proyecto_hito            → hitos planificados y su porcentaje      │
 * │    - proyecto_historial       → bitácora e historial de auditorías      │
 * │    - docentes                 → padrón de investigadores                │
 * └─────────────────────────────────────────────────────────────────────────┘
 */

import type {
  Proyecto,
  FiltrosProyectos,
  ProyectoPayload,
  StatsProyectos,
  MiembroProyecto,
  HitoProyecto,
  HistorialProyecto,
} from './types';
import type { InvestigatorPadron } from '../../SGPI-CFGI/_data/types';
import {
  MOCK_PROYECTOS,
  MOCK_PADRON_INVESTIGADORES,
  getMockStats,
} from './mock';

// Cuando se active Supabase, descomentar esta importación:
// import { supabase } from '@/lib/supabase';

const PAGE_SIZE = 10;

export interface PaginatedProyectos {
  items: Proyecto[];
  total: number;
  page: number;
  pages: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Listado paginado con filtros
// ─────────────────────────────────────────────────────────────────────────────
export async function getProyectos(
  filtros: FiltrosProyectos,
  page: number = 1,
): Promise<PaginatedProyectos> {
  /* ── SUPABASE ──────────────────────────────────────────────────────────────
  let query = supabase
    .from('proyecto')
    .select('*, proyecto_miembro(*), proyecto_hito(*)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (filtros.buscar.trim()) {
    query = query.or(
      `code.ilike.%${filtros.buscar}%,title.ilike.%${filtros.buscar}%,responsable_principal.ilike.%${filtros.buscar}%`
    );
  }
  if (filtros.estado)            query = query.eq('status', filtros.estado);
  if (filtros.convocatoria)      query = query.eq('convocatoria', filtros.convocatoria);
  if (filtros.inicioPlanificado) query = query.eq('inicio_planificado', filtros.inicioPlanificado);

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  const total = count ?? 0;
  
  const items = (data || []).map((p: any) => ({
    id: p.code,
    code: p.code,
    title: p.title,
    tipo: p.tipo,
    programa: p.programa,
    convocatoria: p.convocatoria,
    resolucion: p.resolucion,
    montoFinanciado: p.monto_financiado,
    inicioPlanificado: p.inicio_planificado,
    finPlanificado: p.fin_planificado,
    status: p.status,
    grupoVinculado: p.grupo_vinculado,
    responsablePrincipal: p.responsable_principal,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
    fuente: p.fuente,
    miembros: (p.proyecto_miembro || []).map((m: any) => ({
      dni: m.docente_dni,
      nombre: m.nombre,
      rol: m.rol,
      estado: m.estado,
    })),
    hitos: (p.proyecto_hito || []).map((h: any) => ({
      id: h.id,
      nombre: h.nombre,
      fechaVencimiento: h.fecha_vencimiento,
      estado: h.estado,
      porcentaje: h.porcentaje,
    })),
    historial: [], // Cargar a demanda en el detalle
  }));

  return {
    items,
    total,
    page,
    pages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
  ──────────────────────────────────────────────────────────────────────────── */

  // ── MOCK ──────────────────────────────────────────────────────────────────
  await new Promise((r) => setTimeout(r, 300));

  let list = [...MOCK_PROYECTOS];

  if (filtros.buscar.trim()) {
    const q = filtros.buscar.toLowerCase();
    list = list.filter(
      (p) =>
        p.code.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        p.responsablePrincipal.toLowerCase().includes(q)
    );
  }

  if (filtros.estado) {
    list = list.filter((p) => p.status === filtros.estado);
  }

  if (filtros.convocatoria) {
    list = list.filter((p) => p.convocatoria === filtros.convocatoria);
  }

  if (filtros.inicioPlanificado) {
    list = list.filter((p) => p.inicioPlanificado === filtros.inicioPlanificado);
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
// Obtener proyecto por ID o código
// ─────────────────────────────────────────────────────────────────────────────
export async function getProyectoById(id: string): Promise<Proyecto | null> {
  /* ── SUPABASE ──────────────────────────────────────────────────────────────
  const { data: p, error } = await supabase
    .from('proyecto')
    .select('*, proyecto_miembro(*), proyecto_hito(*), proyecto_historial(*)')
    .eq('code', id)
    .single();

  if (error || !p) return null;

  return {
    id: p.code,
    code: p.code,
    title: p.title,
    tipo: p.tipo,
    programa: p.programa,
    convocatoria: p.convocatoria,
    resolucion: p.resolucion,
    montoFinanciado: p.monto_financiado,
    inicioPlanificado: p.inicio_planificado,
    finPlanificado: p.fin_planificado,
    status: p.status,
    grupoVinculado: p.grupo_vinculado,
    responsablePrincipal: p.responsable_principal,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
    fuente: p.fuente,
    miembros: (p.proyecto_miembro || []).map((m: any) => ({
      dni: m.docente_dni,
      nombre: m.nombre,
      rol: m.rol,
      estado: m.estado,
    })),
    hitos: (p.proyecto_hito || []).map((h: any) => ({
      id: h.id,
      nombre: h.nombre,
      fechaVencimiento: h.fecha_vencimiento,
      estado: h.estado,
      porcentaje: h.porcentaje,
    })).sort((a: any, b: any) => a.id.localeCompare(b.id)),
    historial: (p.proyecto_historial || []).map((h: any) => ({
      id: h.id,
      fecha: h.fecha,
      usuario: h.usuario,
      cambio: h.cambio,
      observacion: h.observacion,
    })).sort((a: any, b: any) => b.fecha.localeCompare(a.fecha)),
  };
  ──────────────────────────────────────────────────────────────────────────── */

  // ── MOCK ──────────────────────────────────────────────────────────────────
  await new Promise((r) => setTimeout(r, 150));
  return MOCK_PROYECTOS.find((p) => p.id === id || p.code === id) ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Obtener estadísticas del módulo
// ─────────────────────────────────────────────────────────────────────────────
export async function getStats(): Promise<StatsProyectos> {
  /* ── SUPABASE ──────────────────────────────────────────────────────────────
  const { data, error } = await supabase
    .from('proyecto')
    .select('status');

  if (error) throw new Error(error.message);

  const total = data.length;
  const pending = data.filter((p: any) => p.status === 'pendiente_validar').length;
  const execution = data.filter((p: any) => p.status === 'en_ejecucion').length;
  const completed = data.filter((p: any) => p.status === 'concluido').length;

  return {
    totalProyectos: total,
    pendientesValidar: pending,
    enEjecucion: execution,
    concluidos: completed,
  };
  ──────────────────────────────────────────────────────────────────────────── */

  // ── MOCK ──────────────────────────────────────────────────────────────────
  await new Promise((r) => setTimeout(r, 100));
  return getMockStats();
}

// ─────────────────────────────────────────────────────────────────────────────
// Buscar investigadores en el padrón
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
      inv.email.toLowerCase().includes(q)
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Guardar y Auditar Proyecto (Curación de Datos)
// ─────────────────────────────────────────────────────────────────────────────
export async function validarProyecto(
  id: string,
  payload: ProyectoPayload
): Promise<Proyecto> {
  /* ── SUPABASE ──────────────────────────────────────────────────────────────
  // 1. Actualizar el proyecto principal
  const { error: errProy } = await supabase
    .from('proyecto')
    .update({
      title: payload.title,
      tipo: payload.tipo,
      programa: payload.programa,
      convocatoria: payload.convocatoria,
      resolucion: payload.resolucion,
      monto_financiado: payload.montoFinanciado,
      inicio_planificado: payload.inicioPlanificado,
      fin_planificado: payload.finPlanificado,
      status: payload.status,
      grupo_vinculado: payload.grupoVinculado,
      responsable_principal: payload.responsablePrincipal,
      updated_at: new Date().toISOString(),
    })
    .eq('code', id);

  if (errProy) throw new Error(errProy.message);

  // 2. Insertar historial de auditoría si corresponde
  if (payload.cambioEstadoObs) {
    await supabase.from('proyecto_historial').insert({
      proyecto_code: id,
      usuario: 'Ana Mendoza (Admin)',
      cambio: `Auditoría / Validación`,
      observacion: payload.cambioEstadoObs,
      fecha: new Date().toISOString(),
    });
  }

  // 3. Sincronizar miembros (Delete & Insert)
  await supabase.from('proyecto_miembro').delete().eq('proyecto_code', id);
  if (payload.miembros.length > 0) {
    const { error: errMbr } = await supabase.from('proyecto_miembro').insert(
      payload.miembros.map((m) => ({
        proyecto_code: id,
        docente_dni: m.dni,
        nombre: m.nombre,
        rol: m.rol,
        estado: m.estado || 'activo',
      }))
    );
    if (errMbr) throw new Error(errMbr.message);
  }

  // Devolver el objeto actualizado completo
  const proyAct = await getProyectoById(id);
  if (!proyAct) throw new Error('No se pudo recuperar el proyecto actualizado.');
  return proyAct;
  ──────────────────────────────────────────────────────────────────────────── */

  // ── MOCK ──────────────────────────────────────────────────────────────────
  await new Promise((r) => setTimeout(r, 500));

  const idx = MOCK_PROYECTOS.findIndex((p) => p.id === id || p.code === id);
  if (idx === -1) throw new Error('Proyecto no encontrado.');

  const original = MOCK_PROYECTOS[idx];

  // Si cambia de estado o se audita, creamos una entrada en el historial
  const nuevoHistorial = [...original.historial];
  if (payload.status !== original.status || payload.cambioEstadoObs) {
    nuevoHistorial.unshift({
      id: `hist-${Date.now()}`,
      fecha: new Date().toISOString(),
      usuario: 'Ana Mendoza (Admin)',
      cambio: `${original.status === 'pendiente_validar' ? 'Pendiente Validar' : original.status === 'en_ejecucion' ? 'En Ejecución' : 'Concluido'} → ${payload.status === 'pendiente_validar' ? 'Pendiente Validar' : payload.status === 'en_ejecucion' ? 'En Ejecución' : 'Concluido'}`,
      observacion: payload.cambioEstadoObs || 'Validación y actualización de datos técnicos/financieros y equipo.'
    });
  }

  // Modificar hitos en base al estado del proyecto
  const nuevosHitos = [...original.hitos];
  if (payload.status === 'en_ejecucion') {
    if (nuevosHitos[0]) nuevosHitos[0].estado = 'pendiente';
  } else if (payload.status === 'concluido') {
    nuevosHitos.forEach(h => h.estado = 'completado');
  }

  const updated: Proyecto = {
    ...original,
    title: payload.title,
    tipo: payload.tipo,
    programa: payload.programa,
    convocatoria: payload.convocatoria,
    resolucion: payload.resolucion,
    montoFinanciado: payload.montoFinanciado,
    inicioPlanificado: payload.inicioPlanificado,
    finPlanificado: payload.finPlanificado,
    status: payload.status,
    grupoVinculado: payload.grupoVinculado,
    responsablePrincipal: payload.responsablePrincipal,
    miembros: payload.miembros,
    hitos: nuevosHitos,
    historial: nuevoHistorial,
    updatedAt: new Date().toISOString()
  };

  MOCK_PROYECTOS[idx] = updated;
  return updated;
}

// ─────────────────────────────────────────────────────────────────────────────
// Crear Nuevo Proyecto
// ─────────────────────────────────────────────────────────────────────────────
export async function crearProyecto(
  payload: ProyectoPayload & { code: string; fuente: string }
): Promise<Proyecto> {
  /* ── SUPABASE ──────────────────────────────────────────────────────────────
  const { error: errProy } = await supabase.from('proyecto').insert({
    code: payload.code,
    title: payload.title,
    tipo: payload.tipo,
    programa: payload.programa,
    convocatoria: payload.convocatoria,
    resolucion: payload.resolucion,
    monto_financiado: payload.montoFinanciado,
    inicio_planificado: payload.inicioPlanificado,
    fin_planificado: payload.finPlanificado,
    status: payload.status,
    grupo_vinculado: payload.grupoVinculado,
    responsable_principal: payload.responsablePrincipal,
    fuente: payload.fuente,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (errProy) throw new Error(errProy.message);

  // Insertar miembros iniciales
  if (payload.miembros.length > 0) {
    await supabase.from('proyecto_miembro').insert(
      payload.miembros.map((m) => ({
        proyecto_code: payload.code,
        docente_dni: m.dni,
        nombre: m.nombre,
        rol: m.rol,
        estado: 'activo',
      }))
    );
  }

  // Insertar hitos iniciales por defecto
  const h1Vence = new Date(new Date(payload.inicioPlanificado).setMonth(new Date(payload.inicioPlanificado).getMonth() + 12)).toISOString().split('T')[0];
  const h2Vence = new Date(new Date(payload.inicioPlanificado).setMonth(new Date(payload.inicioPlanificado).getMonth() + 36)).toISOString().split('T')[0];
  
  await supabase.from('proyecto_hito').insert([
    { proyecto_code: payload.code, nombre: 'Informe Académico (12 Meses)', fecha_vencimiento: h1Vence, estado: 'pendiente', porcentaje: 0 },
    { proyecto_code: payload.code, nombre: 'Productos Entregables (36 Meses)', fecha_vencimiento: h2Vence, estado: 'bloqueado', porcentaje: 0 }
  ]);

  // Insertar primer historial
  await supabase.from('proyecto_historial').insert({
    proyecto_code: payload.code,
    usuario: 'Ana Mendoza (Admin)',
    cambio: 'Creación Manual',
    observacion: 'Proyecto creado manualmente en el sistema.',
    fecha: new Date().toISOString(),
  });

  const proyNvo = await getProyectoById(payload.code);
  if (!proyNvo) throw new Error('No se pudo recuperar el proyecto creado.');
  return proyNvo;
  ──────────────────────────────────────────────────────────────────────────── */

  // ── MOCK ──────────────────────────────────────────────────────────────────
  await new Promise((r) => setTimeout(r, 500));

  const existe = MOCK_PROYECTOS.some((p) => p.code === payload.code);
  if (existe) throw new Error('El código del proyecto ya existe.');

  const nuevo: Proyecto = {
    id: payload.code,
    code: payload.code,
    title: payload.title,
    tipo: payload.tipo,
    programa: payload.programa,
    convocatoria: payload.convocatoria,
    resolucion: payload.resolucion,
    montoFinanciado: payload.montoFinanciado,
    inicioPlanificado: payload.inicioPlanificado,
    finPlanificado: payload.finPlanificado,
    status: payload.status,
    grupoVinculado: payload.grupoVinculado,
    responsablePrincipal: payload.responsablePrincipal,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    fuente: payload.fuente,
    miembros: payload.miembros,
    hitos: [
      {
        id: `hito-${Date.now()}-1`,
        nombre: 'Informe Académico (12 Meses)',
        fechaVencimiento: new Date(new Date(payload.inicioPlanificado).setMonth(new Date(payload.inicioPlanificado).getMonth() + 12)).toISOString().split('T')[0],
        estado: payload.status === 'en_ejecucion' ? 'pendiente' : 'bloqueado',
        porcentaje: 0
      },
      {
        id: `hito-${Date.now()}-2`,
        nombre: 'Productos Entregables (36 Meses)',
        fechaVencimiento: new Date(new Date(payload.inicioPlanificado).setMonth(new Date(payload.inicioPlanificado).getMonth() + 36)).toISOString().split('T')[0],
        estado: 'bloqueado',
        porcentaje: 0
      }
    ],
    historial: [
      {
        id: `hist-${Date.now()}`,
        fecha: new Date().toISOString(),
        usuario: 'Ana Mendoza (Admin)',
        cambio: 'Creación Manual',
        observacion: 'Proyecto creado manualmente en el sistema.'
      }
    ]
  };

  MOCK_PROYECTOS.push(nuevo);
  return nuevo;
}

// ─────────────────────────────────────────────────────────────────────────────
// Registrar hito completado
// ─────────────────────────────────────────────────────────────────────────────
export async function completarHito(
  proyectoId: string,
  hitoId: string
): Promise<Proyecto> {
  /* ── SUPABASE ──────────────────────────────────────────────────────────────
  // 1. Actualizar estado del hito en base de datos
  const { error: errHito } = await supabase
    .from('proyecto_hito')
    .update({ estado: 'completado', porcentaje: 100 })
    .eq('id', hitoId);

  if (errHito) throw new Error(errHito.message);

  // 2. Si se completó el hito de 12 meses, desbloquear el hito de 36 meses
  if (hitoId === 'hito-1' || hitoId.endsWith('-1')) {
    // Buscar el hito de 36 meses (usualmente tiene id hito-2)
    await supabase
      .from('proyecto_hito')
      .update({ estado: 'pendiente' })
      .eq('proyecto_code', proyectoId)
      .eq('estado', 'bloqueado');
  }

  // 3. Registrar en el historial de auditorías
  await supabase.from('proyecto_historial').insert({
    proyecto_code: proyectoId,
    usuario: 'Ana Mendoza (Admin)',
    cambio: 'Seguimiento de Hitos',
    observacion: 'Recepción registrada para el hito.',
    fecha: new Date().toISOString(),
  });

  const proyAct = await getProyectoById(proyectoId);
  if (!proyAct) throw new Error('No se pudo recuperar el proyecto actualizado.');
  return proyAct;
  ──────────────────────────────────────────────────────────────────────────── */

  // ── MOCK ──────────────────────────────────────────────────────────────────
  const idx = MOCK_PROYECTOS.findIndex((p) => p.id === proyectoId || p.code === proyectoId);
  if (idx === -1) throw new Error('Proyecto no encontrado.');

  const original = MOCK_PROYECTOS[idx];
  const nuevosHitos = original.hitos.map(h => {
    if (h.id === hitoId) {
      return { ...h, estado: 'completado' as const, porcentaje: 100 };
    }
    return h;
  });

  if (hitoId === 'hito-1' || hitoId.endsWith('-1')) {
    const hito2 = nuevosHitos.find(h => h.id === 'hito-2' || h.id.endsWith('-2'));
    if (hito2 && hito2.estado === 'bloqueado') {
      hito2.estado = 'pendiente';
    }
  }

  const updated: Proyecto = {
    ...original,
    hitos: nuevosHitos,
    historial: [
      {
        id: `hist-${Date.now()}`,
        fecha: new Date().toISOString(),
        usuario: 'Ana Mendoza (Admin)',
        cambio: 'Seguimiento de Hitos',
        observacion: `Recepción registrada para el hito.`
      },
      ...original.historial
    ],
    updatedAt: new Date().toISOString()
  };

  MOCK_PROYECTOS[idx] = updated;
  return updated;
}
