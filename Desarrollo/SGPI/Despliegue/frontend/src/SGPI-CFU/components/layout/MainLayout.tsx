'use client';

/**
 * @file MainLayout.tsx
 * @description Wrapper de pantalla completa del SGPI.
 *
 * Modelo Fixed-Fluid Hybrid:
 * - Sidebar: fijo a la izquierda, 220px
 * - TopBar: fija arriba (desplazada 220px a la derecha)
 * - Main: fluid, con padding-left 220px y padding-top 56px
 *
 * Uso:
 * ```tsx
 * // En app/dashboard/layout.tsx
 * export default function DashboardLayout({ children }) {
 *   return <MainLayout>{children}</MainLayout>;
 * }
 * ```
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar, type TopBarProps } from './TopBar';
import { AuthGuard } from '../auth/AuthGuard';

// Context to detect nested layouts
interface LayoutContextType {
  hasParentLayout: boolean;
  setTitle: (title: string) => void;
  setSubtitle: (subtitle: string) => void;
}

const LayoutContext = createContext<LayoutContextType | null>(null);

export interface MainLayoutProps extends TopBarProps {
  children: React.ReactNode;
}

export function MainLayout({ children, title: initialTitle = '', subtitle: initialSubtitle = '' }: MainLayoutProps) {
  const parentContext = useContext(LayoutContext);

  // States for title and subtitle at this layout level
  const [title, setTitle] = useState(initialTitle);
  const [subtitle, setSubtitle] = useState(initialSubtitle);

  // Notify parent layout of our title/subtitle when nested
  useEffect(() => {
    if (parentContext) {
      if (initialTitle) parentContext.setTitle(initialTitle);
      if (initialSubtitle) parentContext.setSubtitle(initialSubtitle);
      return () => {
        parentContext.setTitle('');
        parentContext.setSubtitle('');
      };
    }
  }, [parentContext, initialTitle, initialSubtitle]);

  // Keep internal state in sync with changes to props
  useEffect(() => {
    if (!parentContext) {
      setTitle(initialTitle);
      setSubtitle(initialSubtitle);
    }
  }, [parentContext, initialTitle, initialSubtitle]);

  if (parentContext) {
    // Nested layout: transparently render children without duplication
    return <>{children}</>;
  }

  // Root layout: render the actual layout shell
  return (
    <LayoutContext.Provider value={{ hasParentLayout: true, setTitle, setSubtitle }}>
      <AuthGuard>
        <div className="min-h-screen bg-background font-sans text-on-surface">
          {/* Sidebar fijo */}
          <Sidebar />

          {/* TopBar fija sobre el área de contenido */}
          <TopBar title={title} subtitle={subtitle} />

          {/* Área de contenido principal */}
          <main
            className="flex flex-col min-h-screen"
            style={{ paddingLeft: '220px', paddingTop: '56px' }}
            id="main-content"
          >
            {/* Container con padding del sistema */}
            <div className="flex-1 p-[24px]">
              {children}
            </div>
          </main>
        </div>
      </AuthGuard>
    </LayoutContext.Provider>
  );
}

export default MainLayout;
