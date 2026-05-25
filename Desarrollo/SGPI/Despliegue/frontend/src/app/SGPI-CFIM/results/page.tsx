'use client';

/**
 * @file results/page.tsx
 * @route /SGPI-CFIM/results
 * @description Pantalla de resumen tras confirmar la importación masiva.
 *
 * Muestra:
 * - Ícono de check verde
 * - Título "Importación Completada Exitosamente"
 * - Subtítulo explicativo de deduplicación
 * - 3 tarjetas: Nuevos insertados | Actualizados | Omitidos / Con error
 * - Botones: "Descargar Log de Errores (.txt)" | "Volver al Panel de Inicio"
 */

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/SGPI-CFU/components/layout';
import { Button } from '@/SGPI-CFU/components/ui';

// ─────────────────────────────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────────────────────────────

interface ImportResults {
  entity: string;
  fileName: string;
  nuevos: number;
  actualizados: number;
  errores: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Íconos
// ─────────────────────────────────────────────────────────────────────────────

function CheckCircleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="64" height="64"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#059669"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14" height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tarjeta de estadística
// ─────────────────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number;
  variant: 'neutral' | 'info' | 'error';
  footnote?: string;
}

function StatCard({ label, value, variant, footnote }: StatCardProps) {
  const styles = {
    neutral: {
      wrapper: 'bg-surface-container-lowest border-outline-variant',
      label: 'text-on-surface-variant',
      value: 'text-on-surface',
    },
    info: {
      wrapper: 'bg-surface-container-lowest border-outline-variant',
      label: 'text-[#1d4ed8]',
      value: 'text-[#1d4ed8]',
    },
    error: {
      wrapper: 'bg-[#fff1f1] border-[#fca5a5]',
      label: 'text-error',
      value: 'text-error',
    },
  }[variant];

  return (
    <div className={`
      flex-1
      flex flex-col items-center justify-center
      gap-1 px-6 py-7
      rounded border
      ${styles.wrapper}
    `}>
      <span className={`
        font-sans font-bold text-[10px] uppercase tracking-widest text-center
        ${styles.label}
      `}>
        {label}
      </span>
      <span className={`
        font-heading font-bold leading-none
        text-[48px]
        ${styles.value}
      `}>
        {value}
      </span>
      {footnote && (
        <span className={`font-sans text-[11px] text-center mt-0.5 ${styles.label}`}>
          {footnote}
        </span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Página
// ─────────────────────────────────────────────────────────────────────────────

export default function ImportResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState<ImportResults | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('import_results');
    if (raw) {
      try { setResults(JSON.parse(raw)); } catch { /* ignore */ }
    }
  }, []);

  const nuevos = results?.nuevos ?? 120;
  const actualizados = results?.actualizados ?? 28;
  const errores = results?.errores ?? 2;

  const handleDownloadLog = () => {
    // TODO: descargar el log real del backend
    const content = `Log de importación\nRegistros con error: ${errores}\n--- Detalle ---\n(Sin errores en este demo)`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'log_importacion_RAIS.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleGoHome = () => {
    localStorage.removeItem('import_results');
    localStorage.removeItem('import_meta');
    router.push('/SGPI-CFIM');
  };

  return (
    <MainLayout title="Sistema de Gestión de Proyectos de Investigación">

      {/* ── Contenido centrado ───────────────────────────────────────────────── */}
      <div className="flex flex-col items-center justify-start pt-10 w-full">

        {/* ── Ícono check ─────────────────────────────────────────────────────── */}
        <div className="mb-4">
          <CheckCircleIcon />
        </div>

        {/* ── Título ──────────────────────────────────────────────────────────── */}
        <h1 className="font-heading font-bold text-[28px] text-on-surface text-center leading-[36px] mb-2">
          Importación Completada Exitosamente
        </h1>

        {/* ── Subtítulo ───────────────────────────────────────────────────────── */}
        <p className="font-sans text-body-md text-on-surface-variant text-center max-w-[440px] mb-10">
          La base de datos del SGPI se ha actualizado aplicando la lógica de
          deduplicación para evitar registros repetidos.
        </p>

        {/* ── Tarjetas de estadísticas ─────────────────────────────────────────── */}
        <div className="flex items-stretch gap-4 w-full max-w-[680px] mb-10">
          <StatCard
            label="Registros Nuevos Insertados"
            value={nuevos}
            variant="neutral"
          />
          <StatCard
            label="Registros Actualizados"
            value={actualizados}
            variant="info"
            footnote="Información sincronía actualizada"
          />
          <StatCard
            label="Registros Omitidos / Con Error"
            value={errores}
            variant="error"
          />
        </div>

        {/* ── Botones de acción ────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          {errores > 0 && (
            <Button
              id="btn-descargar-log"
              variant="secondary"
              size="md"
              iconLeft={<DownloadIcon />}
              onClick={handleDownloadLog}
              aria-label="Descargar log de errores en formato txt"
            >
              Descargar Log de Errores (.txt)
            </Button>
          )}

          <Button
            id="btn-volver-inicio"
            variant="primary"
            size="md"
            onClick={handleGoHome}
            aria-label="Volver al módulo de importación"
          >
            Volver al Panel de Inicio
          </Button>
        </div>

      </div>

    </MainLayout>
  );
}
