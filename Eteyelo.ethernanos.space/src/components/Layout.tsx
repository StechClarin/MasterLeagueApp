import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, FileText, CreditCard, MessageSquare, SwitchCamera, LogOut, ChevronDown, Menu } from 'lucide-react';
import { usePortalAuth } from '../context/PortalAuthContext';

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const { session, children, activeChild, selectChild, logout } = usePortalAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const parent = session?.person;

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
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}>
            E
          </div>
          Eteyelo
        </div>

        <nav className="sidebar-nav" onClick={closeMenu}>
          <NavLink to="/student" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            <span>Vue d'ensemble</span>
          </NavLink>
          <NavLink to="/student/timetable" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Calendar size={20} />
            <span>Emploi du temps</span>
          </NavLink>
          <NavLink to="/student/grades" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <FileText size={20} />
            <span>Bulletins</span>
          </NavLink>
          <NavLink to="/student/payments" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <CreditCard size={20} />
            <span>Paiements</span>
          </NavLink>
          <NavLink to="/student/messages" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
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
            onClick={() => navigate('/prof')}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          >
            <SwitchCamera size={16} />
            <span style={{ fontSize: '14px', fontWeight: 500 }}>Vue Professeur</span>
          </button>

          <div className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(99,102,241,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              color: 'var(--primary)',
              fontSize: '16px',
              textTransform: 'uppercase',
              flexShrink: 0
            }}>
              {activeChild ? activeChild.firstName.charAt(0) : '?'}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {activeChild ? `${activeChild.firstName} ${activeChild.lastName}` : 'Élève'}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {activeChild?.className || activeChild?.academicYear || 'Classe non renseignée'}
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
        {/* Header contextuel : menu mobile + enfant suivi + sélecteur multi-enfants */}
        <div
          className="glass-panel"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
            padding: '14px 20px',
            marginBottom: '24px',
          }}
        >
          <button className="menu-toggle" onClick={() => setMenuOpen(true)} aria-label="Ouvrir le menu" title="Menu">
            <Menu size={20} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flexWrap: 'wrap' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Espace de suivi
            </span>
            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>
              {activeChild ? `${activeChild.firstName} ${activeChild.lastName}` : '…'}
            </span>
            {activeChild?.className && (
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                {activeChild.className} · {activeChild.establishmentName}
              </span>
            )}
          </div>

          {children.length > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Mes enfants :</span>
              <select
                value={activeChild?.id ?? ''}
                onChange={(e) => selectChild(e.target.value)}
                style={{
                  appearance: 'none',
                  padding: '10px 36px 10px 14px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '10px',
                  color: 'var(--text-main)',
                  fontSize: '14px',
                  fontWeight: 600,
                  fontFamily: 'inherit',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {children.map((child) => (
                  <option key={child.id} value={child.id} style={{ background: '#0f172a', color: 'var(--text-main)' }}>
                    {child.firstName} {child.lastName} — {child.className ?? child.academicYear ?? ''}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} style={{ position: 'absolute', right: '12px', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            </div>
          )}

          {parent?.kind === 'guardian' && (
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Parent : {parent.name}
            </span>
          )}
        </div>

        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
