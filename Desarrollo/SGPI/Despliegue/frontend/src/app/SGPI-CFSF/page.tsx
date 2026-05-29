'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/SGPI-CFU/components/layout';
import { PageHeader } from '@/SGPI-CFU/components/shared';
import { Button, Select } from '@/SGPI-CFU/components/ui';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type EstadoFuente = 'OPERATIVO' | 'MANTENIMIENTO' | 'ERROR';

interface FuenteExterna {
  id: string;
  nombre: string;
  descripcion: string;
  estado: EstadoFuente;
  ultimaSync: string;
  icon: React.ReactNode;
}

// ─── Datos estáticos ──────────────────────────────────────────────────────────

const FUENTES: FuenteExterna[] = [
  {
    id: 'rais',
    nombre: 'RAIS UNMSM',
    descripcion:
      'Registro de Actividades de Investigación de San Marcos. Extrae proyectos en curso, grupos de investigación e investigadores asociados a la facultad.',
    estado: 'OPERATIVO',
    ultimaSync: 'Hace 2 horas',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
      </svg>
    ),
  },
  {
    id: 'vrip',
    nombre: 'VRIP',
    descripcion:
      'Vicerrectorado de Investigación y Posgrado. Consolida financiamientos, resoluciones rectorales y entregables formales.',
    estado: 'MANTENIMIENTO',
    ultimaSync: 'Hace 3 días',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 22V8l9-6 9 6v14" />
        <path d="M9 22V12h6v10" />
      </svg>
    ),
  },
  {
    id: 'renacyt',
    nombre: 'RENACYT',
    descripcion:
      'Registro Nacional Científico, Tecnológico y de Innovación Tecnológica. Actualiza los niveles de investigadores y producción científica indexada.',
    estado: 'OPERATIVO',
    ultimaSync: 'Ayer 14:30',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    id: 'cybertesis',
    nombre: 'Cybertesis',
    descripcion:
      'Extracción de Tesis y Metadatos Dublin Core del repositorio institucional de la universidad para control de asesorías.',
    estado: 'OPERATIVO',
    ultimaSync: 'Hace 5 horas',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
];

const LOGS = [
  { time: '10:42:01', level: 'INFO',    text: 'RAIS_SYNC_INIT – Iniciando conexión segura con endpoint de UNMSM.' },
  { time: '10:42:35', level: 'INFO',    text: 'DATA_PARSER – Se obtuvieron 492 registros del ciclo 2023-II.' },
  { time: '10:43:12', level: 'SUCCESS', text: 'DB_MERGE – Consolidación completada sin conflictos.' },
  { time: '14:15:00', level: 'WARN',    text: 'VRIP_TIMEOUT – Tiempo de espera agotado conectando a API_REST_VRIP.' },
];

// ─── Sub-componentes ──────────────────────────────────────────────────────────

const ESTADO_CONFIG: Record<EstadoFuente, { label: string; dot: string; text: string }> = {
  OPERATIVO:    { label: 'OPERATIVO',    dot: 'bg-emerald-500', text: 'text-emerald-600' },
  MANTENIMIENTO:{ label: 'MANTENIMIENTO',dot: 'bg-amber-500',   text: 'text-amber-600'  },
  ERROR:        { label: 'ERROR',        dot: 'bg-red-500',     text: 'text-red-600'    },
};

