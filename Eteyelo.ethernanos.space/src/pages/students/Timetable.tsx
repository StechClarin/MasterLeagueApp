import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

const Timetable: React.FC = () => {
  const [weekOffset, setWeekOffset] = useState(0);
  
  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const hours = ['08:00', '10:00', '12:00', '14:00', '16:00'];

  // Fonction factice pour déterminer la plage de date de la semaine affichée
  const getWeekRange = () => {
    const startDay = 14 + (weekOffset * 7);
    const endDay = 19 + (weekOffset * 7);
    return `Semaine du ${startDay} au ${endDay} Juin 2026`;
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Emploi du temps</h1>
          <p className="page-subtitle">{getWeekRange()}</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
          <button 
            onClick={() => setWeekOffset(prev => prev - 1)}
            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '8px', borderRadius: '8px', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            className="hover-bg"
            title="Semaine précédente"
          >
            <ChevronLeft size={20} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '14px', padding: '0 8px' }}>
            <CalendarIcon size={16} color="var(--primary)" />
            Aujourd'hui
          </div>
          <button 
            onClick={() => setWeekOffset(prev => prev + 1)}
            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '8px', borderRadius: '8px', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            className="hover-bg"
            title="Semaine suivante"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', tableLayout: 'fixed' }}>
          <thead>
            <tr>
              <th style={{ width: '80px', padding: '20px', borderBottom: '1px solid var(--glass-border)', borderRight: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>Heures</th>
              {days.map(day => (
                <th key={day} style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-main)', fontWeight: 600 }}>{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hours.map((hour, idx) => (
              <tr key={hour}>
                <td style={{ padding: '20px', borderBottom: idx !== hours.length - 1 ? '1px solid var(--glass-border)' : 'none', borderRight: '1px solid var(--glass-border)', color: 'var(--text-muted)', fontWeight: 500 }}>
                  {hour}
                </td>
                {days.map(day => {
                  // Mock schedule logic
                  const isMath = day === 'Lundi' && hour === '10:00';
                  const isPhysics = day === 'Mardi' && hour === '08:00';
                  const isEnglishCanceled = day === 'Jeudi' && hour === '14:00';
                  const isHistoryPostponed = day === 'Vendredi' && hour === '10:00';
                  const isSport = day === 'Samedi' && hour === '08:00';
                  const isBreak = hour === '12:00' && day !== 'Samedi';

                  return (
                    <td key={day} style={{ padding: '10px', borderBottom: idx !== hours.length - 1 ? '1px solid var(--glass-border)' : 'none' }}>
                      {isMath && (
                        <div style={{ background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.4)', padding: '12px', borderRadius: '8px', color: 'var(--primary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ fontWeight: 600 }}>Mathématiques</div>
                          <div style={{ fontSize: '12px' }}>Salle 102</div>
                        </div>
                      )}
                      {isPhysics && (
                        <div style={{ background: 'rgba(20, 184, 166, 0.2)', border: '1px solid rgba(20, 184, 166, 0.4)', padding: '12px', borderRadius: '8px', color: 'var(--accent)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ fontWeight: 600 }}>Physique</div>
                          <div style={{ fontSize: '12px' }}>Laboratoire B</div>
                        </div>
                      )}
                      {isSport && (
                        <div style={{ background: 'rgba(34, 197, 94, 0.2)', border: '1px solid rgba(34, 197, 94, 0.4)', padding: '12px', borderRadius: '8px', color: 'var(--success)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ fontWeight: 600 }}>Éducation Physique</div>
                          <div style={{ fontSize: '12px' }}>Gymnase</div>
                        </div>
                      )}
                      {isEnglishCanceled && (
                        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px dashed var(--danger)', padding: '12px', borderRadius: '8px', color: 'var(--text-main)', opacity: 0.8, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ fontWeight: 600, textDecoration: 'line-through', color: 'var(--text-muted)' }}>Anglais</div>
                          <div>
                            <span style={{ background: 'var(--danger)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Annulé</span>
                          </div>
                        </div>
                      )}
                      {isHistoryPostponed && (
                        <div style={{ background: 'rgba(234, 179, 8, 0.1)', border: '1px solid var(--warning)', padding: '12px', borderRadius: '8px', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ fontWeight: 600 }}>Histoire-Géo</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Salle 205</div>
                          <div style={{ marginTop: '4px' }}>
                            <span style={{ background: 'var(--warning)', color: 'var(--bg-darker)', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reporté au 22/06</span>
                          </div>
                        </div>
                      )}
                      {isBreak && (
                        <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '14px' }}>
                          Pause Déjeuner
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Timetable;
