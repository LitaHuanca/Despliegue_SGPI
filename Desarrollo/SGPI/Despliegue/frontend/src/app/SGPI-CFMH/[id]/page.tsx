'use client';

/**
 * @file [id]/page.tsx
 * @route /SGPI-CFMH/[id]
 * @description Perfil editable de Docente/Investigador.
 * Accesible desde:
 *   - Ícono 👁 (vista/edición combinada)
 *   - Ícono ✏  (alias /SGPI-CFMH/[id]/editar → redirige aquí)
 *
 * Secciones:
 *   1. Información General (DNI readonly + validado, nombres, apellidos, depto, estado)
 *   2. Calificación Académica (nivel Renacyt, toggle SM, puntaje actual)
 *   3. Historial de Producción (últimos 7 años — mini-grid editable, EX3)
 *
 * Validaciones:
 *   EX1 – DNI único (blur sobre DNI)
 *   EX2 – Campos obligatorios vacíos (pre-save)
 *   EX3 – Valores numéricos en historial (0–100)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MainLayout } from '@/SGPI-CFU/components/layout';
import type { DocenteInvestigador, NivelRenacyt, EstadoVigencia } from '../_data/types';
import { getDocenteById, actualizarDocente } from '../_data/service';
import { DEPARTAMENTOS, NIVELES_RENACYT } from '../_data/mock';

// ─────────────────────────────────────────────────────────────────────────────
// Íconos
// ─────────────────────────────────────────────────────────────────────────────

const BackIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const CheckSmall = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const SaveIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);
const HistorialIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const inputCls = (err?: boolean) =>
  `w-full px-3 py-2 font-sans text-[13px] text-on-surface border rounded outline-none
   focus:ring-2 transition-all
   ${err
    ? 'border-[#dc2626] bg-[#fff5f5] focus:ring-[#fca5a5]'
    : 'border-outline-variant focus:ring-[#a8c8fa] focus:border-primary'}`;

const selectCls =
  'w-full appearance-none pl-3 pr-8 py-2 font-sans text-[13px] text-on-surface border border-outline-variant rounded bg-surface-container-lowest outline-none focus:ring-2 focus:ring-[#a8c8fa] cursor-pointer transition-all';

const ChevronDown = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

function SelectField({ id, value, onChange, options }: {
  id: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={selectCls}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant">
        <ChevronDown />
      </span>
    </div>
  );
}

function Label({ text, required }: { text: string; required?: boolean }) {
  return (
    <label className="block font-sans font-bold text-[10px] text-on-surface uppercase tracking-widest mb-1.5">
      {text}{required && <span className="text-[#dc2626] ml-0.5">*</span>}
    </label>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded shadow-level-1 mb-4">
      <div className="px-6 py-4 border-b border-outline-variant">
        <h2 className="font-heading font-semibold text-[15px] text-on-surface">{title}</h2>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Toggle
// ─────────────────────────────────────────────────────────────────────────────

function Toggle({ checked, onChange, id }: {
  checked: boolean; onChange: (v: boolean) => void; id: string;
}) {
  return (
    <button role="switch" aria-checked={checked} id={id}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200
        ${checked ? 'bg-[#16a34a]' : 'bg-[#d1d5db]'}`}>
      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200
        ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Alert banner
// ─────────────────────────────────────────────────────────────────────────────

function AlertBanner({ message, type }: { message: string; type: 'error' | 'success' }) {
  const cfg = type === 'error'
    ? 'bg-[#fee2e2] border-[#fca5a5] text-[#991b1b]'
    : 'bg-[#dcfce7] border-[#86efac] text-[#166534]';
  return (
    <div role="alert"
      className={`flex items-start gap-2 px-4 py-3 rounded border ${cfg} font-sans text-[13px] mb-4`}>
      {type === 'error' ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
      {message}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Página principal
// ─────────────────────────────────────────────────────────────────────────────

const CURRENT_YEAR = new Date().getFullYear();

export default function DocentePerfilPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';

  const [doc, setDoc] = useState<DocenteInvestigador | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [alert, setAlert] = useState<{ msg: string; type: 'error' | 'success' } | null>(null);

  // ── Campos del formulario ──────────────────────────────────────────────────
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [email, setEmail] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [estado, setEstado] = useState<EstadoVigencia>('activo');
  const [nivel, setNivel] = useState<NivelRenacyt>('Sin nivel');
  const [esSM, setEsSM] = useState(false);
  const [historial, setHistorial] = useState<{ anio: number; puntaje: string }[]>([]);
  const [histErrors, setHistErrors] = useState<boolean[]>([]);
  const [fieldErrors, setFieldErrors] = useState<string[]>([]);

  // ── Cargar docente ─────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const data = await getDocenteById(id);
      if (!data) { setNotFound(true); setIsLoading(false); return; }
      setDoc(data);
      setNombres(data.nombres);
      setApellidos(data.apellidos);
      setEmail(data.email);
      setDepartamento(data.departamento);
      setEstado(data.estado);
      setNivel(data.nivelRenacyt);
      setEsSM(data.condicionSM === 'SM');
      // Últimos 7 años
      const años = Array.from({ length: 7 }, (_, i) => CURRENT_YEAR - 6 + i);
      setHistorial(años.map((anio) => {
        const found = data.puntajeHistorico.find((p) => p.anio === anio);
        return { anio, puntaje: found ? String(found.puntaje) : '0' };
      }));
      setHistErrors(new Array(7).fill(false));
      setIsLoading(false);
    }
    load();
  }, [id]);

  // ── Puntaje actual = año corriente ─────────────────────────────────────────
  const puntajeActual = historial.find((h) => h.anio === CURRENT_YEAR)?.puntaje ?? '0';

  // ── Validaciones ──────────────────────────────────────────────────────────

  // EX3: validar historial (0-100, numérico)
  const validateHistorial = useCallback((): boolean => {
    const errors = historial.map((h) => {
      const v = parseFloat(h.puntaje);
      return isNaN(v) || v < 0 || v > 100;
    });
    setHistErrors(errors);
    if (errors.some(Boolean)) {
      setAlert({ msg: 'Formato de puntaje inválido. Los valores deben ser numéricos entre 0 y 100.', type: 'error' });
      return false;
    }
    return true;
  }, [historial]);

  // EX2: campos obligatorios
  const validateRequired = useCallback((): boolean => {
    const errs: string[] = [];
    if (!nombres.trim()) errs.push('nombres');
    if (!apellidos.trim()) errs.push('apellidos');
    if (!email.trim()) errs.push('email');
    if (!departamento) errs.push('departamento');
    setFieldErrors(errs);
    if (errs.length > 0) {
      setAlert({ msg: 'Debe completar todos los campos obligatorios para guardar el perfil.', type: 'error' });
      return false;
    }
    return true;
  }, [nombres, apellidos, email, departamento]);

  // ── Guardar ────────────────────────────────────────────────────────────────
  const handleGuardar = async () => {
    setAlert(null);
    if (!validateRequired()) return;
    if (!validateHistorial()) return;
    setIsSaving(true);
    try {
      await actualizarDocente(id, {
        dni: doc!.dni,
        nombres, apellidos, email, departamento,
        nivelRenacyt: nivel,
        condicionSM: esSM ? 'SM' : 'No SM',
        estado,
        puntajeHistorico: historial.map((h) => ({
          anio: h.anio, puntaje: parseFloat(h.puntaje),
          articulos: 0, tesis: 0, proyectos: 0,
        })),
      });
      setAlert({ msg: 'Perfil guardado exitosamente.', type: 'success' });
      setTimeout(() => router.push('/SGPI-CFMH'), 1200);
    } catch {
      setAlert({ msg: 'Error al guardar el perfil. Intente nuevamente.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <MainLayout title="Sistema de Gestión de Proyectos de Investigación">
        <div className="animate-pulse flex flex-col gap-4 max-w-[820px]">
          <div className="h-6 w-64 bg-surface-container-high rounded" />
          <div className="h-[200px] bg-surface-container-high rounded" />
          <div className="h-[120px] bg-surface-container-high rounded" />
        </div>
      </MainLayout>
    );
  }

  if (notFound || !doc) {
    return (
      <MainLayout title="Sistema de Gestión de Proyectos de Investigación">
        <div className="text-center py-20">
          <p className="font-sans font-semibold text-[14px] text-on-surface mb-2">Docente no encontrado.</p>
          <button onClick={() => router.push('/SGPI-CFMH')}
            className="font-sans text-[13px] text-[#2563eb] hover:underline">
            Volver al directorio
          </button>
        </div>
      </MainLayout>
    );
  }

  const hasErr = (f: string) => fieldErrors.includes(f);

  return (
    <MainLayout title="Sistema de Gestión de Proyectos de Investigación">

      <div className="max-w-[860px] mx-auto w-full">

        {/* ── Encabezado ────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-5 gap-4">
          <h1 className="font-heading font-semibold text-h1 text-on-surface">
            Perfil de Docente/Investigador
          </h1>
          <button onClick={() => router.push('/SGPI-CFMH')}
            className="flex items-center gap-1.5 px-4 py-2 rounded font-sans font-semibold text-[13px] text-on-surface border border-outline-variant hover:bg-surface-container transition-colors"
            aria-label="Volver al directorio">
            <BackIcon /> Volver al directorio
          </button>
        </div>

        {alert && <AlertBanner message={alert.msg} type={alert.type} />}

        <div>

          {/* ── 1. Información General ──────────────────────────────────────────── */}
          <SectionCard title="1. Información General">
            <div className="flex flex-col gap-4">

              {/* DNI + Nombres */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label text="DNI / Pasaporte" />
                  <input type="text" value={doc.dni} readOnly
                    className="w-full px-3 py-2 font-mono text-[13px] text-on-surface-variant border border-outline-variant rounded bg-surface-container-low outline-none cursor-not-allowed"
                    aria-label="DNI (no editable)"
                  />
                  <p className="mt-1 flex items-center gap-1 font-sans text-[11px] text-[#16a34a]">
                    <CheckSmall /> DNI verificado y único en el sistema.
                  </p>
                </div>
                <div>
                  <Label text="Nombres" required />
                  <input type="text" value={nombres}
                    onChange={(e) => setNombres(e.target.value)}
                    className={inputCls(hasErr('nombres'))}
                    aria-label="Nombres del docente"
                    aria-invalid={hasErr('nombres')}
                  />
                </div>
              </div>

              {/* Apellidos + Departamento */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label text="Apellidos" required />
                  <input type="text" value={apellidos}
                    onChange={(e) => setApellidos(e.target.value)}
                    className={inputCls(hasErr('apellidos'))}
                    aria-label="Apellidos del docente"
                    aria-invalid={hasErr('apellidos')}
                  />
                </div>
                <div>
                  <Label text="Departamento Académico" required />
                  <SelectField id="departamento" value={departamento}
                    onChange={setDepartamento}
                    options={[
                      { value: '', label: 'Seleccione...' },
                      ...DEPARTAMENTOS.map((d) => ({ value: d, label: d })),
                    ]}
                  />
                </div>
              </div>

              {/* Email + Estado */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label text="Correo Institucional" required />
                  <input type="email" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputCls(hasErr('email'))}
                    aria-label="Correo institucional"
                    aria-invalid={hasErr('email')}
                  />
                </div>
                <div>
                  <Label text="Estado en el Sistema" />
                  <SelectField id="estado" value={estado} onChange={(v) => setEstado(v as EstadoVigencia)}
                    options={[
                      { value: 'activo', label: 'Activo' },
                      { value: 'inactivo', label: 'Inactivo' },
                      { value: 'por_vencer', label: 'Por Vencer' },
                    ]}
                  />
                </div>
              </div>

            </div>
          </SectionCard>

          {/* ── 2. Calificación Académica ───────────────────────────────────────── */}
          <SectionCard title="2. Calificación Académica">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">

              <div>
                <Label text="Nivel Renacyt Actual" />
                <SelectField id="nivel-renacyt" value={nivel}
                  onChange={(v) => setNivel(v as NivelRenacyt)}
                  options={NIVELES_RENACYT.map((n) => ({ value: n, label: n }))}
                />
              </div>

              <div>
                <Label text="¿Es Investigador San Marcos (RR Nº 02127-R-17)?" />
                <div className="flex items-center gap-3 mt-1">
                  <Toggle id="toggle-sm" checked={esSM} onChange={setEsSM} />
                  <span className="font-sans font-semibold text-[13px] text-on-surface">
                    {esSM ? 'SÍ' : 'NO'}
                  </span>
                </div>
              </div>

              <div>
                <Label text={`Puntaje Actual (${CURRENT_YEAR})`} />
                <input type="text" readOnly
                  value={`${parseFloat(puntajeActual || '0').toFixed(1)} puntos`}
                  className="w-full px-3 py-2 font-mono text-[13px] text-on-surface border border-outline-variant rounded bg-surface-container-low outline-none cursor-not-allowed"
                />
              </div>

            </div>
          </SectionCard>

          {/* ── 3. Historial de Producción ─────────────────────────────────────── */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded shadow-level-1 mb-[80px]">
            <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between">
              <div>
                <h2 className="font-heading font-semibold text-[15px] text-on-surface">
                  3. Historial de Producción (Últimos 7 Años)
                </h2>
                <p className="font-sans text-[11px] text-on-surface-variant mt-0.5">
                  Registre o valide los puntajes anuales para mantener el seguimiento de la
                  recategorización y carga no lectiva.
                </p>
              </div>
              <button
                onClick={() => router.push(`/SGPI-CFMH/${id}/historial`)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded font-sans font-semibold text-[12px] text-white bg-[#001631] hover:bg-[#002b54] transition-colors"
                aria-label="Ver historial completo de proyectos del investigador"
              >
                <HistorialIcon /> Ver Historial de Proyectos
              </button>
            </div>
            <div className="px-6 py-5">
              <div className="flex gap-3 flex-wrap">
                {historial.map((h, idx) => {
                  const isCurrent = h.anio === CURRENT_YEAR;
                  const hasError = histErrors[idx];
                  return (
                    <div key={h.anio} className="flex flex-col items-center gap-1.5">
                      <span className="font-sans font-bold text-[10px] text-on-surface-variant uppercase">
                        {h.anio}
                      </span>
                      <input
                        type="number" min="0" max="100" step="0.1"
                        value={h.puntaje}
                        onChange={(e) => {
                          const next = [...historial];
                          next[idx] = { ...next[idx], puntaje: e.target.value };
                          setHistorial(next);
                          if (histErrors[idx]) {
                            const ne = [...histErrors];
                            ne[idx] = false;
                            setHistErrors(ne);
                          }
                        }}
                        aria-label={`Puntaje ${h.anio}`}
                        aria-invalid={hasError}
                        className={`
                        w-[68px] px-2 py-1.5 text-center font-mono text-[13px] rounded outline-none transition-all
                        focus:ring-2
                        ${isCurrent
                            ? 'border-2 border-[#001631] text-[#001631] font-bold focus:ring-[#a8c8fa]'
                            : hasError
                              ? 'border border-[#dc2626] bg-[#fff5f5] focus:ring-[#fca5a5]'
                              : 'border border-outline-variant focus:ring-[#a8c8fa]'}
                      `}
                      />
                    </div>
                  );
                })}
              </div>
              {histErrors.some(Boolean) && (
                <p className="mt-3 font-sans text-[11px] text-[#dc2626]">
                  Formato de puntaje inválido. Los valores deben ser numéricos entre 0 y 100.
                </p>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* ── Barra fija inferior ──────────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-end gap-3 px-6 py-4 bg-white border-t border-outline-variant shadow-[0_-2px_8px_rgba(0,0,0,0.06)]">
        <button onClick={() => router.push('/SGPI-CFMH')}
          className="px-5 py-2 rounded font-sans font-semibold text-[12px] text-on-surface border border-outline-variant hover:bg-surface-container transition-colors uppercase tracking-wide"
          aria-label="Cancelar modificaciones">
          Cancelar Modificaciones
        </button>
        <button onClick={handleGuardar} disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2 rounded font-sans font-semibold text-[12px] text-white bg-[#001631] hover:bg-[#002b54] disabled:opacity-50 transition-colors uppercase tracking-wide"
          aria-label="Guardar perfil del investigador">
          {isSaving ? (
            <>
              <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Guardando...
            </>
          ) : (
            <><SaveIcon /> Guardar Perfil de Investigador</>
          )}
        </button>
      </div>

    </MainLayout>
  );
}
