import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { usePortalAuth, type PortalAuthValue } from '../context/PortalAuthContext';
import type { PortalSpace } from '../lib/api';

function FullScreenLoader() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        color: 'var(--text-muted)',
        fontSize: '16px',
      }}
    >
      <span
        style={{
          width: '22px',
          height: '22px',
          borderRadius: '50%',
          border: '3px solid rgba(255,255,255,0.15)',
          borderTopColor: 'var(--primary)',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      Chargement de votre espace…
    </div>
  );
}

function routeSpace(pathname: string): PortalSpace {
  return pathname.startsWith('/prof') ? 'prof' : 'student';
}

/**
 * Protège une zone (étudiant / prof) : exige une session active et
 * correspondant à l'espace demandé.
 */
export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { loading, session, space }: PortalAuthValue = usePortalAuth();
  const location = useLocation();
  const requiredSpace = routeSpace(location.pathname);

  if (loading) {
    return <FullScreenLoader />;
  }

  if (!session) {
    return <Navigate to={`/auth?space=${requiredSpace}`} replace />;
  }

  // Un parent connecté qui visite /prof est redirigé vers /auth prof.
  if (space !== requiredSpace) {
    return <Navigate to={`/auth?space=${requiredSpace}`} replace />;
  }

  return <>{children}</>;
}
