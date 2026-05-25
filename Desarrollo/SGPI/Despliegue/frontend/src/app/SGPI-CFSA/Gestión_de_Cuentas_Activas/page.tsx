'use client';

/**
 * @file page.tsx
 * @route /SGPI-CFSA/Gestión_de_Cuentas_Activas
 * @description Pantalla "Gestión de Cuentas Activas" del módulo Configuración del Sistema.
 *
 * Muestra:
 * - Tabs de navegación: "Gestión de Cuentas" | "Parámetros de Operación"
 * - Listado de usuarios con columnas: USUARIO, CORREO INSTITUCIONAL, ROL, ESTADO, ACCIONES
 * - Toggle de activación/desactivación por usuario
 * - Botón "Crear Nuevo Usuario" (solo rol admin)
 * - Icono de edición por fila (solo rol admin)
 *
 * Permisos: Solo admin puede MANAGE_USERS. El resto solo visualiza.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { MainLayout }                               from '@/SGPI-CFU/components/layout';
import { Button, Badge, Modal, Input, Select }    from '@/SGPI-CFU/components/ui';
// import { useAuth }                               from '@/SGPI-CFU/lib/hooks';
import { canDo }                                    from '@/SGPI-CFU/lib/auth/permissions';
import type { User }                                from '@/SGPI-CFU/lib/types/models';
import type { UserRole }                            from '@/SGPI-CFU/lib/types/auth';
import { ROLE_LABELS }                              from '@/SGPI-CFU/lib/types/auth';

// ── Mock temporal de useAuth (sin backend) ───────────────────────────────────
// TODO: reemplazar por useAuth real cuando el backend esté disponible
function useMockAuth() {
  return {
    user: {
      id: 'mock-1',
      name: 'Ana Mendoza',
      email: 'amendoza@unmsm.edu.pe',
      role: 'admin' as UserRole,
    },
  };
}


// ─────────────────────────────────────────────────────────────────────────────
// Tipos locales
// ─────────────────────────────────────────────────────────────────────────────

type Tab = 'cuentas' | 'parametros';

// ─────────────────────────────────────────────────────────────────────────────
// Datos mock (reemplazar por llamada a API cuando el endpoint exista)
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_USERS: User[] = [
  {
    id:        '1',
    email:     'jperez@unmsm.edu.pe',
    name:      'Jorge Perez',
    role:      'admin' as UserRole,
    isActive:  true,
    lastLogin: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id:        '2',
    email:     'mlopez@unmsm.edu.pe',
    name:      'Maria Lopez',
    role:      'secretary' as UserRole,
    isActive:  true,
    lastLogin: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Subcomponente: Toggle de estado
// ─────────────────────────────────────────────────────────────────────────────

interface ToggleProps {
  checked:  boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  id:       string;
}

function Toggle({ checked, onChange, disabled = false, id }: ToggleProps) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`
        relative inline-flex items-center
        w-10 h-5 rounded-full
        transition-colors duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#a8c8fa]
        ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
        ${checked ? 'bg-[#059669]' : 'bg-[#c3c6d0]'}
      `}
    >
      <span
        className={`
          absolute top-[2px]
          inline-block w-4 h-4 rounded-full bg-white
          shadow-sm transition-transform duration-200
          ${checked ? 'translate-x-[22px]' : 'translate-x-[2px]'}
        `}
      />
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Subcomponente: Icono Lápiz (editar)
// ─────────────────────────────────────────────────────────────────────────────

function PencilIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15" height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Subcomponente: Icono Plus
// ─────────────────────────────────────────────────────────────────────────────

function PlusIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14" height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5"  y1="12" x2="19" y2="12" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Subcomponente: Sección Parámetros de Operación (placeholder)
// ─────────────────────────────────────────────────────────────────────────────

function ParametrosOperacion() {
  return (
    <div className="flex flex-col">
      {/* ── Cabecera ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-[#001631]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
          <h2 className="font-sans font-bold text-[15px]">Configuración Global</h2>
        </div>
        <Button variant="secondary" size="sm" disabled iconLeft={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
            <polyline points="7 3 7 8 15 8"/>
          </svg>
        }>
          Aplicar Cambios
        </Button>
      </div>

      {/* ── Inputs primera sección ────────────────────────────────────────── */}
      <div className="flex gap-8 mb-6">
        {/* URL Base Scraping */}
        <div className="flex flex-col gap-1.5 flex-1 max-w-[340px]">
          <label className="font-sans font-bold text-[12px] text-[#0f172a]">
            URL Base Scraping (VRIP)
          </label>
          <Input 
            defaultValue="https://vrip.unmsm.edu.pe/convocatorias" 
            disabled 
          />
        </div>

        {/* Frecuencia */}
        <div className="flex flex-col gap-1.5">
          <label className="font-sans font-bold text-[12px] text-[#0f172a]">
            Frecuencia de Sincronización
          </label>
          <div className="flex items-center gap-2">
            <Input defaultValue="12" className="w-[60px] text-center" />
            <span className="font-sans text-[13px] text-[#64748b]">Horas</span>
          </div>
        </div>
      </div>

      <hr className="border-[#e2e8f0] mb-6" />

      {/* ── Segunda sección: Alertas ──────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <h3 className="font-sans font-bold text-[13px] text-[#0f172a]">
          Umbrales de Semaforización (Alertas)
        </h3>
        
        <div className="flex gap-6 mt-1">
          {/* Alerta Roja */}
          <div className="flex flex-col gap-1.5">
            <label className="font-sans font-bold text-[11px] text-[#dc2626]">
              Alerta Roja (Días &lt;=)
            </label>
            <input 
              type="text" 
              defaultValue="3" 
              className="w-40 px-3 py-1.5 font-sans font-medium text-[13px] text-[#dc2626] bg-white border border-[#fca5a5] rounded outline-none focus:ring-2 focus:ring-[#fecaca] transition-all"
            />
          </div>

          {/* Alerta Amarilla */}
          <div className="flex flex-col gap-1.5">
            <label className="font-sans font-bold text-[11px] text-[#d97706]">
              Alerta Amarilla (Días &lt;=)
            </label>
            <input 
              type="text" 
              defaultValue="7" 
              className="w-40 px-3 py-1.5 font-sans font-medium text-[13px] text-[#d97706] bg-white border border-[#fcd34d] rounded outline-none focus:ring-2 focus:ring-[#fde68a] transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Página principal
