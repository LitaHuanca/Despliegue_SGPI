'use client';

/**
 * @file preview/page.tsx
 * @route /SGPI-CFIM/preview
 * @description Pantalla de Vista Previa de Importación.
 *
 * Muestra:
 * - Banner de validación exitosa con nombre de archivo y total de registros
 * - Tabla con preview de los primeros registros (columnas según entidad)
 * - Pie: "Mostrando N de M registros"
 * - Botones: "Cancelar y subir otro archivo" | "Confirmar Importación Masiva"
 */

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/SGPI-CFU/components/layout';
import { Button, Badge } from '@/SGPI-CFU/components/ui';

// ─────────────────────────────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────────────────────────────

type ImportEntity = 'proyectos' | 'docentes' | 'publicaciones';

interface ImportMeta {
  entity: ImportEntity;
  fileName: string;
  fileSize: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock data por entidad
// ─────────────────────────────────────────────────────────────────────────────

// ── Docentes / Investigadores ────────────────────────────────────────────────
const MOCK_DOCENTES = [
  {
    dni: '70374721',
    codigoRenacyt: 'P0039101',
    nombre: 'Rodríguez Saavedra Lennin Roswell',
    departamento: 'Ingeniería de Software',
    nivel: 'VI',
    estado: 'Activo',
  },
  {
    dni: '44749497',
    codigoRenacyt: 'P0186033',
    nombre: 'Torres Malima Sally Fernanda',
    departamento: 'Ciencias de la Computación',
    nivel: 'VII',
    estado: 'Activo',
  },
  {
    dni: '10293847',
    codigoRenacyt: 'P0012345',
    nombre: 'Pérez Silva Juan Carlos',
    departamento: 'Sistemas de Información',
    nivel: 'No Clasificado',
    estado: 'Inactivo',
  },
];

// ── Proyectos de Investigación ───────────────────────────────────────────────
const MOCK_PROYECTOS = [
  {
    codigo: 'PI-2024-001',
    titulo: 'Sistemas de detección temprana con IA',
    responsable: 'Rodríguez Saavedra Lennin',
    estado: 'En Ejecución',
    anio: '2024',
    presupuesto: 'S/ 45,000',
  },
  {
    codigo: 'PI-2024-002',
    titulo: 'Análisis de datos climáticos en la Amazonía',
    responsable: 'Torres Malima Sally',
    estado: 'En Evaluación',
    anio: '2024',
    presupuesto: 'S/ 32,500',
  },
  {
    codigo: 'PI-2023-015',
    titulo: 'Modelos predictivos para deserción universitaria',
    responsable: 'Pérez Silva Juan Carlos',
    estado: 'Concluido',
    anio: '2023',
    presupuesto: 'S/ 28,000',
  },
];

// ── Publicaciones / Tesis ────────────────────────────────────────────────────
const MOCK_PUBLICACIONES = [
  {
    codigo: 'PUB-2024-0112',
    titulo: 'Deep Learning aplicado al diagnóstico médico por imágenes',
    autor: 'Rodríguez Saavedra Lennin',
    tipo: 'Artículo ISI',
    anio: '2024',
    estado: 'Publicado',
  },
  {
    codigo: 'TES-2024-0088',
    titulo: 'Impacto de las redes neuronales en visión computacional',
    autor: 'Torres Malima Sally',
    tipo: 'Tesis Doctoral',
    anio: '2024',
    estado: 'En revisión',
  },
  {
    codigo: 'PUB-2023-0201',
    titulo: 'Algoritmos genéticos para optimización multi-objetivo',
    autor: 'Pérez Silva Juan Carlos',
    tipo: 'Artículo Scopus',
    anio: '2023',
    estado: 'Publicado',
  },
];

const TOTAL_REGISTROS: Record<ImportEntity, number> = {
  docentes: 150,
  proyectos: 87,
  publicaciones: 214,
};

const ENTITY_LABELS: Record<ImportEntity, string> = {
  docentes: 'Docentes / Investigadores',
  proyectos: 'Proyectos de Investigación',
  publicaciones: 'Publicaciones / Tesis',
};

// ─────────────────────────────────────────────────────────────────────────────
// Íconos
// ─────────────────────────────────────────────────────────────────────────────

function InfoCircleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
      viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" className="flex-shrink-0 mt-px">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers de nivel (badges coloreados)
// ─────────────────────────────────────────────────────────────────────────────

function NivelBadge({ nivel }: { nivel: string }) {
  if (nivel === 'No Clasificado') {
    return (
      <span className="
        inline-flex items-center justify-center
        px-1.5 py-0.5 rounded
        bg-[#f1f5f9] text-[#64748b]
        font-sans font-semibold text-[10px] leading-[14px]
        border border-[#e2e8f0]
        whitespace-nowrap
      ">
        No Clasificado
      </span>
    );
  }
  return (
    <span className="
      inline-flex items-center justify-center
      w-7 h-7 rounded
      bg-[#dbeafe] text-[#1d4ed8]
      font-sans font-bold text-[12px]
    ">
      {nivel}
    </span>
  );
}

function EstadoCell({ estado }: { estado: string }) {
  const isActivo = estado === 'Activo' || estado === 'En Ejecución' || estado === 'Publicado';
  const isWarning = estado === 'En Evaluación' || estado === 'En revisión';
  return (
    <span className={`
      font-sans font-semibold text-[13px]
      ${isActivo ? 'text-[#059669]'
        : isWarning ? 'text-[#d97706]'
          : 'text-[#64748b]'}
    `}>
      {estado}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tabla dinámica según entidad
// ─────────────────────────────────────────────────────────────────────────────

function PreviewTable({ entity }: { entity: ImportEntity }) {
  // ── Docentes ────────────────────────────────────────────────────────────────
  if (entity === 'docentes') {
    return (
      <table className="w-full border-collapse" aria-label="Vista previa de docentes e investigadores">
        <thead>
          <tr className="border-b border-outline-variant bg-surface-container-low">
            {['DNI', 'CÓDIGO RENACYT', 'NOMBRES Y APELLIDOS', 'DEPARTAMENTO ACADÉMICO', 'NIVEL', 'ESTADO VIGENCIA'].map((col) => (
              <th key={col} scope="col" className="
                px-4 py-3 text-left
                font-sans text-label-caps text-on-surface-variant
                uppercase tracking-widest whitespace-nowrap
              ">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {MOCK_DOCENTES.map((row, i) => (
            <tr key={row.dni} className={`
              border-b border-outline-variant last:border-b-0
              transition-colors duration-100
              ${i % 2 === 0 ? 'bg-surface-container-lowest' : 'bg-surface-container-low/40'}
              hover:bg-surface-container-low
            `}>
              <td className="px-4 py-3 font-sans text-body-md text-on-surface font-medium whitespace-nowrap">{row.dni}</td>
              <td className="px-4 py-3 font-sans text-body-md text-on-surface-variant whitespace-nowrap">{row.codigoRenacyt}</td>
              <td className="px-4 py-3 font-sans text-body-md text-on-surface">{row.nombre}</td>
              <td className="px-4 py-3 font-sans text-body-md text-on-surface-variant">{row.departamento}</td>
              <td className="px-4 py-3"><NivelBadge nivel={row.nivel} /></td>
              <td className="px-4 py-3"><EstadoCell estado={row.estado} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  // ── Proyectos ────────────────────────────────────────────────────────────────
  if (entity === 'proyectos') {
    return (
      <table className="w-full border-collapse" aria-label="Vista previa de proyectos de investigación">
        <thead>
          <tr className="border-b border-outline-variant bg-surface-container-low">
            {['CÓDIGO', 'TÍTULO', 'RESPONSABLE', 'AÑO', 'PRESUPUESTO', 'ESTADO'].map((col) => (
              <th key={col} scope="col" className="
                px-4 py-3 text-left
                font-sans text-label-caps text-on-surface-variant
                uppercase tracking-widest whitespace-nowrap
              ">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {MOCK_PROYECTOS.map((row, i) => (
            <tr key={row.codigo} className={`
              border-b border-outline-variant last:border-b-0
              transition-colors duration-100
              ${i % 2 === 0 ? 'bg-surface-container-lowest' : 'bg-surface-container-low/40'}
              hover:bg-surface-container-low
            `}>
              <td className="px-4 py-3 font-sans text-body-md text-on-surface font-medium whitespace-nowrap">{row.codigo}</td>
              <td className="px-4 py-3 font-sans text-body-md text-on-surface max-w-[260px]">{row.titulo}</td>
              <td className="px-4 py-3 font-sans text-body-md text-on-surface-variant whitespace-nowrap">{row.responsable}</td>
              <td className="px-4 py-3 font-sans text-body-md text-on-surface-variant">{row.anio}</td>
              <td className="px-4 py-3 font-sans text-body-md text-on-surface-variant whitespace-nowrap">{row.presupuesto}</td>
              <td className="px-4 py-3"><EstadoCell estado={row.estado} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  // ── Publicaciones / Tesis ────────────────────────────────────────────────────
  return (
    <table className="w-full border-collapse" aria-label="Vista previa de publicaciones y tesis">
      <thead>
        <tr className="border-b border-outline-variant bg-surface-container-low">
          {['CÓDIGO', 'TÍTULO', 'AUTOR', 'TIPO', 'AÑO', 'ESTADO'].map((col) => (
            <th key={col} scope="col" className="
              px-4 py-3 text-left
              font-sans text-label-caps text-on-surface-variant
              uppercase tracking-widest whitespace-nowrap
            ">{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {MOCK_PUBLICACIONES.map((row, i) => (
          <tr key={row.codigo} className={`
            border-b border-outline-variant last:border-b-0
            transition-colors duration-100
            ${i % 2 === 0 ? 'bg-surface-container-lowest' : 'bg-surface-container-low/40'}
            hover:bg-surface-container-low
          `}>
            <td className="px-4 py-3 font-sans text-body-md text-on-surface font-medium whitespace-nowrap">{row.codigo}</td>
            <td className="px-4 py-3 font-sans text-body-md text-on-surface max-w-[260px]">{row.titulo}</td>
            <td className="px-4 py-3 font-sans text-body-md text-on-surface-variant whitespace-nowrap">{row.autor}</td>
            <td className="px-4 py-3">
              <Badge variant="info" size="sm">{row.tipo}</Badge>
            </td>
            <td className="px-4 py-3 font-sans text-body-md text-on-surface-variant">{row.anio}</td>
            <td className="px-4 py-3"><EstadoCell estado={row.estado} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Página
// ─────────────────────────────────────────────────────────────────────────────

export default function ImportPreviewPage() {
  const router = useRouter();
  const [meta, setMeta] = useState<ImportMeta | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem('import_meta');
    if (raw) {
      try { setMeta(JSON.parse(raw)); } catch { /* ignore */ }
    }
  }, []);

  const entity = meta?.entity ?? 'docentes';
  const fileName = meta?.fileName ?? 'archivo_RAIS.csv';
  const total = TOTAL_REGISTROS[entity as ImportEntity] ?? 0;
  const preview = entity === 'docentes'
    ? MOCK_DOCENTES.length
    : entity === 'proyectos'
      ? MOCK_PROYECTOS.length
      : MOCK_PUBLICACIONES.length;

  const handleCancel = () => {
    localStorage.removeItem('import_meta');
    router.push('/SGPI-CFIM');
  };

  const handleConfirm = async () => {
    setIsConfirming(true);
    // TODO: llamar POST /api/v1/import/confirm con el job_id
    await new Promise((r) => setTimeout(r, 1500));
    setIsConfirming(false);
    // Guardar resultados mock para la pantalla de resumen
    localStorage.setItem('import_results', JSON.stringify({
      entity: entity,
      fileName: fileName,
      nuevos: 120,
      actualizados: 28,
      errores: 2,
    }));
    router.push('/SGPI-CFIM/results');
  };

  return (
    <MainLayout title="Sistema de Gestión de Proyectos de Investigación">

      {/* ── Título ──────────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="font-heading font-semibold text-h1 text-on-surface leading-[38px]">
          Vista Previa de Importación: {ENTITY_LABELS[entity as ImportEntity]}
        </h1>
      </div>

      {/* ── Contenedor principal — ocupa todo el ancho disponible ────────────── */}
      <div className="w-full bg-surface-container-lowest rounded border border-outline-variant shadow-level-1 overflow-hidden">

        {/* ── Banner de validación exitosa ───────────────────────────────────── */}
        <div className="
          flex items-start gap-3
          px-5 py-4
          bg-[#eff6ff] border-b border-[#bfdbfe]
          text-[#1e40af]
        ">
          <InfoCircleIcon />
          <p className="font-sans text-[13px] leading-[20px]">
            <span className="font-bold">Validación exitosa.</span>{' '}
            Se han detectado{' '}
            <span className="font-bold">{total} registros válidos</span>{' '}
            en el archivo <span className="font-bold">«{fileName}»</span>.
            {' '}Por favor, revise las primeras filas antes de ejecutar
            la actualización en la base de datos.
          </p>
        </div>

        {/* ── Tabla de previsualización ──────────────────────────────────────── */}
        <div className="overflow-x-auto">
          <PreviewTable entity={entity as ImportEntity} />
        </div>

        {/* ── Pie: contador + acciones ───────────────────────────────────────── */}
        <div className="
          flex items-center justify-between
          px-5 py-4
          border-t border-outline-variant
          bg-surface-container-lowest
        ">
          <p className="font-sans text-[13px] text-on-surface-variant italic">
            Mostrando {preview} de {total} registros.
          </p>

          <div className="flex items-center gap-3">
            <Button
              id="btn-cancelar-importacion"
              variant="secondary"
              size="md"
              onClick={handleCancel}
              aria-label="Cancelar importación y subir otro archivo"
            >
              Cancelar y subir otro archivo
            </Button>

            <Button
              id="btn-confirmar-importacion"
              variant="primary"
              size="md"
              loading={isConfirming}
              onClick={handleConfirm}
              aria-label="Confirmar importación masiva"
              className="!bg-[#059669] hover:!bg-[#047857] active:!bg-[#065f46]"
            >
              Confirmar Importación Masiva
            </Button>
          </div>
        </div>

      </div>

    </MainLayout>
  );
}
