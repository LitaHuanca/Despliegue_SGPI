/**
 * @file _data/mock.ts
 * @description Datos mock para el módulo de Gestión de Proyectos de Investigación (SGPI-CFPI).
 */

import type { Proyecto, StatsProyectos } from './types';
import type { InvestigatorPadron } from '../../SGPI-CFGI/_data/types';

export const GRUPOS_DISPONIBLES = [
  'IA en Salud Pública',
  'Ciberseguridad Avanzada',
  'Sistemas de Información y Ciberseguridad Avanzada',
  'Redes y Sistemas Computacionales',
  'Ciencia de Datos Aplicada'
];

export const CONVOCATORIAS_DISPONIBLES = [
  'Convocatoria VRIP 2026',
  'Convocatoria VRIP 2025',
  'Convocatoria VRIP 2024',
  'VRIP General'
];

export const MOCK_PADRON_INVESTIGADORES: InvestigatorPadron[] = [
  {
    dni: '10203040',
    nombre: 'Dra. Rosa Pérez',
    email: 'rosa.perez@unmsm.edu.pe',
    facultad: 'Medicina Humana',
    departamento: 'Medicina Preventiva y Social'
  },
  {
    dni: '20304050',
    nombre: 'Ing. Carlos Ruiz',
    email: 'carlos.ruiz@unmsm.edu.pe',
    facultad: 'Ingeniería de Sistemas e Informática',
    departamento: 'Ingeniería de Sistemas y Software'
  },
  {
    dni: '30405060',
    nombre: 'Msc. Ana Silva',
    email: 'ana.silva@unmsm.edu.pe',
    facultad: 'Ingeniería de Sistemas e Informática',
    departamento: 'Ciencias de la Computación'
  },
  {
    dni: '40506070',
    nombre: 'Luis Gomez (Alumno)',
    email: 'luis.gomez@unmsm.edu.pe',
    facultad: 'Ingeniería de Sistemas e Informática',
    departamento: 'Ingeniería de Sistemas y Software'
  },
  {
    dni: '12345678',
    nombre: 'Carlos Alfonso Pérez Medina',
    email: 'carlos.perez@unmsm.edu.pe',
    facultad: 'Ingeniería de Sistemas e Informática',
    departamento: 'Ingeniería de Sistemas y Software'
  },
  {
    dni: '87654321',
    nombre: 'María Elena Rostworowski Silva',
    email: 'maria.rostworowski@unmsm.edu.pe',
    facultad: 'Ingeniería de Sistemas e Informática',
    departamento: 'Ciencias de la Computación'
  }
];

