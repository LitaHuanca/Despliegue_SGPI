/**
 * @file _data/service.ts
 * @description Capa de servicio del módulo de Alertas de Convocatorias.
 *
 * Para conectar con el backend real:
 * 1. Descomentar las llamadas fetch.
 * 2. Comentar o eliminar el bloque MOCK.
 *
 * Endpoints:
 *   GET    /api/v1/convocatorias                     → lista paginada
 *   GET    /api/v1/convocatorias/{id}                → detalle
 *   POST   /api/v1/convocatorias/{id}/evidencias     → subir evidencia (multipart)
 */

import type { Convocatoria, AlertaFiltros, NivelAlerta, EvidenciaPayload, Evidencia } from './types';
import { MOCK_CONVOCATORIAS } from './mock';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers de semaforización
// ─────────────────────────────────────────────────────────────────────────────

/** Calcula los días restantes hasta la fecha de cierre desde hoy */
export function diasRestantes(fechaCierre: string): number {
  const hoy    = new Date();
  hoy.setHours(0, 0, 0, 0);
  const cierre = new Date(fechaCierre + 'T00:00:00');
  return Math.ceil((cierre.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Determina el nivel de alerta según días restantes.
 * Umbrales: rojo ≤ 3 días | amarillo 4-7 días | verde > 7 días
 */
export function nivelAlerta(dias: number): NivelAlerta {
  if (dias <= 3) return 'rojo';
  if (dias <= 7) return 'amarillo';
  return 'verde';
}

/** Formatea una fecha ISO "YYYY-MM-DD" a "DD Mmm YYYY" en español */
export function formatFechaCierre(iso: string): string {
  const [y, m, d] = iso.split('-');
  const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  return `${parseInt(d)} ${meses[parseInt(m) - 1]} ${y}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Servicio de consulta
// ─────────────────────────────────────────────────────────────────────────────

export async function getConvocatorias(filtros: AlertaFiltros): Promise<Convocatoria[]> {
  /* ── REAL API ─────────────────────────────────────────────────────────────
  const params = new URLSearchParams({
    buscar: filtros.buscar,
    estado: filtros.estado,
    orden:  filtros.orden,
  });
  const res  = await fetch(`/api/v1/convocatorias?${params}`);
  return res.json() as Promise<Convocatoria[]>;
  ──────────────────────────────────────────────────────────────────────── */

  // MOCK ───────────────────────────────────────────────────────────────────
  await new Promise((r) => setTimeout(r, 300));

  let list = [...MOCK_CONVOCATORIAS];

  // Filtro: estado
  if (filtros.estado !== 'Todos') {
    list = list.filter((c) => c.estado === filtros.estado);
  }

  // Filtro: búsqueda de texto
  if (filtros.buscar.trim()) {
    const q = filtros.buscar.toLowerCase();
    list = list.filter(
      (c) =>
        c.nombre.toLowerCase().includes(q) ||
        c.entidad.toLowerCase().includes(q) ||
        (c.programa?.toLowerCase().includes(q) ?? false)
    );
  }

  // Ordenar
  if (filtros.orden === 'fechaCierre') {
    list = list.sort((a, b) => a.fechaCierre.localeCompare(b.fechaCierre));
  } else if (filtros.orden === 'nombre') {
    list = list.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  } else if (filtros.orden === 'alerta') {
    list = list.sort((a, b) => diasRestantes(a.fechaCierre) - diasRestantes(b.fechaCierre));
  }

  return list;
}

export async function getConvocatoriaById(id: string): Promise<Convocatoria | null> {
  /* ── REAL API ──────────────────────────────────────────────────────────────
  const res = await fetch(`/api/v1/convocatorias/${id}`);
  if (!res.ok) return null;
  return res.json();
  ──────────────────────────────────────────────────────────────────────── */

  await new Promise((r) => setTimeout(r, 200));
  return MOCK_CONVOCATORIAS.find((c) => c.id === id) ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Subida de evidencia
// ─────────────────────────────────────────────────────────────────────────────

const EVIDENCIA_MAX_SIZE_MB   = 10;
const EVIDENCIA_ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
const EVIDENCIA_ALLOWED_EXTS  = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];

export function validarEvidencia(file: File): { valid: boolean; error?: string } {
  const ext = '.' + (file.name.split('.').pop()?.toLowerCase() ?? '');
  if (!EVIDENCIA_ALLOWED_EXTS.includes(ext)) {
    return {
      valid: false,
      error: 'El archivo debe ser PDF o Imagen y no superar los 10MB.',
    };
  }
  if (file.size > EVIDENCIA_MAX_SIZE_MB * 1024 * 1024) {
    return {
      valid: false,
      error: 'El archivo debe ser PDF o Imagen y no superar los 10MB.',
    };
  }
  return { valid: true };
}

export async function subirEvidencia(payload: EvidenciaPayload): Promise<Evidencia> {
  /* ── REAL API ──────────────────────────────────────────────────────────────
  const form = new FormData();
  form.append('file',        payload.file);
  form.append('descripcion', payload.descripcion);
  const res = await fetch(`/api/v1/convocatorias/${payload.convocatoriaId}/evidencias`, {
    method: 'POST',
    body:   form,
  });
  if (!res.ok) throw new Error('Error al subir la evidencia.');
  return res.json();
  ──────────────────────────────────────────────────────────────────────── */

  // MOCK
  await new Promise((r) => setTimeout(r, 1000));

  const nueva: Evidencia = {
    id:          `EV-${Date.now()}`,
    fileName:    payload.file.name,
    descripcion: payload.descripcion,
    fechaCarga:  new Date().toISOString().split('T')[0],
    cargadoPor:  'Ana Mendoza',
  };

  // Actualizar mock en memoria
  const conv = MOCK_CONVOCATORIAS.find((c) => c.id === payload.convocatoriaId);
  if (conv) conv.evidencias.push(nueva);

  return nueva;
}

export { EVIDENCIA_MAX_SIZE_MB, EVIDENCIA_ALLOWED_EXTS };
