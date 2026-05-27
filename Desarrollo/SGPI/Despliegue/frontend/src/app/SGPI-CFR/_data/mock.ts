/**
 * @file _data/mock.ts
 * @description Datos mock del módulo de Reportes.
 * Sustituir con llamadas reales a POST /api/v1/reportes/generar.
 */

import type { RegistroDocente } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// Catálogos
// ─────────────────────────────────────────────────────────────────────────────

export const DEPARTAMENTOS_ACADEMICOS = [
  'Ingeniería de Sistemas',
  'Ingeniería de Software',
  'Ciencias de la Computación',
  'Ingeniería Eléctrica',
  'Ingeniería Industrial',
];

export const GRUPOS_INVESTIGACION = [
  'IA en Salud Pública',
  'Bioinformática Clínica',
  'NLP y Minería de Datos',
  'Visión Artificial y Robótica',
  'IA en Educación',
  'Seguridad Informática',
];

export const AÑOS_FISCALES = [2021, 2022, 2023, 2024, 2025, 2026];

// ─────────────────────────────────────────────────────────────────────────────
// Registros de docentes (30 entradas)
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_REGISTROS: RegistroDocente[] = [
  { id: 'd01', nombre: 'Mendoza Torres, Carlos',   dni: '08459231', departamento: 'Ingeniería de Sistemas',      hrsProyectos: 10, hrsAsesorias: 6,  totalCarga: 16 },
  { id: 'd02', nombre: 'Perez Rojas, Ana Maria',   dni: '40596871', departamento: 'Ingeniería de Software',      hrsProyectos: 8,  hrsAsesorias: 4,  totalCarga: 12 },
  { id: 'd03', nombre: 'Gonzales Chu, Luis',        dni: '18293847', departamento: 'Ciencias de la Computación', hrsProyectos: 12, hrsAsesorias: 8,  totalCarga: 20 },
  { id: 'd04', nombre: 'Ramirez Soto, Jorge',       dni: '42385912', departamento: 'Ingeniería de Sistemas',      hrsProyectos: 4,  hrsAsesorias: 2,  totalCarga: 6  },
  { id: 'd05', nombre: 'Huaman Llanos, Rosa',       dni: '29384756', departamento: 'Ingeniería de Software',      hrsProyectos: 6,  hrsAsesorias: 5,  totalCarga: 11 },
  { id: 'd06', nombre: 'Torres Quispe, Miguel',     dni: '31928475', departamento: 'Ciencias de la Computación', hrsProyectos: 9,  hrsAsesorias: 3,  totalCarga: 12 },
  { id: 'd07', nombre: 'Vargas Salas, Carmen',      dni: '10293847', departamento: 'Ingeniería de Sistemas',      hrsProyectos: 14, hrsAsesorias: 7,  totalCarga: 21 },
  { id: 'd08', nombre: 'Quispe Flores, Renato',     dni: '55647382', departamento: 'Ingeniería de Software',      hrsProyectos: 5,  hrsAsesorias: 3,  totalCarga: 8  },
  { id: 'd09', nombre: 'Salinas Paredes, Beatriz',  dni: '73849201', departamento: 'Ciencias de la Computación', hrsProyectos: 11, hrsAsesorias: 6,  totalCarga: 17 },
  { id: 'd10', nombre: 'Castillo Ruiz, Ernesto',    dni: '62738491', departamento: 'Ingeniería de Sistemas',      hrsProyectos: 8,  hrsAsesorias: 5,  totalCarga: 13 },
  { id: 'd11', nombre: 'Morales Cruz, Diana',       dni: '84736291', departamento: 'Ingeniería de Software',      hrsProyectos: 3,  hrsAsesorias: 2,  totalCarga: 5  },
  { id: 'd12', nombre: 'Aguilar Vega, Samuel',      dni: '91827364', departamento: 'Ciencias de la Computación', hrsProyectos: 16, hrsAsesorias: 6,  totalCarga: 22 },
  { id: 'd13', nombre: 'Ccori Mamani, Luz',         dni: '38291746', departamento: 'Ingeniería de Sistemas',      hrsProyectos: 7,  hrsAsesorias: 4,  totalCarga: 11 },
  { id: 'd14', nombre: 'Nuñez Lazo, Roberto',       dni: '47382910', departamento: 'Ingeniería de Software',      hrsProyectos: 10, hrsAsesorias: 5,  totalCarga: 15 },
  { id: 'd15', nombre: 'Ramos Paz, Patricia',       dni: '56473829', departamento: 'Ciencias de la Computación', hrsProyectos: 13, hrsAsesorias: 7,  totalCarga: 20 },
  { id: 'd16', nombre: 'Delgado Soria, Ivan',       dni: '63748291', departamento: 'Ingeniería de Sistemas',      hrsProyectos: 6,  hrsAsesorias: 4,  totalCarga: 10 },
  { id: 'd17', nombre: 'Espinoza Tello, Miriam',    dni: '74829136', departamento: 'Ingeniería de Software',      hrsProyectos: 9,  hrsAsesorias: 6,  totalCarga: 15 },
  { id: 'd18', nombre: 'Condori Arias, Felix',      dni: '85912374', departamento: 'Ciencias de la Computación', hrsProyectos: 4,  hrsAsesorias: 3,  totalCarga: 7  },
  { id: 'd19', nombre: 'Palomino Heredia, Gloria',  dni: '96023485', departamento: 'Ingeniería de Sistemas',      hrsProyectos: 12, hrsAsesorias: 8,  totalCarga: 20 },
  { id: 'd20', nombre: 'Chavez Rueda, Oscar',       dni: '07134596', departamento: 'Ingeniería de Software',      hrsProyectos: 7,  hrsAsesorias: 3,  totalCarga: 10 },
  { id: 'd21', nombre: 'Limachi Surco, Antonia',    dni: '18245607', departamento: 'Ciencias de la Computación', hrsProyectos: 11, hrsAsesorias: 5,  totalCarga: 16 },
  { id: 'd22', nombre: 'Flores Cano, Pedro',        dni: '29356718', departamento: 'Ingeniería de Sistemas',      hrsProyectos: 5,  hrsAsesorias: 4,  totalCarga: 9  },
  { id: 'd23', nombre: 'Mamani Quispe, Angela',     dni: '30467829', departamento: 'Ingeniería de Software',      hrsProyectos: 8,  hrsAsesorias: 6,  totalCarga: 14 },
  { id: 'd24', nombre: 'Soto Lujan, Alejandro',     dni: '41578930', departamento: 'Ciencias de la Computación', hrsProyectos: 15, hrsAsesorias: 9,  totalCarga: 24 },
  { id: 'd25', nombre: 'Pacheco Vera, Silvia',      dni: '52689041', departamento: 'Ingeniería de Sistemas',      hrsProyectos: 3,  hrsAsesorias: 2,  totalCarga: 5  },
  { id: 'd26', nombre: 'Rojas Calla, Marco',        dni: '63790152', departamento: 'Ingeniería de Software',      hrsProyectos: 10, hrsAsesorias: 5,  totalCarga: 15 },
  { id: 'd27', nombre: 'Inca Lazo, Teresa',         dni: '74801263', departamento: 'Ciencias de la Computación', hrsProyectos: 6,  hrsAsesorias: 4,  totalCarga: 10 },
  { id: 'd28', nombre: 'Barboza Neira, Hugo',       dni: '85912374', departamento: 'Ingeniería de Sistemas',      hrsProyectos: 13, hrsAsesorias: 7,  totalCarga: 20 },
  { id: 'd29', nombre: 'Saldaña Fuentes, Katia',    dni: '96023485', departamento: 'Ingeniería de Software',      hrsProyectos: 9,  hrsAsesorias: 5,  totalCarga: 14 },
  { id: 'd30', nombre: 'Quispe Condori, Rubén',     dni: '07134596', departamento: 'Ciencias de la Computación', hrsProyectos: 11, hrsAsesorias: 6,  totalCarga: 17 },
];
