'use client';

/**
 * @file SGPI-CFIM/preview/page.tsx
 * @route /SGPI-CFIM/preview
 * @description Pantalla de progreso y vista previa de importación.
 *
 * Flujo real:
 *  - Lee {entity, fileName, fileSize, jobId} del sessionStorage
 *  - Usa useAsyncJob → polling cada 2s a GET /api/v1/import/{jobId}/status
 *  - Muestra barra de progreso animada mientras status = queued|running
 *  - Al completarse: muestra tabla de previsualización (primeras filas)
 *    y guarda el resumen en sessionStorage para /results
 *  - Al fallar: muestra banner de error con botón de reintentar
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/SGPI-CFU/components/layout';
import { Button, Badge } from '@/SGPI-CFU/components/ui';
import { useAsyncJob } from '@/SGPI-CFU/lib/hooks/useAsyncJob';
import { importEndpoints } from '@/SGPI-CFU/lib/api/endpoints';

// ─────────────────────────────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────────────────────────────

type ImportEntity = 'proyectos' | 'docentes' | 'publicaciones';

interface ImportMeta {
  entity:   ImportEntity;
  fileName: string;
  fileSize: number;
  jobId:    string;
}

const ENTITY_LABELS: Record<ImportEntity, string> = {
  docentes:      'Docentes / Investigadores',
  proyectos:     'Proyectos de Investigación',
  publicaciones: 'Publicaciones / Tesis',
};

// ─────────────────────────────────────────────────────────────────────────────
// Mock data de previsualización (se mostrará una vez completada la carga)
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_DOCENTES = [
  { dni: '70374721', codigoRenacyt: 'P0039101', nombre: 'Rodríguez Saavedra Lennin Roswell',  departamento: 'Ingeniería de Software',      nivel: 'VI',             estado: 'Activo'   },
  { dni: '44749497', codigoRenacyt: 'P0186033', nombre: 'Torres Malima Sally Fernanda',        departamento: 'Ciencias de la Computación', nivel: 'VII',            estado: 'Activo'   },
  { dni: '10293847', codigoRenacyt: 'P0012345', nombre: 'Pérez Silva Juan Carlos',             departamento: 'Sistemas de Información',    nivel: 'No Clasificado', estado: 'Inactivo' },
];
const MOCK_PROYECTOS = [
  { codigo: 'PI-2024-001', titulo: 'Sistemas de detección temprana con IA',               responsable: 'Rodríguez Saavedra Lennin', estado: 'En Ejecución',  anio: '2024', presupuesto: 'S/ 45,000' },
  { codigo: 'PI-2024-002', titulo: 'Análisis de datos climáticos en la Amazonía',         responsable: 'Torres Malima Sally',       estado: 'En Evaluación', anio: '2024', presupuesto: 'S/ 32,500' },
  { codigo: 'PI-2023-015', titulo: 'Modelos predictivos para deserción universitaria',    responsable: 'Pérez Silva Juan Carlos',   estado: 'Concluido',     anio: '2023', presupuesto: 'S/ 28,000' },
];
const MOCK_PUBLICACIONES = [
  { codigo: 'PUB-2024-0112', titulo: 'Deep Learning aplicado al diagnóstico médico',      autor: 'Rodríguez Saavedra Lennin', tipo: 'Artículo ISI',   anio: '2024', estado: 'Publicado'   },
  { codigo: 'TES-2024-0088', titulo: 'Redes neuronales en visión computacional',          autor: 'Torres Malima Sally',        tipo: 'Tesis Doctoral', anio: '2024', estado: 'En revisión' },
  { codigo: 'PUB-2023-0201', titulo: 'Algoritmos genéticos para optimización',            autor: 'Pérez Silva Juan Carlos',   tipo: 'Artículo Scopus', anio: '2023', estado: 'Publicado'  },
];

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

function AlertCircleIcon() {
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
// Helpers de celdas
// ─────────────────────────────────────────────────────────────────────────────

function NivelBadge({ nivel }: { nivel: string }) {
  if (nivel === 'No Clasificado') {
    return (
      <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded bg-[#f1f5f9] text-[#64748b] font-sans font-semibold text-[10px] leading-[14px] border border-[#e2e8f0] whitespace-nowrap">
        No Clasificado
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center w-7 h-7 rounded bg-[#dbeafe] text-[#1d4ed8] font-sans font-bold text-[12px]">
      {nivel}
    </span>
  );
}

function EstadoCell({ estado }: { estado: string }) {
  const isActivo  = ['Activo', 'En Ejecución', 'Publicado'].includes(estado);
  const isWarning = ['En Evaluación', 'En revisión'].includes(estado);
  return (
    <span className={`font-sans font-semibold text-[13px] ${isActivo ? 'text-[#059669]' : isWarning ? 'text-[#d97706]' : 'text-[#64748b]'}`}>
      {estado}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tabla de previsualización
// ─────────────────────────────────────────────────────────────────────────────

function PreviewTable({ entity }: { entity: ImportEntity }) {
  if (entity === 'docentes') {
    return (
      <table className="w-full border-collapse" aria-label="Vista previa de docentes e investigadores">
        <thead>
          <tr className="border-b border-outline-variant bg-surface-container-low">
            {['DNI', 'CÓDIGO RENACYT', 'NOMBRES Y APELLIDOS', 'DEPARTAMENTO ACADÉMICO', 'NIVEL', 'ESTADO'].map((col) => (
              <th key={col} scope="col" className="px-4 py-3 text-left font-sans text-label-caps text-on-surface-variant uppercase tracking-widest whitespace-nowrap">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {MOCK_DOCENTES.map((row, i) => (
            <tr key={row.dni} className={`border-b border-outline-variant last:border-b-0 transition-colors duration-100 ${i % 2 === 0 ? 'bg-surface-container-lowest' : 'bg-surface-container-low/40'} hover:bg-surface-container-low`}>
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

  if (entity === 'proyectos') {
    return (
      <table className="w-full border-collapse" aria-label="Vista previa de proyectos de investigación">
        <thead>
          <tr className="border-b border-outline-variant bg-surface-container-low">
            {['CÓDIGO', 'TÍTULO', 'RESPONSABLE', 'AÑO', 'PRESUPUESTO', 'ESTADO'].map((col) => (
              <th key={col} scope="col" className="px-4 py-3 text-left font-sans text-label-caps text-on-surface-variant uppercase tracking-widest whitespace-nowrap">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {MOCK_PROYECTOS.map((row, i) => (
            <tr key={row.codigo} className={`border-b border-outline-variant last:border-b-0 transition-colors duration-100 ${i % 2 === 0 ? 'bg-surface-container-lowest' : 'bg-surface-container-low/40'} hover:bg-surface-container-low`}>
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

  return (
    <table className="w-full border-collapse" aria-label="Vista previa de publicaciones y tesis">
      <thead>
        <tr className="border-b border-outline-variant bg-surface-container-low">
          {['CÓDIGO', 'TÍTULO', 'AUTOR', 'TIPO', 'AÑO', 'ESTADO'].map((col) => (
            <th key={col} scope="col" className="px-4 py-3 text-left font-sans text-label-caps text-on-surface-variant uppercase tracking-widest whitespace-nowrap">{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {MOCK_PUBLICACIONES.map((row, i) => (
          <tr key={row.codigo} className={`border-b border-outline-variant last:border-b-0 transition-colors duration-100 ${i % 2 === 0 ? 'bg-surface-container-lowest' : 'bg-surface-container-low/40'} hover:bg-surface-container-low`}>
            <td className="px-4 py-3 font-sans text-body-md text-on-surface font-medium whitespace-nowrap">{row.codigo}</td>
            <td className="px-4 py-3 font-sans text-body-md text-on-surface max-w-[260px]">{row.titulo}</td>
            <td className="px-4 py-3 font-sans text-body-md text-on-surface-variant whitespace-nowrap">{row.autor}</td>
            <td className="px-4 py-3"><Badge variant="info" size="sm">{row.tipo}</Badge></td>
            <td className="px-4 py-3 font-sans text-body-md text-on-surface-variant">{row.anio}</td>
            <td className="px-4 py-3"><EstadoCell estado={row.estado} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Barra de progreso animada
// ─────────────────────────────────────────────────────────────────────────────

function ProgressBar({ value, label }: { value: number; label: string }) {
  return (
    <div className="w-full" aria-label={`Progreso: ${value}%`}>
      <div className="flex justify-between items-center mb-1.5">
        <span className="font-sans text-[13px] text-on-surface-variant">{label}</span>
        <span className="font-sans font-semibold text-[13px] text-on-surface">{value}%</span>
      </div>
      <div className="w-full h-2 bg-surface-container-low rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${value}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Página principal
// ─────────────────────────────────────────────────────────────────────────────

export default function ImportPreviewPage() {
  const router = useRouter();
  const [meta, setMeta] = useState<ImportMeta | null>(null);

  // Hook de polling que consulta el status del job
  const { startJob, progress, status, isRunning, isSuccess, error, summary, reset } =
    useAsyncJob((jobId) => importEndpoints.getStatus(jobId));

  // Leer metadatos del sessionStorage e iniciar polling inmediatamente
  useEffect(() => {
    const raw = sessionStorage.getItem('import_meta');
    if (!raw) {
      // Sin metadatos → volver a la pantalla de carga
      router.replace('/SGPI-CFIM');
      return;
    }
    try {
      const parsed: ImportMeta = JSON.parse(raw);
      setMeta(parsed);

      // Iniciar polling del job_id obtenido en la pantalla anterior
      startJob(async () => ({ job_id: parsed.jobId }));
    } catch {
      router.replace('/SGPI-CFIM');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // solo al montar

  // Cuando el job completa, guardar resultados y navegar a /results
  useEffect(() => {
    if (!isSuccess || !meta) return;

    const results = {
      entity:      meta.entity,
      fileName:    meta.fileName,
      nuevos:      (summary as any)?.created   ?? 0,
      actualizados:(summary as any)?.updated   ?? 0,
      errores:     (summary as any)?.errors    ?? 0,
    };
    sessionStorage.setItem('import_results', JSON.stringify(results));
    router.push('/SGPI-CFIM/results');
  }, [isSuccess, summary, meta, router]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleCancel = useCallback(() => {
    reset();
    sessionStorage.removeItem('import_meta');
    router.push('/SGPI-CFIM');
  }, [reset, router]);

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  const entity   = meta?.entity   ?? 'docentes';
  const fileName = meta?.fileName ?? 'archivo.xlsx';

  return (
    <MainLayout title="Sistema de Gestión de Proyectos de Investigación">

      {/* ── Título ──────────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="font-heading font-semibold text-h1 text-on-surface leading-[38px]">
          {isRunning
            ? 'Procesando Importación…'
            : isSuccess
              ? 'Vista Previa de Importación'
              : error
                ? 'Error en la Importación'
                : `Vista Previa de Importación: ${ENTITY_LABELS[entity as ImportEntity]}`
          }
        </h1>
      </div>

      <div className="w-full bg-surface-container-lowest rounded border border-outline-variant shadow-level-1 overflow-hidden">

        {/* ── Estado: Procesando (queued | running) ───────────────────────────── */}
        {isRunning && (
          <div className="px-6 py-10 flex flex-col items-center gap-6">

            {/* Spinner animado */}
            <div className="relative w-16 h-16">
              <svg className="animate-spin" viewBox="0 0 50 50" aria-hidden="true">
                <circle cx="25" cy="25" r="20" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                <circle cx="25" cy="25" r="20" fill="none" stroke="#001631" strokeWidth="4"
                  strokeDasharray="80 45" strokeLinecap="round" />
              </svg>
            </div>

            <div className="text-center">
              <p className="font-sans font-semibold text-[15px] text-on-surface mb-1">
                Procesando «{fileName}»
              </p>
              <p className="font-sans text-[13px] text-on-surface-variant">
                {status === 'queued' ? 'En cola de procesamiento…' : 'Importando registros a la base de datos…'}
              </p>
            </div>

            <div className="w-full max-w-[420px]">
              <ProgressBar
                value={progress}
                label={status === 'queued' ? 'En cola...' : 'Procesando registros...'}
              />
            </div>

            <Button
              id="btn-cancelar-importacion-progreso"
              variant="secondary"
              size="md"
              onClick={handleCancel}
              aria-label="Cancelar y volver a la pantalla de carga"
            >
              Cancelar
            </Button>
          </div>
        )}

        {/* ── Estado: Error ───────────────────────────────────────────────────── */}
        {!isRunning && error && (
          <div className="px-6 py-10 flex flex-col items-center gap-5">
            <div className="flex items-start gap-3 px-5 py-4 bg-[#fff1f1] border border-[#fca5a5] rounded w-full max-w-[520px]">
              <span className="text-error"><AlertCircleIcon /></span>
              <p className="font-sans text-[13px] leading-[20px] text-error">
                <span className="font-bold">Error al procesar la importación.</span>{' '}
                {error}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                id="btn-reintentar"
                variant="primary"
                size="md"
                onClick={handleCancel}
                aria-label="Volver a intentar con otro archivo"
              >
                Intentar con otro archivo
              </Button>
            </div>
          </div>
        )}

        {/* ── Estado: Completado — tabla de preview ───────────────────────────── */}
        {isSuccess && (
          <>
            {/* Banner de éxito */}
            <div className="flex items-start gap-3 px-5 py-4 bg-[#eff6ff] border-b border-[#bfdbfe] text-[#1e40af]">
              <InfoCircleIcon />
              <p className="font-sans text-[13px] leading-[20px]">
                <span className="font-bold">Procesamiento completado.</span>{' '}
                Se han procesado <span className="font-bold">{(summary as any)?.created ?? 0} registros nuevos</span>{' '}
                y <span className="font-bold">{(summary as any)?.updated ?? 0} actualizados</span>{' '}
                del archivo <span className="font-bold">«{fileName}»</span>.
                {(summary as any)?.errors > 0 && (
                  <> Con <span className="font-bold text-[#d97706]">{(summary as any)?.errors} errores</span>.</>
                )}
                {' '}Revise las primeras filas antes de confirmar.
              </p>
            </div>

            {/* Tabla preview */}
            <div className="overflow-x-auto">
              <PreviewTable entity={entity as ImportEntity} />
            </div>

            {/* Pie: contador + acciones */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-outline-variant bg-surface-container-lowest">
              <p className="font-sans text-[13px] text-on-surface-variant italic">
                Mostrando 3 registros de muestra. El proceso ya fue aplicado a la base de datos.
              </p>
              <div className="flex items-center gap-3">
                <Button
                  id="btn-nueva-importacion"
                  variant="secondary"
                  size="md"
                  onClick={handleCancel}
                  aria-label="Iniciar una nueva importación"
                >
                  Nueva importación
                </Button>
                <Button
                  id="btn-ver-resultados"
                  variant="primary"
                  size="md"
                  onClick={() => router.push('/SGPI-CFIM/results')}
                  aria-label="Ver resumen completo de resultados"
                  className="!bg-[#059669] hover:!bg-[#047857] active:!bg-[#065f46]"
                >
                  Ver resumen de resultados
                </Button>
              </div>
            </div>
          </>
        )}

      </div>

    </MainLayout>
  );
}
