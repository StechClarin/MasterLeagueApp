import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, FileText, MessageSquare, Users, SwitchCamera } from 'lucide-react';

const LayoutProf: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="app-container">
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
        
        <nav className="sidebar-nav">
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
            onClick={() => navigate('/')}
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
              background: 'rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              👨‍🏫
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px' }}>Prof. Martin</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Mathématiques</div>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default LayoutProf;