export const MOCK_PROYECTOS: Proyecto[] = [
  {
    id: 'PRJ-26-045',
    code: 'PRJ-26-045',
    title: 'Análisis Predictivo en Sistemas Distribuidos y Salud Pública',
    tipo: 'Aplicado',
    programa: 'VRIP General',
    convocatoria: 'Convocatoria VRIP 2026',
    resolucion: 'RR-00452-UNMSM-2026',
    montoFinanciado: 45000.00,
    inicioPlanificado: '2026-01-06',
    finPlanificado: '2027-01-06',
    status: 'pendiente_validar',
    grupoVinculado: 'IA en Salud Pública',
    responsablePrincipal: 'Dra. Rosa Pérez',
    createdAt: '2026-05-10T09:15:00Z',
    updatedAt: '2026-05-10T09:15:00Z',
    fuente: 'Extracción OCR (RR)',
    miembros: [
      {
        dni: '10203040',
        nombre: 'Dra. Rosa Pérez',
        rol: 'Responsable Principal',
        estado: 'activo'
      },
      {
        dni: '30405060',
        nombre: 'Msc. Ana Silva',
        rol: 'Co-investigador',
        estado: 'activo'
      },
      {
        dni: '40506070',
        nombre: 'Luis Gomez (Alumno)',
        rol: 'Tesista vinculado',
        estado: 'activo'
      }
    ],
    hitos: [
      {
        id: 'hito-1',
        nombre: 'Informe Académico (12 Meses)',
        fechaVencimiento: '2027-06-01',
        estado: 'pendiente',
        porcentaje: 20
      },
      {
        id: 'hito-2',
        nombre: 'Productos Entregables (36 Meses)',
        fechaVencimiento: '2029-06-01',
        estado: 'bloqueado',
        porcentaje: 0
      }
    ],
    historial: [
      {
        id: 'hist-1',
        fecha: '2026-05-10T09:15:00Z',
        usuario: 'Sistema (Auto)',
        cambio: 'Importación RAIS → Pendiente Validar',
        observacion: 'Registro inicial inyectado vía carga masiva Excel. Documento OCR RR-00452 asociado.'
      }
    ]
  },
  {
    id: 'PRJ-25-182',
    code: 'PRJ-25-182',
    title: 'Modelos predictivos epidemiológicos',
    tipo: 'Aplicado',
    programa: 'VRIP General',
    convocatoria: 'Convocatoria VRIP 2025',
    resolucion: 'RR-01234-UNMSM-2025',
    montoFinanciado: 38000.00,
    inicioPlanificado: '2025-03-01',
    finPlanificado: '2026-03-01',
    status: 'en_ejecucion',
    grupoVinculado: 'Ciberseguridad Avanzada',
    responsablePrincipal: 'Ing. Carlos Ruiz',
    createdAt: '2025-03-01T10:00:00Z',
    updatedAt: '2026-05-01T14:30:00Z',
    fuente: 'RAIS',
    miembros: [
      {
        dni: '20304050',
        nombre: 'Ing. Carlos Ruiz',
        rol: 'Responsable Principal',
        estado: 'activo'
      },
      {
        dni: '30405060',
        nombre: 'Msc. Ana Silva',
        rol: 'Co-investigador',
        estado: 'activo'
      }
    ],
    hitos: [
      {
        id: 'hito-1',
        nombre: 'Informe Académico (12 Meses)',
        fechaVencimiento: '2026-03-01',
        estado: 'completado',
        porcentaje: 100
      },
      {
        id: 'hito-2',
        nombre: 'Productos Entregables (36 Meses)',
        fechaVencimiento: '2028-03-01',
        estado: 'pendiente',
        porcentaje: 0
      }
    ],
    historial: [
      {
        id: 'hist-1',
        fecha: '2025-03-01T09:00:00Z',
        usuario: 'Sistema (Auto)',
        cambio: 'Importación RAIS → Pendiente Validar',
        observacion: 'Registro inicial importado desde la base de datos centralizada de proyectos.'
      },
      {
        id: 'hist-2',
        fecha: '2025-03-05T11:20:00Z',
        usuario: 'Ana Mendoza (Admin)',
        cambio: 'Pendiente Validar → En Ejecución',
        observacion: 'Se aprueban documentos presentados en formato físico y digital.'
      }
    ]
  },
  {
    id: 'PRJ-24-011',
    code: 'PRJ-24-011',
    title: 'Framework de seguridad IoT',
    tipo: 'Básico',
    programa: 'VRIP General',
    convocatoria: 'Convocatoria VRIP 2024',
    resolucion: 'RR-00789-UNMSM-2024',
    montoFinanciado: 50000.00,
    inicioPlanificado: '2024-01-15',
    finPlanificado: '2025-01-15',
    status: 'concluido',
    grupoVinculado: 'Ciberseguridad Avanzada',
    responsablePrincipal: 'Msc. Ana Silva',
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2025-01-20T16:00:00Z',
    fuente: 'RAIS',
    miembros: [
      {
        dni: '30405060',
        nombre: 'Msc. Ana Silva',
        rol: 'Responsable Principal',
        estado: 'activo'
      }
    ],
    hitos: [
      {
        id: 'hito-1',
        nombre: 'Informe Académico (12 Meses)',
        fechaVencimiento: '2025-01-15',
        estado: 'completado',
        porcentaje: 100
      },
      {
        id: 'hito-2',
        nombre: 'Productos Entregables (36 Meses)',
        fechaVencimiento: '2027-01-15',
        estado: 'completado',
        porcentaje: 100
      }
    ],
    historial: [
      {
        id: 'hist-1',
        fecha: '2024-01-15T09:00:00Z',
        usuario: 'Sistema (Auto)',
        cambio: 'Importación RAIS → Pendiente Validar',
        observacion: 'Registro inyectado vía integración VRIP.'
      },
      {
        id: 'hist-2',
        fecha: '2024-01-20T10:15:00Z',
        usuario: 'Ana Mendoza (Admin)',
        cambio: 'Pendiente Validar → En Ejecución',
        observacion: 'Validación de viabilidad técnica y firma de resolución habilitada.'
      },
      {
        id: 'hist-3',
        fecha: '2025-01-20T16:00:00Z',
        usuario: 'Ana Mendoza (Admin)',
        cambio: 'En Ejecución → Concluido',
        observacion: 'Sustentación de productos entregables y cierre formal de expediente.'
      }
    ]
  },
  {
    id: 'PRJ-26-092',
    code: 'PRJ-26-092',
    title: 'Optimización de Algoritmos NLP para Lenguas Originarias',
    tipo: 'Básico',
    programa: 'VRIP General',
    convocatoria: 'Convocatoria VRIP 2026',
    resolucion: 'RR-00712-UNMSM-2026',
    montoFinanciado: 35000.00,
    inicioPlanificado: '2026-02-15',
    finPlanificado: '2027-02-15',
    status: 'pendiente_validar',
    grupoVinculado: 'Ciencia de Datos Aplicada',
    responsablePrincipal: 'Msc. Ana Silva',
    createdAt: '2026-05-12T10:00:00Z',
    updatedAt: '2026-05-12T10:00:00Z',
    fuente: 'Extracción OCR (RR)',
    miembros: [
      {
        dni: '30405060',
        nombre: 'Msc. Ana Silva',
        rol: 'Responsable Principal',
        estado: 'activo'
      },
      {
        dni: '12345678',
        nombre: 'Carlos Alfonso Pérez Medina',
        rol: 'Co-investigador',
        estado: 'activo'
      }
    ],
    hitos: [
      {
        id: 'hito-1',
        nombre: 'Informe Académico (12 Meses)',
        fechaVencimiento: '2027-02-15',
        estado: 'bloqueado',
        porcentaje: 0
      },
      {
        id: 'hito-2',
        nombre: 'Productos Entregables (36 Meses)',
        fechaVencimiento: '2029-02-15',
        estado: 'bloqueado',
        porcentaje: 0
      }
    ],
    historial: [
      {
        id: 'hist-1',
        fecha: '2026-05-12T10:00:00Z',
        usuario: 'Sistema (Auto)',
        cambio: 'Importación RAIS → Pendiente Validar',
        observacion: 'Registro inyectado vía carga masiva Excel. Ficha OCR RR-00712 asociada.'
      }
    ]
  },
  {
    id: 'PRJ-26-114',
    code: 'PRJ-26-114',
    title: 'Diseño y Desarrollo de un Framework de Criptografía Post-Cuántica',
    tipo: 'Básico',
    programa: 'VRIP General',
    convocatoria: 'Convocatoria VRIP 2026',
    resolucion: 'RR-01055-UNMSM-2026',
    montoFinanciado: 42000.00,
    inicioPlanificado: '2026-03-10',
    finPlanificado: '2027-03-10',
    status: 'pendiente_validar',
    grupoVinculado: 'Ciberseguridad Avanzada',
    responsablePrincipal: 'Ing. Carlos Ruiz',
    createdAt: '2026-05-14T11:30:00Z',
    updatedAt: '2026-05-14T11:30:00Z',
    fuente: 'Extracción OCR (RR)',
    miembros: [
      {
        dni: '20304050',
        nombre: 'Ing. Carlos Ruiz',
        rol: 'Responsable Principal',
        estado: 'activo'
      },
      {
        dni: '87654321',
        nombre: 'María Elena Rostworowski Silva',
        rol: 'Co-investigador',
        estado: 'activo'
      }
    ],
    hitos: [
      {
        id: 'hito-1',
        nombre: 'Informe Académico (12 Meses)',
        fechaVencimiento: '2027-03-10',
        estado: 'bloqueado',
        porcentaje: 0
      },
      {
        id: 'hito-2',
        nombre: 'Productos Entregables (36 Meses)',
        fechaVencimiento: '2029-03-10',
        estado: 'bloqueado',
        porcentaje: 0
      }
    ],
    historial: [
      {
        id: 'hist-1',
        fecha: '2026-05-14T11:30:00Z',
        usuario: 'Sistema (Auto)',
        cambio: 'Importación RAIS → Pendiente Validar',
        observacion: 'Registro inyectado vía carga masiva Excel. Ficha OCR RR-01055 asociada.'
      }
    ]
  }
];

export function getMockStats(): StatsProyectos {
  const totalProyectos = MOCK_PROYECTOS.length;
  const pendientesValidar = MOCK_PROYECTOS.filter((p) => p.status === 'pendiente_validar').length;
  const enEjecucion = MOCK_PROYECTOS.filter((p) => p.status === 'en_ejecucion').length;
  const concluidos = MOCK_PROYECTOS.filter((p) => p.status === 'concluido').length;

  return {
    totalProyectos,
    pendientesValidar,
    enEjecucion,
    concluidos
  };
}
