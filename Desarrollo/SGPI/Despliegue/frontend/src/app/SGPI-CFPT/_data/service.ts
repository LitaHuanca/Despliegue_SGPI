/**
 * @file _data/service.ts
 * @description Capa de servicio del módulo de Publicaciones y Tesis (SGPI-CFPT).
 *
 * Para conectar al backend real:
 *   1. Descomentar los bloques REAL API.
 *   2. Comentar/eliminar los bloques MOCK.
 *
 * Endpoints documentados:
 *   GET  /api/v1/publicaciones                         → lista con filtros
 *   GET  /api/v1/publicaciones/{id}                    → detalle
 *   POST /api/v1/publicaciones/{id}/confirmar          → confirmar y persistir
 *   PUT  /api/v1/publicaciones/{id}/vincular           → vincular docente (EX1)
 *   GET  /api/v1/publicaciones/validar-doi?doi=...     → validación duplicado (EX2)
 *   GET  /api/v1/investigadores?q=...                  → búsqueda para vincular
 */

import type {
  RegistroProduccion, FiltrosProduccion, ConfirmarPayload, InvestigadorResumen,
} from './types';
import { MOCK_PRODUCCIONES, MOCK_INVESTIGADORES } from './mock';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers de formato
// ─────────────────────────────────────────────────────────────────────────────

export function formatFecha(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Obtener lista de producciones (con filtros)
// ─────────────────────────────────────────────────────────────────────────────

export async function getProducciones(filtros: FiltrosProduccion): Promise<RegistroProduccion[]> {
  /* ── REAL API ──────────────────────────────────────────────────────────────
  const params = new URLSearchParams({
    q:          filtros.buscar,
    tipo:       filtros.tipo,
    estado:     filtros.estado,
    indexacion: filtros.indexacion,
  });
  const res = await fetch(`/api/v1/publicaciones?${params}`);
  if (!res.ok) throw new Error('Error al cargar producciones.');
  return res.json() as Promise<RegistroProduccion[]>;
  ──────────────────────────────────────────────────────────────────────── */

  // MOCK
  await new Promise((r) => setTimeout(r, 300));

  let list = [...MOCK_PRODUCCIONES];

  if (filtros.tipo !== 'todos')
    list = list.filter((p) => p.tipo === filtros.tipo);

  if (filtros.estado !== 'todos')
    list = list.filter((p) => p.estado === filtros.estado);

  if (filtros.indexacion !== 'todas')
    list = list.filter((p) => p.fuente === filtros.indexacion);

  if (filtros.buscar.trim()) {
    const q = filtros.buscar.toLowerCase();
    list = list.filter(
      (p) =>
        p.titulo.toLowerCase().includes(q) ||
        p.autores.toLowerCase().includes(q) ||
        (p.doi?.toLowerCase().includes(q) ?? false)
    );
  }

  return list;
}

// ─────────────────────────────────────────────────────────────────────────────
// Obtener detalle
// ─────────────────────────────────────────────────────────────────────────────

export async function getProduccionById(id: string): Promise<RegistroProduccion | null> {
  /* ── REAL API ──────────────────────────────────────────────────────────────
  const res = await fetch(`/api/v1/publicaciones/${id}`);
  if (!res.ok) return null;
  return res.json();
  ──────────────────────────────────────────────────────────────────────── */

  await new Promise((r) => setTimeout(r, 200));
  return MOCK_PRODUCCIONES.find((p) => p.id === id) ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Confirmar y persistir (pasos 7 y 10 del flujo)
// ─────────────────────────────────────────────────────────────────────────────

export async function confirmarProduccion(payload: ConfirmarPayload): Promise<RegistroProduccion> {
  /* ── REAL API ──────────────────────────────────────────────────────────────
  const res = await fetch(`/api/v1/publicaciones/${payload.id}/confirmar`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Error al confirmar la producción.');
  return res.json();
  ──────────────────────────────────────────────────────────────────────── */

  await new Promise((r) => setTimeout(r, 700));

  const idx = MOCK_PRODUCCIONES.findIndex((p) => p.id === payload.id);
  if (idx === -1) throw new Error('Registro no encontrado.');

  // Reconstruir investigadoresVinculados desde los IDs
  const vinculados = payload.investigadoresVinculados.map(({ investigadorId, rol }) => {
    const inv = MOCK_INVESTIGADORES.find((i) => i.id === investigadorId);
    if (!inv) throw new Error(`Investigador ${investigadorId} no encontrado.`);
    return { investigador: inv, rol };
  });

  const updated: RegistroProduccion = {
    ...MOCK_PRODUCCIONES[idx],
    estado:                  'validado',
    doi:                     payload.doi     ?? MOCK_PRODUCCIONES[idx].doi,
    issn:                    payload.issn    ?? MOCK_PRODUCCIONES[idx].issn,
    volNum:                  payload.volNum  ?? MOCK_PRODUCCIONES[idx].volNum,
    revista:                 payload.revista ?? MOCK_PRODUCCIONES[idx].revista,
    cuartil:                 payload.cuartil ?? MOCK_PRODUCCIONES[idx].cuartil,
    investigadoresVinculados: vinculados,
    confirmadoPor:           'Ana Mendoza',
    confirmadoEn:            new Date().toISOString(),
  };
  MOCK_PRODUCCIONES[idx] = updated;
  return updated;
}

// ─────────────────────────────────────────────────────────────────────────────
// Validar DOI duplicado (EX2)
// ─────────────────────────────────────────────────────────────────────────────

export async function validarDOI(doi: string): Promise<{ duplicado: boolean; existenteId?: string }> {
  /* ── REAL API ──────────────────────────────────────────────────────────────
  const res = await fetch(`/api/v1/publicaciones/validar-doi?doi=${encodeURIComponent(doi)}`);
  return res.json();
  ──────────────────────────────────────────────────────────────────────── */

  await new Promise((r) => setTimeout(r, 150));
  const existente = MOCK_PRODUCCIONES.find(
    (p) => p.doi && p.doi === doi && p.estado === 'validado'
  );
  return { duplicado: !!existente, existenteId: existente?.id };
}

// ─────────────────────────────────────────────────────────────────────────────
// Buscar investigadores para vincular (EX1)
// ─────────────────────────────────────────────────────────────────────────────

export async function buscarInvestigadores(q: string): Promise<InvestigadorResumen[]> {
  /* ── REAL API ──────────────────────────────────────────────────────────────
  const res = await fetch(`/api/v1/investigadores?q=${encodeURIComponent(q)}`);
  return res.json();
  ──────────────────────────────────────────────────────────────────────── */

  await new Promise((r) => setTimeout(r, 200));
  if (!q.trim()) return MOCK_INVESTIGADORES;
  const query = q.toLowerCase();
  return MOCK_INVESTIGADORES.filter(
    (i) => i.nombre.toLowerCase().includes(query) || i.dni.includes(query)
  );
}
