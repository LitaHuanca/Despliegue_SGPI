/**
 * @file _data/service.ts
 * @description Capa de servicio del módulo de Reportes (SGPI-CFR).
 *
 * Para conectar al backend real:
 *   1. Descomentar el bloque REAL API.
 *   2. Comentar o eliminar el bloque MOCK.
 *
 * Endpoint real: POST /api/v1/reportes/generar
 */

import type { ReporteParams, ReporteResult, PasoCarga } from './types';
import { MOCK_REGISTROS } from './mock';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const CORTE_LABELS: Record<string, string> = {
  abril:     'Abril',
  agosto:    'Agosto',
  noviembre: 'Noviembre',
};

const TIPO_LABELS: Record<string, string> = {
  actividades:      'Carga No Lectiva y Cumplimiento',
  proyectosActivos: 'Proyectos Activos',
  baseDatosPOI:     'Base de Datos para POI',
};

// ─────────────────────────────────────────────────────────────────────────────
// Pasos animados de la carga (compartidos con el componente)
// ─────────────────────────────────────────────────────────────────────────────

export const PASOS_CARGA: PasoCarga[] = [
  { progreso: 10, mensaje: 'Conectando con la base de datos...' },
  { progreso: 28, mensaje: 'Consultando registros de docentes...' },
  { progreso: 50, mensaje: 'Calculando carga no lectiva...' },
  { progreso: 70, mensaje: 'Consolidando indicadores...' },
  { progreso: 88, mensaje: 'Aplicando filtros seleccionados...' },
  { progreso: 100, mensaje: 'Preparando reporte final...' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Generación del reporte
// ─────────────────────────────────────────────────────────────────────────────

export async function generarReporte(params: ReporteParams): Promise<ReporteResult> {
  /* ── REAL API ──────────────────────────────────────────────────────────────
  const res = await fetch('/api/v1/reportes/generar', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Error al generar el reporte.');
  return res.json() as Promise<ReporteResult>;
  ──────────────────────────────────────────────────────────────────────── */

  // MOCK — simula 2.5 s de procesamiento (animación manejada por el componente)
  await new Promise((r) => setTimeout(r, 2500));

  // Filtrar registros por departamentos seleccionados
  let registros = [...MOCK_REGISTROS];
  if (params.departamentos.length > 0) {
    registros = registros.filter((r) => params.departamentos.includes(r.departamento));
  }

  // EX1: Sin coincidencias
  if (registros.length === 0) {
    throw new Error('EX1:No se encontraron registros para los parámetros seleccionados.');
  }

  const totalCargaSum = registros.reduce((acc, r) => acc + r.totalCarga, 0);
  const promedio = Math.round(totalCargaSum / registros.length);

  const corteLabel = CORTE_LABELS[params.corte] ?? params.corte;
  const tipoLabel  = TIPO_LABELS[params.tipo]   ?? params.tipo;

  return {
    titulo:                 'Resultados del Reporte',
    subtitulo:              `${tipoLabel} - ${corteLabel} ${params.anioFiscal}`,
    generadoPor:            'Ana Mendoza',
    fechaEmision:           new Date().toISOString(),
    params,
    totalDocentes:          registros.length,
    proyectosActivos:       12,
    promedioCargaNoLectiva: promedio,
    registros,
    totalRegistros:         registros.length,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Guardar snapshot (paso 9 del flujo)
// ─────────────────────────────────────────────────────────────────────────────

export async function guardarSnapshot(result: ReporteResult): Promise<void> {
  /* ── REAL API ──────────────────────────────────────────────────────────────
  await fetch('/api/v1/reportes/snapshots', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(result),
  });
  ──────────────────────────────────────────────────────────────────────── */
  await new Promise((r) => setTimeout(r, 500));
  // Mock: sin acción persistente
}

// ─────────────────────────────────────────────────────────────────────────────
// Exportar reporte
// ─────────────────────────────────────────────────────────────────────────────

export async function exportarReporte(
  result: ReporteResult,
  formato: 'pdf' | 'excel'
): Promise<void> {
  /* ── REAL API ──────────────────────────────────────────────────────────────
  const res = await fetch(`/api/v1/reportes/export?format=${formato}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(result),
  });
  const blob = await res.blob();
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `reporte_${Date.now()}.${formato === 'pdf' ? 'pdf' : 'xlsx'}`;
  a.click();
  ──────────────────────────────────────────────────────────────────────── */
  await new Promise((r) => setTimeout(r, 400));
  alert(`Exportación en formato ${formato.toUpperCase()} disponible con backend real.`);
}

// Exportar umbrales para colorear la tabla
export const UMBRAL_ALTO = 18;  // totalCarga > UMBRAL_ALTO → rojo
export const UMBRAL_BAJO = 7;   // totalCarga < UMBRAL_BAJO → naranja/amarillo
