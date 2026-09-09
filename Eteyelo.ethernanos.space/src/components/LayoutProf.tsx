import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, FileText, MessageSquare, SwitchCamera, LogOut, Menu } from 'lucide-react';
import { usePortalAuth } from '../context/PortalAuthContext';

const LayoutProf: React.FC = () => {
  const navigate = useNavigate();
  const { session, logout } = usePortalAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const prof = session?.person;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className={`app-container${menuOpen ? ' menu-open' : ''}`}>
      <aside className="sidebar glass-panel">
        <div className="sidebar-logo">
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--secondary), var(--accent))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}>
            E
          </div>
          Eteyelo Prof
        </div>

        <nav className="sidebar-nav" onClick={closeMenu}>
          <NavLink to="/prof" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            <span>Tableau de bord</span>
          </NavLink>
          <NavLink to="/prof/timetable" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Calendar size={20} />
            <span>Mon Planning</span>
          </NavLink>
          <NavLink to="/prof/evaluations" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <FileText size={20} />
            <span>Évaluations</span>
          </NavLink>
          <NavLink to="/prof/messages" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <MessageSquare size={20} />
            <span>Messagerie</span>
          </NavLink>
        </nav>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            className="glass-card"
            style={{
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)',
              color: 'var(--text-main)',
              cursor: 'pointer',
              borderRadius: '12px',
              transition: 'all 0.3s ease'
            }}
            onClick={() => {
              closeMenu();
              navigate('/student');
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          >
            <SwitchCamera size={16} />
            <span style={{ fontSize: '14px', fontWeight: 500 }}>Vue Étudiant</span>
          </button>

          <div className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(236,72,153,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              color: 'var(--secondary)',
              fontSize: '16px',
              textTransform: 'uppercase',
              flexShrink: 0
            }}>
              {prof ? (prof.firstName || prof.name || 'P').charAt(0) : 'P'}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {prof?.name || 'Enseignant'}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {prof?.jobTitle || prof?.establishmentName || 'Eteyelo Prof'}
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
                transition: 'color 0.2s'
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
        {/* Topbar mobile : ouverture du tiroir */}
        <div className="mobile-topbar">
          <button className="menu-toggle" onClick={() => setMenuOpen(true)} aria-label="Ouvrir le menu" title="Menu">
            <Menu size={20} />
          </button>
          <span className="mobile-topbar-title">Eteyelo Prof</span>
        </div>

        <Outlet />
      </main>
    </div>
  );
};

export default LayoutProf;
