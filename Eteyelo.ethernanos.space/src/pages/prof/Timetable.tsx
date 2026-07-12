import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Users, ChevronLeft, ChevronRight } from 'lucide-react';

const scheduleData = [
  { day: 'Lundi', slots: [{ time: '08:00 - 10:00', subject: 'Mathématiques', class: 'Terminale S', room: 'Salle 102', color: 'var(--primary)' }, { time: '14:00 - 16:00', subject: 'Mathématiques', class: '1ère S', room: 'Salle 105', color: 'var(--secondary)' }] },
  { day: 'Mardi', slots: [{ time: '10:00 - 12:00', subject: 'Mathématiques', class: 'Seconde A', room: 'Salle 201', color: 'var(--accent)' }] },
  { day: 'Mercredi', slots: [{ time: '08:00 - 12:00', subject: 'Soutien', class: 'Toutes Classes', room: 'Salle Info', color: 'var(--warning)' }] },
  { day: 'Jeudi', slots: [{ time: '14:00 - 16:00', subject: 'Mathématiques', class: 'Terminale S', room: 'Salle 102', color: 'var(--primary)' }, { time: '16:00 - 18:00', subject: 'Mathématiques', class: 'Seconde B', room: 'Salle 204', color: 'var(--success)' }] },
  { day: 'Vendredi', slots: [{ time: '08:00 - 10:00', subject: 'Mathématiques', class: '1ère S', room: 'Salle 105', color: 'var(--secondary)' }] },
];

const TimetableProf: React.FC = () => {
  const [weekOffset, setWeekOffset] = useState(0);

  // Fonction factice pour déterminer la plage de date de la semaine affichée
  const getWeekRange = () => {
    const startDay = 15 + (weekOffset * 7);
    const endDay = 19 + (weekOffset * 7);
    return `Semaine du ${startDay} au ${endDay} Juin 2026`;
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Mon Planning</h1>
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

      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '8px', borderRadius: '8px' }}>
            <CalendarIcon size={24} color="var(--primary)" />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Emploi du temps</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
          {scheduleData.map((day, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', fontWeight: 600 }}>
                {day.day}
              </div>
              
              {day.slots.map((slot, sIdx) => (
                <div key={sIdx} style={{ 
                  background: 'rgba(255,255,255,0.02)', 
                  border: `1px solid ${slot.color}40`,
                  borderLeft: `4px solid ${slot.color}`,
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  transition: 'transform 0.2s ease',
                  cursor: 'pointer'
                }}
                className="hover-lift"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', fontWeight: 600 }}>
                    <Clock size={16} color={slot.color} />
                    {slot.time}
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>{slot.subject}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
                      <Users size={14} /> {slot.class}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      <MapPin size={14} /> {slot.room}
                    </div>
                  </div>
                </div>
              ))}
              
              {day.slots.length === 0 && (
                <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)', fontSize: '14px', border: '1px dashed var(--glass-border)', borderRadius: '12px' }}>
                  Aucun cours
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimetableProf;
