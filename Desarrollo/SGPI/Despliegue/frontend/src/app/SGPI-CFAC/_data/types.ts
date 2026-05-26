/**
 * @file _data/types.ts
 * @description Tipos TypeScript del módulo de Alertas de Convocatorias (SGPI-CFAC).
 *
 * Endpoint: GET /api/v1/convocatorias
 * Endpoint detalle: GET /api/v1/convocatorias/{id}
 * Endpoint evidencia: POST /api/v1/convocatorias/{id}/evidencias
 */

// ─────────────────────────────────────────────────────────────────────────────
// Enumeraciones
// ─────────────────────────────────────────────────────────────────────────────

export type EstadoConvocatoria =
  | 'Activa'
  | 'Por Vencer'
  | 'Cerrada'
  | 'Suspendida';

/** Nivel de urgencia calculado en base a días restantes */
export type NivelAlerta = 'verde' | 'amarillo' | 'rojo';

// ─────────────────────────────────────────────────────────────────────────────
// Entidades
// ─────────────────────────────────────────────────────────────────────────────

export interface Evidencia {
  id:          string;
  fileName:    string;
  descripcion: string;
  fechaCarga:  string;   // ISO date
  cargadoPor:  string;
}

export interface Convocatoria {
  id:             string;
  nombre:         string;
  entidad:        string;            // "CONCYTEC", "VRIP", "PMI", etc.
  programa?:      string;
  estado:         EstadoConvocatoria;
  fechaCierre:    string;            // ISO date "YYYY-MM-DD"
  fuente:         string;            // "RAIS", "CONCYTEC API", etc.
  ultimaSync:     string;            // formatted: "25 May 2026, 08:00 AM"
  descripcion?:   string;
  cronogramaModificado?: boolean;    // true si cambió desde la última sync
  evidencias:     Evidencia[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Filtros
// ─────────────────────────────────────────────────────────────────────────────

export interface AlertaFiltros {
  buscar: string;
  estado: EstadoConvocatoria | 'Todos';
  orden:  'porDefecto' | 'fechaCierre' | 'nombre' | 'alerta';
}

// ─────────────────────────────────────────────────────────────────────────────
// Payload para cargar evidencia
// ─────────────────────────────────────────────────────────────────────────────

export interface EvidenciaPayload {
  convocatoriaId: string;
  file:           File;
  descripcion:    string;
}
