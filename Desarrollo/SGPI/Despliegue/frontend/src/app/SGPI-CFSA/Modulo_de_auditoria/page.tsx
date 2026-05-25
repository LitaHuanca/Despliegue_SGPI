'use client';

/**
 * @file page.tsx
 * @route /SGPI-CFSA/Modulo_de_auditoria
 * @description Pantalla "Auditoría de Logs" del módulo de Configuración del Sistema.
 *
 * - Filtros sin valor inicial (fechas vacías, todos los eventos)
 * - Botón "Filtrar" alineado a la derecha de la barra de filtros
 * - Click en fila → modal de detalle con JSON del log
 *
 * Permisos: Solo rol admin.
 */

import React, { useState, useMemo } from 'react';
import { MainLayout } from '@/SGPI-CFU/components/layout';
import { PageHeader }  from '@/SGPI-CFU/components/shared';

// ─────────────────────────────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────────────────────────────

type EventoTipo =
  | 'SESION_LOGIN'
  | 'SESION_LOGOUT'
  | 'SYNC_VRIP'
  | 'IMPORT_DATA'
  | 'CONFIG_CHANGE'
  | 'USER_CREATE'
  | 'USER_UPDATE';

type EstadoLog = 'EXITO' | 'FALLO' | 'ADVERTENCIA';

interface LogEntry {
  id:          string;
  fechaHora:   string; // ISO 8601
  evento:      EventoTipo;
  usuario:     string;
  estado:      EstadoLog;
  /** Detalle JSON que se muestra en el modal */
  detail:      object;
}

// ─────────────────────────────────────────────────────────────────────────────
// Datos mock — incluye 2 nuevos registros de muestra recientes
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_LOGS: LogEntry[] = [
  {
    id: '8', fechaHora: '2026-05-07T14:02:00', evento: 'SESION_LOGIN', usuario: 'adm_acueva', estado: 'EXITO',
    detail: {
      timestamp:  '2026-05-07T14:02:00.000Z',
      event_type: 'SESION_LOGIN',
      actor:      'adm_acueva',
      ip_address: '192.168.1.45',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      status:     'SUCCESS',
      session_id: 'sess_8f3a2b1c9d4e',
    },
  },
  {
    id: '9', fechaHora: '2026-05-07T10:15:00', evento: 'SYNC_VRIP', usuario: 'SISTEMA', estado: 'FALLO',
    detail: {
      timestamp:    '2026-05-07T10:15:22.451Z',
      event_type:   'SYNC_VRIP',
      actor:        'CRON_JOB_AUTOMATED',
      source_url:   'https://vrip.unmsm.edu.pe/conv...',
      status:       'FAILED',
      error_trace: {
        code:    'ECONNRESET',
        message: 'Read timeout after 30s',
        stack:   'Error: socket hang up at conn...',
      },
      records_processed: 0,
    },
  },
  { id: '1', fechaHora: '2024-05-07T14:42:00', evento: 'SESION_LOGIN',  usuario: 'adm_acueva',  estado: 'EXITO',
    detail: { timestamp: '2024-05-07T14:42:00.000Z', event_type: 'SESION_LOGIN',  actor: 'adm_acueva',  status: 'SUCCESS', ip_address: '10.0.0.12' } },
  { id: '2', fechaHora: '2024-05-07T10:15:00', evento: 'SYNC_VRIP',     usuario: 'SISTEMA',      estado: 'FALLO',
    detail: { timestamp: '2024-05-07T10:15:00.000Z', event_type: 'SYNC_VRIP',     actor: 'SISTEMA',      status: 'FAILED',  records_processed: 0 } },
  { id: '3', fechaHora: '2024-05-06T17:33:00', evento: 'CONFIG_CHANGE', usuario: 'adm_acueva',  estado: 'EXITO',
    detail: { timestamp: '2024-05-06T17:33:00.000Z', event_type: 'CONFIG_CHANGE', actor: 'adm_acueva',  status: 'SUCCESS', changed_fields: ['frecuencia_sync', 'alerta_roja'] } },
  { id: '4', fechaHora: '2024-05-06T09:05:00', evento: 'IMPORT_DATA',   usuario: 'sec_mlopez',  estado: 'EXITO',
    detail: { timestamp: '2024-05-06T09:05:00.000Z', event_type: 'IMPORT_DATA',   actor: 'sec_mlopez',  status: 'SUCCESS', records_imported: 142 } },
  { id: '5', fechaHora: '2024-05-05T16:20:00', evento: 'USER_CREATE',   usuario: 'adm_acueva',  estado: 'EXITO',
    detail: { timestamp: '2024-05-05T16:20:00.000Z', event_type: 'USER_CREATE',   actor: 'adm_acueva',  status: 'SUCCESS', new_user: 'inv_rdiaz' } },
  { id: '6', fechaHora: '2024-05-05T11:48:00', evento: 'SESION_LOGIN',  usuario: 'sec_mlopez',  estado: 'ADVERTENCIA',
    detail: { timestamp: '2024-05-05T11:48:00.000Z', event_type: 'SESION_LOGIN',  actor: 'sec_mlopez',  status: 'WARNING', reason: 'Unusual IP location' } },
  { id: '7', fechaHora: '2024-05-04T08:00:00', evento: 'SYNC_VRIP',     usuario: 'SISTEMA',      estado: 'EXITO',
    detail: { timestamp: '2024-05-04T08:00:00.000Z', event_type: 'SYNC_VRIP',     actor: 'SISTEMA',      status: 'SUCCESS', records_processed: 38 } },
];

