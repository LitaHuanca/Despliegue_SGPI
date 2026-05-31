/**
 * @file _data/mock.ts
 * @description Datos mock del módulo de Docentes/Investigadores.
 * Reemplazar con GET /api/v1/docentes.
 */

import type { DocenteInvestigador, StatsDocentes, ProyectoHistorial } from './types';

const CURRENT_YEAR = new Date().getFullYear();

// ─────────────────────────────────────────────────────────────────────────────
// Catálogos
// ─────────────────────────────────────────────────────────────────────────────

export const DEPARTAMENTOS = [
  'Biología Celular',
  'Física Teórica',
  'Química Orgánica',
  'Genética',
  'Ingeniería de Sistemas',
  'Ingeniería de Software',
  'Ciencias de la Computación',
  'Matemáticas Aplicadas',
  'Ingeniería Eléctrica',
  'Biotecnología',
];

export const NIVELES_RENACYT = [
  'NIVEL I', 'NIVEL II', 'NIVEL III', 'NIVEL IV',
  'NIVEL V', 'NIVEL VI', 'NIVEL VII', 'DISTINGUIDO', 'Sin nivel',
];

// Genera historial de los últimos 7 años con datos variados
function genHistorial(base: number): DocenteInvestigador['puntajeHistorico'] {
  return Array.from({ length: 7 }, (_, i) => {
    const anio = CURRENT_YEAR - 6 + i;
    const art  = Math.max(0, Math.round(base + (Math.random() - 0.5) * 4));
    const tes  = Math.max(0, Math.round(base * 0.6 + (Math.random() - 0.5) * 2));
    const pro  = Math.max(0, Math.round(base * 0.4 + (Math.random() - 0.5) * 2));
    return { anio, articulos: art, tesis: tes, proyectos: pro, puntaje: art * 3 + tes * 2 + pro };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 20 docentes de muestra
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_DOCENTES: DocenteInvestigador[] = [
  {
    id: 'DOC-001', nombres: 'María Elena', apellidos: 'Alvarado Rivas',
    dni: '10458293', email: 'malvela@unmsm.edu.pe',
    departamento: 'Biología Celular', nivelRenacyt: 'NIVEL II',
    condicionSM: 'SM', estado: 'activo', fechaVigencia: '2027-08-31',
    codigoDocente: 'D-0041', puntajeHistorico: genHistorial(5),
    creadoEn: '2020-03-15', actualizadoEn: '2026-01-10',
  },
  {
    id: 'DOC-002', nombres: 'Jorge Luis', apellidos: 'Castro Mendieta',
    dni: '09873421', email: 'jcastrcm@unmsm.edu.pe',
    departamento: 'Física Teórica', nivelRenacyt: 'DISTINGUIDO',
    condicionSM: 'SM', estado: 'activo', fechaVigencia: '2028-12-31',
    codigoDocente: 'D-0017', puntajeHistorico: genHistorial(9),
    creadoEn: '2018-07-01', actualizadoEn: '2025-11-20',
  },
  {
    id: 'DOC-003', nombres: 'Carmen Rosa', apellidos: 'Zavala Rojas',
    dni: '41223344', email: 'czavalar@unmsm.edu.pe',
    departamento: 'Química Orgánica', nivelRenacyt: 'NIVEL I',
    condicionSM: 'No SM', estado: 'inactivo', fechaVigencia: '2024-06-30',
    codigoDocente: 'D-0093', puntajeHistorico: genHistorial(2),
    creadoEn: '2021-09-10', actualizadoEn: '2024-07-01',
  },
  {
    id: 'DOC-004', nombres: 'Fernando', apellidos: 'Gomez Sanchez',
    dni: '25884712', email: 'fgomezs@unmsm.edu.pe',
    departamento: 'Genética', nivelRenacyt: 'NIVEL III',
    condicionSM: 'SM', estado: 'activo', fechaVigencia: '2027-03-31',
    codigoDocente: 'D-0058', puntajeHistorico: genHistorial(6),
    creadoEn: '2019-02-20', actualizadoEn: '2025-08-15',
  },
  {
    id: 'DOC-005', nombres: 'Rosa Amelia', apellidos: 'Perez Torres',
    dni: '08459231', email: 'raperez@unmsm.edu.pe',
    departamento: 'Ingeniería de Sistemas', nivelRenacyt: 'NIVEL IV',
    condicionSM: 'SM', estado: 'activo', fechaVigencia: '2026-09-30',
    codigoDocente: 'D-0012', puntajeHistorico: genHistorial(7),
    creadoEn: '2017-04-01', actualizadoEn: '2026-02-28',
  },
  {
    id: 'DOC-006', nombres: 'Luis Alberto', apellidos: 'Gomez Llanos',
    dni: '40596871', email: 'lagomez@unmsm.edu.pe',
    departamento: 'Ingeniería de Software', nivelRenacyt: 'NIVEL II',
    condicionSM: 'No SM', estado: 'por_vencer', fechaVigencia: `${CURRENT_YEAR}-08-15`,
    codigoDocente: 'D-0073', puntajeHistorico: genHistorial(4),
    creadoEn: '2022-01-15', actualizadoEn: '2025-12-01',
  },
  {
    id: 'DOC-007', nombres: 'Alejandro', apellidos: 'Silva Ramirez',
    dni: '18293847', email: 'asilva@unmsm.edu.pe',
    departamento: 'Ciencias de la Computación', nivelRenacyt: 'NIVEL V',
    condicionSM: 'SM', estado: 'activo', fechaVigencia: '2029-01-31',
    codigoDocente: 'D-0034', puntajeHistorico: genHistorial(8),
    creadoEn: '2016-08-10', actualizadoEn: '2025-09-05',
  },
  {
    id: 'DOC-008', nombres: 'Carlos Enrique', apellidos: 'Mendoza Torres',
    dni: '42385912', email: 'cmendoza@unmsm.edu.pe',
    departamento: 'Ingeniería de Sistemas', nivelRenacyt: 'NIVEL III',
    condicionSM: 'SM', estado: 'activo', fechaVigencia: '2027-10-31',
    codigoDocente: 'D-0061', puntajeHistorico: genHistorial(5),
    creadoEn: '2020-06-01', actualizadoEn: '2026-01-20',
  },
  {
    id: 'DOC-009', nombres: 'Pedro Manuel', apellidos: 'Flores Cano',
    dni: '29384756', email: 'pflores@unmsm.edu.pe',
    departamento: 'Ingeniería de Software', nivelRenacyt: 'NIVEL I',
    condicionSM: 'No SM', estado: 'activo', fechaVigencia: '2026-11-30',
    codigoDocente: 'D-0089', puntajeHistorico: genHistorial(2),
    creadoEn: '2023-03-01', actualizadoEn: '2025-10-15',
  },
  {
    id: 'DOC-010', nombres: 'Julia Marisol', apellidos: 'Quispe Mamani',
    dni: '31928475', email: 'jquispe@unmsm.edu.pe',
    departamento: 'Ciencias de la Computación', nivelRenacyt: 'NIVEL II',
    condicionSM: 'SM', estado: 'por_vencer', fechaVigencia: `${CURRENT_YEAR}-07-20`,
    codigoDocente: 'D-0105', puntajeHistorico: genHistorial(4),
    creadoEn: '2021-11-01', actualizadoEn: '2025-06-01',
  },
  {
    id: 'DOC-011', nombres: 'Miguel Angel', apellidos: 'Torres Vargas',
    dni: '10293847', email: 'mtorres@unmsm.edu.pe',
    departamento: 'Matemáticas Aplicadas', nivelRenacyt: 'NIVEL VI',
    condicionSM: 'SM', estado: 'activo', fechaVigencia: '2030-05-31',
    codigoDocente: 'D-0008', puntajeHistorico: genHistorial(10),
    creadoEn: '2015-01-10', actualizadoEn: '2025-07-30',
  },
  {
    id: 'DOC-012', nombres: 'Marco Antonio', apellidos: 'Rojas Calla',
    dni: '55647382', email: 'mrojas@unmsm.edu.pe',
    departamento: 'Ingeniería de Software', nivelRenacyt: 'NIVEL II',
    condicionSM: 'No SM', estado: 'inactivo', fechaVigencia: '2025-01-31',
    codigoDocente: 'D-0117', puntajeHistorico: genHistorial(3),
    creadoEn: '2022-05-20', actualizadoEn: '2025-02-01',
  },
  {
    id: 'DOC-013', nombres: 'Beatriz', apellidos: 'Salinas Paredes',
    dni: '73849201', email: 'bsalinas@unmsm.edu.pe',
    departamento: 'Biotecnología', nivelRenacyt: 'NIVEL IV',
    condicionSM: 'SM', estado: 'activo', fechaVigencia: '2028-04-30',
    codigoDocente: 'D-0022', puntajeHistorico: genHistorial(7),
    creadoEn: '2018-09-15', actualizadoEn: '2025-11-01',
  },
  {
    id: 'DOC-014', nombres: 'Ernesto Abel', apellidos: 'Castillo Ruiz',
    dni: '62738491', email: 'ecastillo@unmsm.edu.pe',
    departamento: 'Física Teórica', nivelRenacyt: 'NIVEL III',
    condicionSM: 'SM', estado: 'activo', fechaVigencia: '2027-12-31',
    codigoDocente: 'D-0045', puntajeHistorico: genHistorial(5),
    creadoEn: '2019-08-01', actualizadoEn: '2025-09-20',
  },
  {
    id: 'DOC-015', nombres: 'Diana Luz', apellidos: 'Morales Cruz',
    dni: '84736291', email: 'dmorales@unmsm.edu.pe',
    departamento: 'Biología Celular', nivelRenacyt: 'Sin nivel',
    condicionSM: 'No SM', estado: 'activo',
    codigoDocente: 'D-0132', puntajeHistorico: genHistorial(1),
    creadoEn: '2024-02-10', actualizadoEn: '2025-10-05',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// KPIs del tablero
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_STATS: StatsDocentes = {
  totalDocentes:         482,
  deltaEsteMes:          12,
  investigadoresRenacyt: 315,
  porcentajeRenacyt:     65,
  vigenciasPorVencer:    24,
  proyectosActivos:      1054,
  cicloAcademico:        '2024-I',
};

// ─────────────────────────────────────────────────────────────────────────────
// Mock: Historial de Proyectos por docente
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_HISTORIAL_PROYECTOS: Record<string, ProyectoHistorial[]> = {
  'DOC-001': [
    {
      id: 'PRJ-H-001', codigo: 'PRJ-2024-112',
      titulo: 'Caracterización Genómica de Bacterias Extremofílas del Lago Titicaca',
      rol: 'Investigador Principal (IP)',
      anioInicio: 2024, presupuesto: 52000,
      entidadFinanciadora: 'CONCYTEC – ProCiencia',
      estado: 'en_ejecucion',
    },
    {
      id: 'PRJ-H-002', codigo: 'PRJ-2021-088',
      titulo: 'Resistencia Antimicrobiana en Enterobacterias de la Cuenca Amazonica',
      rol: 'Co-Investigador',
      anioInicio: 2021, anioFin: 2023, presupuesto: 38500,
      entidadFinanciadora: 'VRI – UNMSM',
      estado: 'finalizado',
    },
    {
      id: 'PRJ-H-003', codigo: 'PRJ-2019-034',
      titulo: 'Bioprospección de Hongos Endófitos en la Selva Alta Peruana',
      rol: 'Asesor',
      anioInicio: 2019, anioFin: 2020, presupuesto: 18000,
      entidadFinanciadora: 'VRI – UNMSM',
      estado: 'finalizado',
    },
  ],
  'DOC-002': [
    {
      id: 'PRJ-H-010', codigo: 'PRJ-2025-001',
      titulo: 'Gravitación Cuántica de Bucles y la Estructura del Espacio-Tiempo',
      rol: 'Investigador Principal (IP)',
      anioInicio: 2025, presupuesto: 120000,
      entidadFinanciadora: 'CONCYTEC – ProCiencia',
      estado: 'en_ejecucion',
    },
    {
      id: 'PRJ-H-011', codigo: 'PRJ-2022-203',
      titulo: 'Simulación de Agujeros Negros con Computación Cuántica',
      rol: 'Investigador Principal (IP)',
      anioInicio: 2022, anioFin: 2024, presupuesto: 95000,
      entidadFinanciadora: 'NSF – National Science Foundation',
      estado: 'finalizado',
    },
    {
      id: 'PRJ-H-012', codigo: 'PRJ-2020-117',
      titulo: 'Modelo Cosmológico de Energía Oscura en el Perú',
      rol: 'Co-Investigador',
      anioInicio: 2020, anioFin: 2022, presupuesto: 47000,
      entidadFinanciadora: 'VRI – UNMSM',
      estado: 'finalizado',
    },
  ],
  'DOC-005': [
    {
      id: 'PRJ-H-020', codigo: 'PRJ-2023-684',
      titulo: 'Optimización de Modelos de Lenguaje para Lenguas Originarias del Perú',
      rol: 'Investigador Principal (IP)',
      anioInicio: 2023, presupuesto: 45000,
      entidadFinanciadora: 'CONCYTEC – ProCiencia',
      estado: 'en_ejecucion',
    },
    {
      id: 'PRJ-H-021', codigo: 'PRJ-2021-112',
      titulo: 'Sistema de Alerta Temprana para Anomalías Climáticas usando Machine Learning',
      rol: 'Co-Investigador',
      anioInicio: 2021, anioFin: 2022, presupuesto: 28500,
      entidadFinanciadora: 'VRI – UNMSM',
      estado: 'finalizado',
    },
    {
      id: 'PRJ-H-022', codigo: 'PRJ-2019-055',
      titulo: 'Arquitectura de Microservicios para Sistemas de Información Universitarios',
      rol: 'Investigador Principal (IP)',
      anioInicio: 2019, anioFin: 2021, presupuesto: 32000,
      entidadFinanciadora: 'VRI – UNMSM',
      estado: 'finalizado',
    },
    {
      id: 'PRJ-H-023', codigo: 'PRJ-2018-030',
      titulo: 'Detección Automática de Plagio en Documentos Académicos',
      rol: 'Asesor',
      anioInicio: 2018, anioFin: 2019, presupuesto: 15000,
      entidadFinanciadora: 'VRI – UNMSM',
      estado: 'finalizado',
    },
  ],
  'DOC-007': [
    {
      id: 'PRJ-H-030', codigo: 'PRJ-2024-311',
      titulo: 'Algoritmos Cuasi-Óptimos para la Resolución de Sistemas de Ecuaciones No Lineales',
      rol: 'Investigador Principal (IP)',
      anioInicio: 2024, presupuesto: 78000,
      entidadFinanciadora: 'CONCYTEC – ProCiencia',
      estado: 'en_ejecucion',
    },
    {
      id: 'PRJ-H-031', codigo: 'PRJ-2022-189',
      titulo: 'Redes Neuronales Profundas aplicadas a Procesamiento de Imágenes Médicas',
      rol: 'Co-Investigador',
      anioInicio: 2022, anioFin: 2023, presupuesto: 55000,
      entidadFinanciadora: 'MINSA – INS',
      estado: 'finalizado',
    },
  ],
  'DOC-011': [
    {
      id: 'PRJ-H-040', codigo: 'PRJ-2025-007',
      titulo: 'Topología Algebraica Aplicada al Análisis de Datos Matemáticos Complejos',
      rol: 'Investigador Principal (IP)',
      anioInicio: 2025, presupuesto: 88000,
      entidadFinanciadora: 'CONCYTEC – ProCiencia',
      estado: 'en_ejecucion',
    },
    {
      id: 'PRJ-H-041', codigo: 'PRJ-2023-099',
      titulo: 'Optimización Matemática de Rutas Logísticas en Ciudades Inteligentes',
      rol: 'Investigador Principal (IP)',
      anioInicio: 2023, anioFin: 2024, presupuesto: 42000,
      entidadFinanciadora: 'MTC – Ministerio de Transportes',
      estado: 'finalizado',
    },
    {
      id: 'PRJ-H-042', codigo: 'PRJ-2021-050',
      titulo: 'Análisis Espectral de Señales Biomédicas con Onditas Matemáticas',
      rol: 'Co-Investigador',
      anioInicio: 2021, anioFin: 2022, presupuesto: 29000,
      entidadFinanciadora: 'INSM – Instituto Nacional de Salud Mental',
      estado: 'finalizado',
    },
    {
      id: 'PRJ-H-043', codigo: 'PRJ-2019-021',
      titulo: 'Modelos Estocásticos de Propagación de Epidemias en Régimen Tropical',
      rol: 'Investigador Principal (IP)',
      anioInicio: 2019, anioFin: 2020, presupuesto: 24500,
      entidadFinanciadora: 'OPS – Organización Panamericana de la Salud',
      estado: 'finalizado',
    },
  ],
};

/** Fallback genérico para cualquier docente sin entradas en MOCK_HISTORIAL_PROYECTOS */
export function getMockHistorial(docenteId: string): ProyectoHistorial[] {
  if (MOCK_HISTORIAL_PROYECTOS[docenteId]) {
    return MOCK_HISTORIAL_PROYECTOS[docenteId];
  }
  // Genera 2 proyectos genéricos
  return [
    {
      id: `PRJ-GEN-${docenteId}-1`, codigo: `PRJ-2023-${docenteId.slice(-3)}`,
      titulo: 'Proyecto de Investigación Interdisciplinario en Ciencias Básicas',
      rol: 'Investigador Principal (IP)',
      anioInicio: 2023, presupuesto: 35000,
      entidadFinanciadora: 'CONCYTEC – ProCiencia',
      estado: 'en_ejecucion',
    },
    {
      id: `PRJ-GEN-${docenteId}-2`, codigo: `PRJ-2021-${docenteId.slice(-3)}`,
      titulo: 'Desarrollo de Capacidades de Investigación Formativa',
      rol: 'Co-Investigador',
      anioInicio: 2021, anioFin: 2022, presupuesto: 22000,
      entidadFinanciadora: 'VRI – UNMSM',
      estado: 'finalizado',
    },
  ];
}