function EstadoBadge({ estado }: { estado: EstadoFuente }) {
  const cfg = ESTADO_CONFIG[estado];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wide ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// Ícono de sincronización
const SyncIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

// Ícono sincronización (flechas circulares)
const SyncTotalIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

// Tarjeta de fuente
function FuenteCard({ fuente }: { fuente: FuenteExterna }) {
  const [syncing, setSyncing] = useState(false);
  const isDisabled = fuente.estado === 'MANTENIMIENTO';

  const handleSync = () => {
    if (isDisabled) return;
    setSyncing(true);
    setTimeout(() => setSyncing(false), 2000);
  };

  return (
    <div className="bg-white border border-[#e2e8f0] rounded p-5 flex flex-col gap-3 shadow-sm">
      {/* Header de la tarjeta */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="text-[#001631]">{fuente.icon}</span>
          <span className="font-heading font-semibold text-[15px] text-on-surface">
            {fuente.nombre}
          </span>
        </div>
        <EstadoBadge estado={fuente.estado} />
      </div>

      {/* Descripción */}
      <p className="font-sans text-body-sm text-on-surface-variant leading-relaxed flex-1">
        {fuente.descripcion}
      </p>

      {/* Footer: última sync + botón */}
      <div className="flex items-center justify-between pt-1 border-t border-[#f1f5f9]">
        <span className="font-sans text-[12px] text-on-surface-variant">
          Última sync: {fuente.ultimaSync}
        </span>
        <Button
          variant={isDisabled ? 'ghost' : 'secondary'}
          size="sm"
          iconLeft={<SyncIcon />}
          loading={syncing}
          disabled={isDisabled}
          onClick={handleSync}
        >
          Sincronizar Fuente
        </Button>
      </div>
    </div>
  );
}

// Color de nivel de log
const LOG_COLORS: Record<string, string> = {
  INFO:    'text-sky-400',
  SUCCESS: 'text-emerald-400',
  WARN:    'text-amber-400',
  ERROR:   'text-red-400',
};

// ─── Página principal ─────────────────────────────────────────────────────────

export default function SincronizacionDeFuentesPage() {
  const [anio, setAnio]       = useState('2024');
  const [escuela, setEscuela] = useState('ingenieria-sistemas');
  const [running, setRunning] = useState(false);
  const router = useRouter();

  const handleEjecutarTotal = () => {
    setRunning(true);
    setTimeout(() => {
      router.push('/SGPI-CFSF/resultados');
    }, 1200);
  };

  return (
    <MainLayout
      title="Sistema de Gestión de Proyectos de Investigación"
      subtitle=""
    >
      {/* ── Encabezado de página ─────────────────────────────────────────── */}
      <PageHeader
        title="Sincronización Global de Fuentes Externas"
        description="Ejecute los motores de extracción para unificar proyectos, actualizar estados (12/36 meses) y consolidar el historial de los investigadores desde las plataformas oficiales."
        noBorder
        actions={
          <Button
            variant="primary"
            size="lg"
            iconLeft={<SyncTotalIcon />}
            loading={running}
            onClick={handleEjecutarTotal}
          >
            Ejecutar Sincronización Total
          </Button>
        }
      />

      {/* ── Parámetros de extracción ─────────────────────────────────────── */}
      <div className="bg-white border border-[#e2e8f0] rounded p-5 shadow-sm mb-6">
        <p className="font-sans text-[11px] font-bold tracking-[0.08em] uppercase text-on-surface-variant mb-4">
          Parámetros de Extracción
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            id="anio-academico"
            label="Año Académico"
            value={anio}
            onChange={(e) => setAnio(e.target.value)}
          >
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
            <option value="2021">2021</option>
          </Select>

          <Select
            id="escuela-academica"
            label="Escuela Académico Profesional"
            value={escuela}
            onChange={(e) => setEscuela(e.target.value)}
          >
            <option value="ingenieria-sistemas">Ingeniería de Sistemas</option>
            <option value="ingenieria-informatica">Ingeniería Informática</option>
            <option value="ingenieria-software">Ingeniería de Software</option>
            <option value="computacion-cientifica">Computación Científica</option>
          </Select>
        </div>
      </div>

      {/* ── Grid de fuentes externas ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {FUENTES.map((fuente) => (
          <FuenteCard key={fuente.id} fuente={fuente} />
        ))}
      </div>

      {/* ── Últimos registros del sistema (log terminal) ─────────────────── */}
      <div className="rounded border border-[#e2e8f0] overflow-hidden shadow-sm">
        {/* Header del panel */}
        <div className="bg-[#1e293b] px-4 py-2.5">
          <span className="font-sans text-[11px] font-bold tracking-[0.08em] uppercase text-slate-400">
            Últimos Registros de Sistema
          </span>
        </div>
        {/* Contenido tipo terminal */}
        <div className="bg-[#0f172a] px-4 py-4 font-mono text-[12px] leading-6 space-y-0.5 min-h-[120px]">
          {LOGS.map((log, i) => (
            <div key={i} className="flex gap-3">
              <span className="text-slate-500 shrink-0">[{log.time}]</span>
              <span className={`shrink-0 font-semibold ${LOG_COLORS[log.level] ?? 'text-slate-400'}`}>
                [{log.level}]
              </span>
              <span className="text-slate-300">{log.text}</span>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
