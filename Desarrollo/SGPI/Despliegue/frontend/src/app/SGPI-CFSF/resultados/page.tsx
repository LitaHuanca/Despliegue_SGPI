'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/SGPI-CFU/components/layout';
import { PageHeader } from '@/SGPI-CFU/components/shared';
import { Button } from '@/SGPI-CFU/components/ui';
import { ExportFlow } from '@/SGPI-CFU/components/SGPI-CFE/export/ExportFlow';

// ─── Datos del log de sincronización ─────────────────────────────────────────

const SYNC_LOGS = [
  { level: 'INFO',    time: '14:02:10', text: 'Iniciando conector CYBERTESIS...' },
  { level: 'INFO',    time: '14:02:15', text: "Descargando metadatos de Tesis: 'Aplicación de OCR...'" },
  { level: 'SUCCESS', time: '14:02:18', text: "Vinculando Asesor: 'Perez Silva, Juan' → DNI Encontrado." },
  { level: 'WARNING', time: '14:02:22', text: 'OCR Fallido: PDF protegido. Requiere revisión manual.' },
  { level: 'INFO',    time: '14:02:30', text: "Evaluando ciclos RAIS: 3 proyectos pasaron a 'En Deuda' (Mes 12 superado)." },
  { level: 'SUCCESS', time: '14:02:36', text: 'Sincronización Global Completada.' },
];

const LOG_STYLE: Record<string, { label: string; color: string }> = {
  INFO:    { label: 'INFO',    color: 'text-sky-400'     },
  SUCCESS: { label: 'SUCCESS', color: 'text-emerald-400' },
  WARNING: { label: 'WARNING', color: 'text-amber-400'   },
  ERROR:   { label: 'ERROR',   color: 'text-red-400'     },
};

// ─── Datos del resumen de acciones ───────────────────────────────────────────

type EstadoAccion = 'Vinculado' | 'Cambio Estado' | 'Pendiente';

interface AccionResumen {
  tipo:     string;
  fuente:   string;
  estado:   EstadoAccion;
  docente:  string;
  detalle:  string;
}

const ACCIONES: AccionResumen[] = [
  {
    tipo:    'Tesis Sustentada',
    fuente:  'Cybertesis',
    estado:  'Vinculado',
    docente: 'Torres Mallma S.',
    detalle: 'Tesis de Pregrado añadida al historial',
  },
  {
    tipo:    'Proyecto',
    fuente:  'RAIS / VRIP',
    estado:  'Cambio Estado',
    docente: 'N/A',
    detalle: 'Estado cambiado a En Deuda (Plazo >12 meses)',
  },
  {
    tipo:    'Perfil',
    fuente:  'RENACYT',
    estado:  'Pendiente',
    docente: 'No identificado',
    detalle: 'Requiere validación manual de DNI',
  },
];

const ESTADO_BADGE: Record<EstadoAccion, { bg: string; dot: string; text: string }> = {
  'Vinculado':    { bg: 'bg-emerald-50', dot: 'bg-emerald-500', text: 'text-emerald-700' },
  'Cambio Estado':{ bg: 'bg-red-50',     dot: 'bg-red-500',     text: 'text-red-700'     },
  'Pendiente':    { bg: 'bg-amber-50',   dot: 'bg-amber-500',   text: 'text-amber-700'   },
};

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function EstadoAccionBadge({ estado }: { estado: EstadoAccion }) {
  const s = ESTADO_BADGE[estado];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {estado}
    </span>
  );
}

// Ícono descarga
const DownloadIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

// Ícono flecha derecha
const ArrowRightIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

// Puntos decorativos del panel (estilo macOS)
const TerminalDots = () => (
  <div className="flex items-center gap-1.5">
    <span className="w-3 h-3 rounded-full bg-red-500 opacity-80" />
    <span className="w-3 h-3 rounded-full bg-amber-500 opacity-80" />
    <span className="w-3 h-3 rounded-full bg-emerald-500 opacity-80" />
  </div>
);