// ─────────────────────────────────────────────────────────────────────────────

export default function GestionDeCuentasActivasPage() {
  const { user }         = useMockAuth();
  const [activeTab, setActiveTab] = useState<Tab>('cuentas');
  const [users, setUsers]         = useState<User[]>(MOCK_USERS);
  const [errorMsg, setErrorMsg]   = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const puedeGestionar = user ? canDo(user.role, 'MANAGE_USERS') : false;

  // ── Cambiar estado activo de un usuario ──────────────────────────────────
  const handleToggleActivo = useCallback((userId: string, nuevoEstado: boolean) => {
    if (!puedeGestionar) {
      setErrorMsg('No tienes permisos para cambiar el estado de una cuenta.');
      return;
    }
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isActive: nuevoEstado } : u))
    );
  }, [puedeGestionar]);

  // ── Acción "Crear Nuevo Usuario" (stub) ─────────────────────────────────
  const handleCrearUsuario = useCallback(() => {
    if (!puedeGestionar) {
      setErrorMsg('No tienes permisos para crear usuarios.');
      return;
    }
    setIsCreateModalOpen(true);
  }, [puedeGestionar]);

  // ── Acción "Editar usuario" (stub) ───────────────────────────────────────
  const handleEditar = useCallback((userId: string) => {
    if (!puedeGestionar) {
      setErrorMsg('No tienes permisos para editar usuarios.');
      return;
    }
    // TODO: abrir modal de edición
    alert(`Próximamente: Editar usuario con ID ${userId}.`);
  }, [puedeGestionar]);

  // Limpiar error tras 5 s
  useEffect(() => {
    if (!errorMsg) return;
    const timer = setTimeout(() => setErrorMsg(null), 5000);
    return () => clearTimeout(timer);
  }, [errorMsg]);

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <MainLayout
      title="Sistema de Gestión de Proyectos de Investigación"
      subtitle=""
    >
      {/* ── Encabezado de sección ────────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="font-heading font-semibold text-h1 text-on-surface leading-[38px]">
          Configuración del Sistema
        </h1>
        <p className="mt-1 font-sans text-body-md text-on-surface-variant">
          Gestionar accesos y parámetros globales de operación.
        </p>
      </div>

      {/* ── Mensaje de error (permisos u otro) ──────────────────────────── */}
      {errorMsg && (
        <div
          role="alert"
          className="
            mb-4 px-4 py-3 rounded
            bg-error-container text-on-error-container
            border border-[#ffb4ab]
            font-sans text-body-md
          "
        >
          {errorMsg}
        </div>
      )}

      {/* ── Tabs de navegación ───────────────────────────────────────────── */}
      <div className="border-b border-outline-variant mb-0">
        <nav
          className="flex gap-0"
          role="tablist"
          aria-label="Secciones de Configuración del Sistema"
        >
          {/* Tab: Gestión de Cuentas */}
          <button
            id="tab-cuentas"
            role="tab"
            aria-selected={activeTab === 'cuentas'}
            aria-controls="panel-cuentas"
            onClick={() => setActiveTab('cuentas')}
            className={`
              relative px-4 py-3
              font-sans text-[13px] font-medium
              transition-colors duration-150
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#a8c8fa]
              ${activeTab === 'cuentas'
                ? 'text-primary border-b-2 border-primary -mb-px'
                : 'text-on-surface-variant hover:text-on-surface border-b-2 border-transparent'
              }
            `}
          >
            Gestión de Cuentas
          </button>

          {/* Tab: Parámetros de Operación */}
          <button
            id="tab-parametros"
            role="tab"
            aria-selected={activeTab === 'parametros'}
            aria-controls="panel-parametros"
            onClick={() => setActiveTab('parametros')}
            className={`
              relative px-4 py-3
              font-sans text-[13px] font-medium
              transition-colors duration-150
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#a8c8fa]
              ${activeTab === 'parametros'
                ? 'text-primary border-b-2 border-primary -mb-px'
                : 'text-on-surface-variant hover:text-on-surface border-b-2 border-transparent'
              }
            `}
          >
            Parámetros de Operación
          </button>
        </nav>
      </div>

      {/* ── Panel: Gestión de Cuentas ────────────────────────────────────── */}
      {activeTab === 'cuentas' && (
        <section
          id="panel-cuentas"
          role="tabpanel"
          aria-labelledby="tab-cuentas"
          className="mt-6"
        >
          {/* Tarjeta principal */}
          <div className="bg-surface-container-lowest rounded border border-outline-variant shadow-level-1">

            {/* Cabecera de la tarjeta */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant">
              <h2 className="font-heading font-semibold text-h3 text-on-surface">
                Listado de Usuarios
              </h2>

              {/* Botón Crear — visible solo si puedeGestionar */}
              {puedeGestionar && (
                <Button
                  id="btn-crear-usuario"
                  variant="primary"
                  size="md"
                  iconLeft={<PlusIcon />}
                  onClick={handleCrearUsuario}
                >
                  Crear Nuevo Usuario
                </Button>
              )}
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto">
              <table
                className="w-full border-collapse"
                aria-label="Listado de usuarios del sistema"
              >
                {/* Encabezados */}
                <thead>
                  <tr className="border-b border-outline-variant bg-surface-container-low">
                    <th
                      scope="col"
                      className="
                        px-5 py-3 text-left
                        font-sans text-label-caps text-on-surface-variant
                        uppercase tracking-widest
                        w-[220px]
                      "
                    >
                      Usuario
                    </th>
                    <th
                      scope="col"
                      className="
                        px-5 py-3 text-left
                        font-sans text-label-caps text-on-surface-variant
                        uppercase tracking-widest
                      "
                    >
                      Correo Institucional
                    </th>
                    <th
                      scope="col"
                      className="
                        px-5 py-3 text-left
                        font-sans text-label-caps text-on-surface-variant
                        uppercase tracking-widest
                        w-[160px]
                      "
                    >
                      Rol
                    </th>
                    <th
                      scope="col"
                      className="
                        px-5 py-3 text-left
                        font-sans text-label-caps text-on-surface-variant
                        uppercase tracking-widest
                        w-[100px]
                      "
                    >
                      Estado
                    </th>
                    <th
                      scope="col"
                      className="
                        px-5 py-3 text-right
                        font-sans text-label-caps text-on-surface-variant
                        uppercase tracking-widest
                        w-[100px]
                      "
                    >
                      Acciones
                    </th>
                  </tr>
                </thead>

                {/* Filas */}
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-10 text-center font-sans text-body-md text-on-surface-variant"
                      >
                        No hay usuarios registrados en el sistema.
                      </td>
                    </tr>
                  ) : (
                    users.map((u, idx) => (
                      <tr
                        key={u.id}
                        className={`
                          border-b border-outline-variant last:border-b-0
                          transition-colors duration-100
                          ${idx % 2 === 0 ? 'bg-surface-container-lowest' : 'bg-surface-container-low/40'}
                          hover:bg-surface-container-low
                        `}
                      >
                        {/* Nombre */}
                        <td className="px-5 py-3">
                          <span className="font-sans text-body-md font-medium text-on-surface">
                            {u.name}
                          </span>
                        </td>

                        {/* Correo */}
                        <td className="px-5 py-3">
                          <span className="font-sans text-body-md text-on-surface-variant">
                            {u.email}
                          </span>
                        </td>

                        {/* Rol */}
                        <td className="px-5 py-3">
                          <Badge
                            variant={
                              u.role === 'admin'
                                ? 'info'
                                : u.role === 'secretary'
                                ? 'success'
                                : u.role === 'chief'
                                ? 'warning'
                                : 'neutral'
                            }
                            size="sm"
                          >
                            {ROLE_LABELS[u.role]}
                          </Badge>
                        </td>

                        {/* Estado (toggle) */}
                        <td className="px-5 py-3">
                          <Toggle
                            id={`toggle-estado-${u.id}`}
                            checked={u.isActive}
                            onChange={(val) => handleToggleActivo(u.id, val)}
                            disabled={!puedeGestionar}
                          />
                        </td>

                        {/* Acciones */}
                        <td className="px-5 py-3 text-right">
                          {puedeGestionar ? (
                            <button
                              id={`btn-editar-${u.id}`}
                              onClick={() => handleEditar(u.id)}
                              title={`Editar usuario ${u.name}`}
                              aria-label={`Editar usuario ${u.name}`}
                              className="
                                inline-flex items-center justify-center
                                w-7 h-7 rounded
                                text-on-surface-variant
                                hover:bg-surface-container hover:text-primary
                                active:bg-surface-container-high
                                transition-colors duration-100
                                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a8c8fa]
                              "
                            >
                              <PencilIcon />
                            </button>
                          ) : (
                            <span className="text-on-surface-variant/30 text-[12px] font-sans select-none">
                              —
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ── Panel: Parámetros de Operación ──────────────────────────────── */}
      {activeTab === 'parametros' && (
        <section
          id="panel-parametros"
          role="tabpanel"
          aria-labelledby="tab-parametros"
          className="mt-6"
        >
          <div className="bg-surface-container-lowest rounded border border-outline-variant shadow-level-1 p-6">
            <ParametrosOperacion />
          </div>
        </section>
      )}

      {/* ── Modal: Crear Nuevo Usuario ────────────────────────────────────── */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Crear Nuevo Usuario"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={() => {
              // TODO: lógica para guardar el usuario (llamar API)
              setIsCreateModalOpen(false);
            }}>
              Guardar Usuario
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="nombre" className="font-sans font-bold text-[13px] text-[#0f172a]">
              Nombre Completo
            </label>
            <Input id="nombre" placeholder="Ej. Ana García" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="font-sans font-bold text-[13px] text-[#0f172a]">
              Correo Institucional (UNMSM) *
            </label>
            <Input id="email" placeholder="usuario@unmsm.edu.pe" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="rol" className="font-sans font-bold text-[13px] text-[#0f172a]">
              Asignar Rol
            </label>
            <Select id="rol" placeholder="Seleccionar rol...">
              <option value="admin">Administrador</option>
              <option value="secretary">Secretaria</option>
              <option value="chief">Jefe del Instituto</option>
              <option value="guest">Consulta</option>
            </Select>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
}
