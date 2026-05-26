/**
 * @file _data/mock.ts
 * @description Datos mock para el módulo de Alertas de Convocatorias.
 * Reemplazar con datos reales del endpoint GET /api/v1/convocatorias
 */

import type { Convocatoria } from './types';

// Fecha base de referencia para calcular días (relativa a la fecha actual)
const today = new Date();

function addDays(days: number): string {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export const MOCK_CONVOCATORIAS: Convocatoria[] = [
  // ── Vence en 2 días (ROJO) ────────────────────────────────────────────────
  {
    id:            'CONV-2026-001',
    nombre:        'Proyectos de Investigación con Asignación (PMI)',
    entidad:       'VRIP — UNMSM',
    programa:      'Programa de Mejora Institucional',
    estado:        'Activa',
    fechaCierre:   addDays(2),
    fuente:        'RAIS',
    ultimaSync:    '25 May 2026, 08:00 AM',
    cronogramaModificado: false,
    descripcion:   'Convocatoria para proyectos de investigación con asignación presupuestal del Programa de Mejora Institucional 2026. Dirigida a docentes con categoría principal o asociado.',
    evidencias:    [],
  },

  // ── Vence en 6 días (AMARILLO) ────────────────────────────────────────────
  {
    id:            'CONV-2026-002',
    nombre:        'Convocatoria para Grupos de Estudio Estudiantiles',
    entidad:       'VRIP — UNMSM',
    programa:      'Fondos de Difusión Académica',
    estado:        'Activa',
    fechaCierre:   addDays(6),
    fuente:        'RAIS',
    ultimaSync:    '25 May 2026, 08:00 AM',
    cronogramaModificado: false,
    descripcion:   'Convocatoria destinada al financiamiento de grupos de estudio estudiantiles en la UNMSM. Los grupos deben contar con asesor docente y un mínimo de 5 integrantes matriculados.',
    evidencias:    [],
  },

  // ── Vence en 12 días (VERDE) ──────────────────────────────────────────────
  {
    id:            'CONV-2026-003',
    nombre:        'Fondo Nacional de Desarrollo Científico y Tecnológico — FONDECYT 2026',
    entidad:       'CONCYTEC',
    programa:      'FONDECYT Básica',
    estado:        'Activa',
    fechaCierre:   addDays(12),
    fuente:        'CONCYTEC API',
    ultimaSync:    '24 May 2026, 11:30 PM',
    cronogramaModificado: true,
    descripcion:   'Financiamiento para investigación básica orientada a generar conocimiento científico sin aplicación inmediata. Aplica para proyectos de 1 a 3 años con monto máximo de S/ 150,000.',
    evidencias:    [
      {
        id:          'EV-001',
        fileName:    'difusion_fondecyt_carta.pdf',
        descripcion: 'Carta de difusión enviada a decanos de facultad',
        fechaCarga:  '2026-05-20',
        cargadoPor:  'Ana Mendoza',
      },
    ],
  },

  // ── Vence en 20 días (VERDE) ──────────────────────────────────────────────
  {
    id:            'CONV-2026-004',
    nombre:        'Concurso Nacional de Innovación Tecnológica Universitaria',
    entidad:       'MINEDU',
    programa:      'Innovación en Educación Superior',
    estado:        'Activa',
    fechaCierre:   addDays(20),
    fuente:        'CONCYTEC API',
    ultimaSync:    '26 May 2026, 06:00 AM',
    cronogramaModificado: false,
    descripcion:   'Concurso para proyectos de innovación tecnológica desarrollados en universidades peruanas. Premios de hasta S/ 80,000 para los tres primeros lugares por categoría.',
    evidencias:    [],
  },

  // ── Cerrada ───────────────────────────────────────────────────────────────
  {
    id:            'CONV-2025-088',
    nombre:        'Convocatoria VRIP — Investigación Aplicada 2025',
    entidad:       'VRIP — UNMSM',
    programa:      'Investigación Aplicada',
    estado:        'Cerrada',
    fechaCierre:   addDays(-30),
    fuente:        'RAIS',
    ultimaSync:    '01 Jan 2026, 00:00 AM',
    cronogramaModificado: false,
    descripcion:   'Convocatoria cerrada del ciclo 2025 para proyectos de investigación aplicada financiados por la VRIP.',
    evidencias:    [
      {
        id:          'EV-002',
        fileName:    'circular_difusion_2025.pdf',
        descripcion: 'Circular de difusión enviada por correo a todos los docentes',
        fechaCarga:  '2025-10-01',
        cargadoPor:  'Ana Mendoza',
      },
      {
        id:          'EV-003',
        fileName:    'poster_convocatoria_vrip.jpg',
        descripcion: 'Poster publicado en carteleras de la facultad',
        fechaCarga:  '2025-10-05',
        cargadoPor:  'Carlos López',
      },
    ],
  },

  // ── Suspendida ────────────────────────────────────────────────────────────
  {
    id:            'CONV-2026-005',
    nombre:        'Becas de Movilidad Académica Internacional 2026',
    entidad:       'PRONABEC',
    programa:      'Beca Presidente de la República',
    estado:        'Suspendida',
    fechaCierre:   addDays(45),
    fuente:        'CONCYTEC API',
    ultimaSync:    '20 May 2026, 09:00 AM',
    cronogramaModificado: true,
    descripcion:   'Programa de becas para movilidad académica internacional. Temporalmente suspendida por ajuste en los términos de referencia.',
    evidencias:    [],
  },
];