const TIPO_EVENTO_OPTIONS = [
  { label: 'Todos los eventos',       value: '' },
  { label: 'Sincronización VRIP',     value: 'SYNC_VRIP' },
  { label: 'Inicio de sesión',        value: 'SESION_LOGIN' },
  { label: 'Cierre de sesión',        value: 'SESION_LOGOUT' },
  { label: 'Importación de datos',    value: 'IMPORT_DATA' },
  { label: 'Cambio de configuración', value: 'CONFIG_CHANGE' },
  { label: 'Creación de usuario',     value: 'USER_CREATE' },
  { label: 'Edición de usuario',      value: 'USER_UPDATE' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatFechaHora(iso: string): string {
  const d   = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function inputDateToDate(yyyymmdd: string): Date | null {
  if (!yyyymmdd) return null;
  const [yyyy, mm, dd] = yyyymmdd.split('-');
  if (!yyyy || !mm || !dd) return null;
  const d = new Date(`${yyyy}-${mm}-${dd}T00:00:00`);
  return isNaN(d.getTime()) ? null : d;
}

/** Colorea sintaxis JSON básica: claves en verde claro, strings en verde, números en amarillo */
function syntaxHighlight(json: string): string {
  return json
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        if (/^"/.test(match)) {
          if (/:$/.test(match)) return `<span style="color:#67e8f9">${match}</span>`; // clave
          return `<span style="color:#4ade80">${match}</span>`;  // string value
        }
        if (/true|false/.test(match)) return `<span style="color:#fb923c">${match}</span>`;
        if (/null/.test(match))        return `<span style="color:#94a3b8">${match}</span>`;
        return `<span style="color:#fbbf24">${match}</span>`; // número
      },
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Subcomponente: Badge de estado
// ─────────────────────────────────────────────────────────────────────────────

function EstadoBadge({ estado }: { estado: EstadoLog }) {
  const styles: Record<EstadoLog, string> = {
    EXITO:       'text-[#4ade80]',
    FALLO:       'text-[#f87171]',
    ADVERTENCIA: 'text-[#fbbf24]',
  };
  const labels: Record<EstadoLog, string> = {
    EXITO:       'ÉXITO',
    FALLO:       'FALLO',
    ADVERTENCIA: 'ADVERTENCIA',
  };
  return (
    <span className={`font-sans font-semibold text-[12px] tracking-wide ${styles[estado]}`}>
      {labels[estado]}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Subcomponente: Input de fecha
// ─────────────────────────────────────────────────────────────────────────────

function DateInput({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
  return (
    <input
      id={id}
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="
        h-8 px-2 w-[130px]
        font-sans text-[13px] text-[#0f172a]
        bg-white border border-[#cbd5e1] rounded
        outline-none
        focus:ring-2 focus:ring-[#a8c8fa] focus:border-[#a8c8fa]
        transition-all
      "
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Subcomponente: Modal de detalle de log
// ─────────────────────────────────────────────────────────────────────────────

interface LogDetailModalProps {
  log:     LogEntry;
  onClose: () => void;
}

function LogDetailModal({ log, onClose }: LogDetailModalProps) {
  const jsonStr  = JSON.stringify(log.detail, null, 2);
  const htmlJson = syntaxHighlight(jsonStr);

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Detalle del log ${log.id}`}
    >
      {/* Panel */}
      <div
        className="
          relative w-full max-w-[600px] mx-4
          bg-[#0f172a] border border-[#1e3a5f]
          rounded-lg shadow-2xl
          flex flex-col
          overflow-hidden
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Cabecera del modal ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1e3a5f]">
          <div className="flex items-center gap-2.5">
            {/* Ícono terminal */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" />
            </svg>
            <span className="font-mono font-bold text-[13px] text-white tracking-wide uppercase">
              LOG_DETAIL: ID_{log.id.padStart(5, '0').replace(/^0+/, '') || '0'}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar detalle"
            className="
              flex items-center justify-center w-6 h-6 rounded
              text-[#64748b] hover:text-white hover:bg-[#1e293b]
              transition-colors duration-100
            "
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* ── Cuerpo: JSON coloreado ─────────────────────────────────────── */}
        <div className="px-5 py-4 overflow-y-auto max-h-[420px]">
          <pre
            className="font-mono text-[12.5px] leading-[1.7] text-[#e2e8f0] whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: htmlJson }}
          />
        </div>

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <div className="flex justify-end px-5 py-3 border-t border-[#1e3a5f]">
          <button
            id="btn-cerrar-detalle"
            onClick={onClose}
            className="
              px-4 py-1.5
              bg-[#1e293b] text-[#e2e8f0]
              font-sans font-medium text-[13px] rounded
              hover:bg-[#334155] active:bg-[#475569]
              transition-colors duration-100
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a8c8fa]
            "
          >
            Cerrar Detalle
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Íconos
// ─────────────────────────────────────────────────────────────────────────────

const FilterIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// Página principal
// ─────────────────────────────────────────────────────────────────────────────

export default function AuditoriaDeLogsPage() {
  // ── Filtros — fechas vacías + todos los eventos por defecto ───────────────
  const [fechaDesde,     setFechaDesde]     = useState('');
  const [fechaHasta,     setFechaHasta]     = useState('');
  const [tipoEvento,     setTipoEvento]     = useState('');
  const [appliedFilters, setAppliedFilters] = useState({ desde: '', hasta: '', evento: '' });

  // ── Modal de detalle ──────────────────────────────────────────────────────
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);

  const handleFiltrar = () => {
    setAppliedFilters({ desde: fechaDesde, hasta: fechaHasta, evento: tipoEvento });
  };

  // ── Logs filtrados ────────────────────────────────────────────────────────
  const filteredLogs = useMemo(() => {
    const desde = inputDateToDate(appliedFilters.desde);
    const hasta = inputDateToDate(appliedFilters.hasta);

    return MOCK_LOGS.filter((log) => {
      if (appliedFilters.evento && log.evento !== appliedFilters.evento) return false;
      const logDate = new Date(log.fechaHora);
      if (desde && logDate < desde) return false;
      if (hasta) {
        const hastaFin = new Date(hasta);
        hastaFin.setHours(23, 59, 59, 999);
        if (logDate > hastaFin) return false;
      }
      return true;
    });
  }, [appliedFilters]);

  return (
    <MainLayout
      title="Sistema de Gestión de Proyectos de Investigación"
      subtitle=""
    >
      {/* ── Encabezado ───────────────────────────────────────────────────── */}
      <PageHeader
        title="Auditoría de Logs"
        description="Consulta inmutable de eventos técnicos y sincronizaciones del sistema."
      />

      {/* ── Barra de filtros ─────────────────────────────────────────────── */}
      {/*   flex entre filtros (izquierda) y botón Filtrar (derecha extremo)  */}
      <div className="mb-4 bg-white border border-[#e2e8f0] rounded p-4 flex items-end justify-between gap-4 flex-wrap">

        {/* Filtros agrupados a la izquierda */}
        <div className="flex items-end gap-5 flex-wrap">

          {/* Rango de Fechas */}
          <div className="flex flex-col gap-1.5">
            <span className="font-sans font-bold text-[10px] text-[#64748b] uppercase tracking-widest">
              Rango de Fechas
            </span>
            <div className="flex items-center gap-2">
              <DateInput id="filter-fecha-desde" value={fechaDesde} onChange={setFechaDesde} />
              <span className="font-sans text-[13px] text-[#94a3b8]">–</span>
              <DateInput id="filter-fecha-hasta" value={fechaHasta} onChange={setFechaHasta} />
            </div>
          </div>

          {/* Tipo de Evento */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="filter-tipo-evento"
              className="font-sans font-bold text-[10px] text-[#64748b] uppercase tracking-widest"
            >
              Tipo de Evento
            </label>
            <select
              id="filter-tipo-evento"
              value={tipoEvento}
              onChange={(e) => setTipoEvento(e.target.value)}
              className="
                h-8 px-3 pr-8 w-[200px]
                font-sans text-[13px] text-[#0f172a]
                bg-white border border-[#cbd5e1] rounded
                outline-none appearance-none cursor-pointer
                focus:ring-2 focus:ring-[#a8c8fa] focus:border-[#a8c8fa]
                transition-all
                bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2364748b%22 stroke-width=%222%22><polyline points=%226 9 12 15 18 9%22/></svg>')]
                bg-no-repeat bg-[right_8px_center]
              "
            >
              {TIPO_EVENTO_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Botón Filtrar — empujado al extremo derecho */}
        <button
          id="btn-filtrar-logs"
          onClick={handleFiltrar}
          className="
            inline-flex items-center gap-2 flex-shrink-0
            h-8 px-4
            bg-[#001631] text-white
            font-sans font-medium text-[13px] rounded
            hover:bg-[#002b54] active:bg-[#001229]
            transition-colors duration-100
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#a8c8fa]
          "
        >
          <FilterIcon />
          Filtrar
        </button>
      </div>

      {/* ── Tabla de logs (fondo navy oscuro) ────────────────────────────── */}
      <div className="bg-[#0f172a] rounded overflow-hidden border border-[#1e293b]">

        {/* Cabecera */}
        <div className="grid grid-cols-[2fr_2fr_1.5fr_1fr] px-5 py-2.5 border-b border-[#1e3a5f]">
          {['FECHA/HORA', 'EVENTO', 'USUARIO', 'ESTADO'].map((col) => (
            <span key={col} className="font-sans font-bold text-[10px] text-[#94a3b8] uppercase tracking-widest">
              {col}
            </span>
          ))}
        </div>

        {/* Filas — clicables */}
        {filteredLogs.length === 0 ? (
          <div className="px-5 py-10 text-center font-sans text-[13px] text-[#64748b]">
            No se encontraron registros con los filtros aplicados.
          </div>
        ) : (
          filteredLogs.map((log, idx) => (
            <button
              key={log.id}
              onClick={() => setSelectedLog(log)}
              title="Ver detalle del log"
              className={`
                w-full text-left
                grid grid-cols-[2fr_2fr_1.5fr_1fr]
                px-5 py-[11px]
                border-b border-[#1e293b] last:border-b-0
                transition-colors duration-100 cursor-pointer
                ${idx % 2 === 0 ? 'bg-[#0f172a]' : 'bg-[#111827]'}
                hover:bg-[#1e3a5f]
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#60a5fa]
              `}
            >
              <span className="font-mono text-[12px] text-[#60a5fa] font-medium leading-5">
                {formatFechaHora(log.fechaHora)}
              </span>
              <span className="font-mono text-[12px] text-[#e2e8f0] font-medium leading-5 uppercase tracking-wide">
                {log.evento}
              </span>
              <span className="font-mono text-[12px] text-[#94a3b8] leading-5">
                {log.usuario}
              </span>
              <EstadoBadge estado={log.estado} />
            </button>
          ))
        )}
      </div>

      {/* ── Pie: contador ─────────────────────────────────────────────────── */}
      <div className="mt-2 flex justify-end">
        <span className="font-sans text-[12px] text-[#94a3b8]">
          {filteredLogs.length} registro{filteredLogs.length !== 1 ? 's' : ''} encontrado{filteredLogs.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Modal de detalle de log ───────────────────────────────────────── */}
      {selectedLog && (
        <LogDetailModal
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </MainLayout>
  );
}