// ─── Página ───────────────────────────────────────────────────────────────────

export default function ResultadosSincronizacionPage() {
  const router = useRouter();
  const [isExportOpen, setIsExportOpen] = useState(false);

  return (
    <MainLayout
      title="Sistema de Gestión de Proyectos de Investigación"
      subtitle=""
    >
      {/* ── Encabezado ───────────────────────────────────────────────────── */}
      <PageHeader
        title="Resultados de Sincronización"
        description="Se ha actualizado el ciclo de vida y la vinculación de proyectos."
        noBorder
      />

      {/* ── Terminal de log ──────────────────────────────────────────────── */}
      <div className="rounded border border-[#334155] overflow-hidden shadow-md mb-6">
        {/* Barra superior del terminal */}
        <div className="bg-[#1e293b] px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* Ícono monitor */}
            <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            <span className="font-mono text-[11px] font-bold tracking-widest uppercase text-slate-400">
              System Sync Log
            </span>
          </div>
          <TerminalDots />
        </div>

        {/* Contenido del log */}
        <div className="bg-[#0f172a] px-5 py-5 font-mono text-[12.5px] leading-7 space-y-0.5 min-h-[200px]">
          {SYNC_LOGS.map((log, i) => {
            const s = LOG_STYLE[log.level] ?? { label: log.level, color: 'text-slate-400' };
            return (
              <div key={i} className="flex gap-0">
                {/* Nivel */}
                <span className={`shrink-0 font-bold ${s.color}`}>[{s.label}]</span>
                {/* Tiempo */}
                <span className="text-slate-500 shrink-0 mx-2">{log.time}</span>
                {/* Mensaje */}
                <span className={i === SYNC_LOGS.length - 1 ? 'text-emerald-400 font-semibold' : i === 3 ? 'text-amber-300' : 'text-slate-300'}>
                  {log.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Resumen de Acciones ──────────────────────────────────────────── */}
      <div className="bg-white border border-[#e2e8f0] rounded shadow-sm mb-6 overflow-hidden">
        {/* Header de la tabla */}
        <div className="px-5 py-3.5 border-b border-[#e2e8f0]">
          <span className="font-heading font-semibold text-[15px] text-on-surface">
            Resumen de Acciones
          </span>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                {['Tipo de Elemento', 'Fuente', 'Estado de Acción', 'Docente Vinculado', 'Detalle'].map((col) => (
                  <th
                    key={col}
                    className="px-5 py-3 text-left font-sans text-[11px] font-bold tracking-[0.06em] uppercase text-on-surface-variant"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {ACCIONES.map((accion, i) => (
                <tr key={i} className="hover:bg-[#f8fafc] transition-colors">
                  <td className="px-5 py-3.5 font-sans text-body-sm text-on-surface font-medium">
                    {accion.tipo}
                  </td>
                  <td className="px-5 py-3.5 font-sans text-body-sm text-on-surface-variant">
                    {accion.fuente}
                  </td>
                  <td className="px-5 py-3.5">
                    <EstadoAccionBadge estado={accion.estado} />
                  </td>
                  <td className="px-5 py-3.5 font-sans text-body-sm text-on-surface-variant">
                    {accion.docente}
                  </td>
                  <td className="px-5 py-3.5 font-sans text-body-sm text-on-surface-variant">
                    {accion.detalle}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Acciones ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-3">
        <Button
          variant="secondary"
          size="md"
          iconLeft={<DownloadIcon />}
          onClick={() => setIsExportOpen(true)}
        >
          Descargar Reporte PDF
        </Button>
        <Button
          variant="primary"
          size="md"
          iconRight={<ArrowRightIcon />}
          onClick={() => router.push('/SGPI-CFSF')}
        >
          Volver al Panel
        </Button>
      </div>

      {/* Modal de exportación */}
      {isExportOpen && (
        <ExportFlow
          context="reporte_sincronizacion"
          onClose={() => setIsExportOpen(false)}
        />
      )}
    </MainLayout>
  );
}
