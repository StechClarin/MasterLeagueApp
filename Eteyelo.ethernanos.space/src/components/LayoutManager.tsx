import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Wallet,
  UserCheck,
  MessageSquare,
  LogOut,
  Menu,
  Building2,
  ChevronRight,
  Edit3,
} from 'lucide-react';
import { usePortalAuth } from '../context/PortalAuthContext';
import { ScrollToTopButton } from './ScrollToTopButton';

const LayoutManager: React.FC = () => {
  const navigate = useNavigate();
  const { session, logout } = usePortalAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const manager = session?.person;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const closeMenu = () => setMenuOpen(false);

  // Détection dynamique des rôles (Directeur, Gestionnaire, SuperAdmin)
  const isSuperAdmin = Boolean(
    manager?.isSuperAdmin ||
      manager?.email?.toLowerCase().includes('ethernanos') ||
      manager?.email?.toLowerCase().includes('admin') ||
      manager?.name?.toLowerCase().includes('ethernanos') ||
      manager?.name?.toLowerCase().includes('admin') ||
      (manager?.roles && manager.roles.some((r: string) => r.includes('super') || r.includes('admin')))
  );

  const jobTitleLower = (manager?.jobTitle || '').toLowerCase();
  const rolesLower = (manager?.roles || []).map((r: string) => String(r).toLowerCase());

  const isDirector =
    isSuperAdmin ||
    rolesLower.some((r) => r.includes('direct')) ||
    jobTitleLower.includes('direct') ||
    jobTitleLower.includes('proviseur') ||
    jobTitleLower.includes('principal');

  const isGestionnaire =
    isSuperAdmin ||
    rolesLower.some((r) => r.includes('gestion') || r.includes('manager') || r.includes('économe') || r.includes('comptable')) ||
    jobTitleLower.includes('gestion') ||
    jobTitleLower.includes('économe') ||
    jobTitleLower.includes('comptable') ||
    jobTitleLower.includes('caiss');

  // Règles de visibilité :
  // - Directeur : Inscription + Saisie de note
  // - Gestionnaire : Inscription + Facturation
  // - Superadmin (ethernanos) : TOUT (Inscription + Facturation + Saisie de note)
  const canSeeInscription = isSuperAdmin || isDirector || isGestionnaire;
  const canSeeFacturation = isSuperAdmin || (!isDirector && isGestionnaire) || isSuperAdmin;
  const canSeeSaisieNote = isSuperAdmin || isDirector;

  return (
    <div className={`app-container${menuOpen ? ' menu-open' : ''}`} style={{ paddingBottom: '70px' }}>
      {/* Sidebar Desktop / Tablet */}
      <aside className="sidebar glass-panel">
        <div className="sidebar-logo">
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 900,
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
            }}
          >
            <Building2 size={22} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-main)' }}>Eteyelo</span>
            <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 700, letterSpacing: '0.5px' }}>
              {isSuperAdmin ? 'SUPERADMIN' : isDirector ? 'ESPACE DIRECTEUR' : 'ESPACE GESTIONNAIRE'}
            </span>
          </div>
        </div>

        <nav className="sidebar-nav" onClick={closeMenu}>
          <NavLink to="/manager" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            <span>Tableau de bord</span>
          </NavLink>

          {canSeeInscription && (
            <NavLink to="/manager/students" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Users size={20} />
              <span>Inscription & Élèves</span>
            </NavLink>
          )}

          {canSeeFacturation && (
            <NavLink to="/manager/finance" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Wallet size={20} />
              <span>Facturation & Caisse</span>
            </NavLink>
          )}

          {canSeeSaisieNote && (
            <NavLink to="/manager/grades" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Edit3 size={20} />
              <span>Saisie des notes</span>
            </NavLink>
          )}

          {isSuperAdmin && (
            <NavLink to="/manager/staff" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <UserCheck size={20} />
              <span>Personnel & RH</span>
            </NavLink>
          )}

          <NavLink to="/manager/messages" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <MessageSquare size={20} />
            <span>Annonces</span>
          </NavLink>
        </nav>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <a
            href="/admin/"
            className="glass-card"
            style={{
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              background: 'rgba(16, 185, 129, 0.1)',
              color: '#10b981',
              cursor: 'pointer',
              borderRadius: '12px',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '13px',
              transition: 'all 0.3s ease',
            }}
          >
            <Building2 size={16} />
            <span>Console PC (Django Admin)</span>
            <ChevronRight size={14} />
          </a>

          <div className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                color: '#10b981',
                fontSize: '16px',
                textTransform: 'uppercase',
                flexShrink: 0,
              }}
            >
              {manager ? (manager.firstName || manager.name || 'D').charAt(0) : 'D'}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {manager?.name || 'Utilisateur'}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {isSuperAdmin
                  ? 'Super Administrateur'
                  : manager?.jobTitle || (isDirector ? 'Directeur' : 'Gestionnaire')}
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Se déconnecter"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '8px',
                display: 'flex',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--danger)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {menuOpen && <div className="menu-backdrop" onClick={closeMenu} aria-hidden="true" />}

      <main className="main-content">
        {/* Topbar Mobile */}
        <div className="mobile-topbar" style={{ background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="menu-toggle" onClick={() => setMenuOpen(true)} aria-label="Ouvrir le menu" title="Menu">
              <Menu size={20} />
            </button>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="mobile-topbar-title" style={{ fontSize: '15px', fontWeight: 800 }}>
                {manager?.establishmentName || 'Eteyelo Space'}
              </span>
              <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 700 }}>
                {isSuperAdmin ? 'SuperAdmin' : isDirector ? 'Espace Directeur' : 'Espace Gestionnaire'}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              padding: '6px 12px',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
            }}
          >
            <LogOut size={14} />
            Sortir
          </button>
        </div>

        <Outlet />
      </main>

      {/* BARRE DE NAVIGATION EN BAS SUR MOBILE (MOBILE BOTTOM BAR) */}
      <div
        className="mobile-bottom-nav"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '65px',
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid var(--glass-border)',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          zIndex: 1000,
        }}
      >
        <NavLink
          to="/manager"
          end
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            color: isActive ? '#10b981' : 'var(--text-muted)',
            textDecoration: 'none',
            fontSize: '11px',
            fontWeight: isActive ? 800 : 500,
          })}
        >
          <LayoutDashboard size={20} />
          <span>Accueil</span>
        </NavLink>

        {canSeeInscription && (
          <NavLink
            to="/manager/students"
            style={({ isActive }) => ({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              color: isActive ? '#10b981' : 'var(--text-muted)',
              textDecoration: 'none',
              fontSize: '11px',
              fontWeight: isActive ? 800 : 500,
            })}
          >
            <Users size={20} />
            <span>Inscription</span>
          </NavLink>
        )}

        {canSeeFacturation && (
          <NavLink
            to="/manager/finance"
            style={({ isActive }) => ({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              color: isActive ? '#10b981' : 'var(--text-muted)',
              textDecoration: 'none',
              fontSize: '11px',
              fontWeight: isActive ? 800 : 500,
            })}
          >
            <Wallet size={20} />
            <span>Facturation</span>
          </NavLink>
        )}

        {canSeeSaisieNote && (
          <NavLink
            to="/manager/grades"
            style={({ isActive }) => ({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              color: isActive ? '#10b981' : 'var(--text-muted)',
              textDecoration: 'none',
              fontSize: '11px',
              fontWeight: isActive ? 800 : 500,
            })}
          >
            <Edit3 size={20} />
            <span>Notes</span>
          </NavLink>
        )}
      </div>

      {/* BOUTON FLOTTANT DE REMONTÉE DE PAGE (CLIC & MAINTIEN) */}
      <ScrollToTopButton />
    </div>
  );
};

export default LayoutManager;
