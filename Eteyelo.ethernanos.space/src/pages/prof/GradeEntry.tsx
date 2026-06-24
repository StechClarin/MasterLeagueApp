import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, CheckCircle, Award, Search, ArrowLeft, Save } from 'lucide-react';

type AbsenceStatus = 'NONE' | 'JUSTIFIED' | 'UNJUSTIFIED';

const mockStudents = [
  { id: 1, matricule: 'ETU001', lastName: 'Dupont', firstName: 'Marie', grade: 14.5, absenceStatus: 'NONE' as AbsenceStatus },
  { id: 2, matricule: 'ETU002', lastName: 'Martin', firstName: 'Léo', grade: 9.0, absenceStatus: 'NONE' as AbsenceStatus },
  { id: 3, matricule: 'ETU003', lastName: 'Bernard', firstName: 'Lucie', grade: null, absenceStatus: 'NONE' as AbsenceStatus },
  { id: 4, matricule: 'ETU004', lastName: 'Petit', firstName: 'Hugo', grade: 18.0, absenceStatus: 'NONE' as AbsenceStatus },
  { id: 5, matricule: 'ETU005', lastName: 'Durand', firstName: 'Emma', grade: null, absenceStatus: 'JUSTIFIED' as AbsenceStatus },
];

const GradeEntryProf: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState(mockStudents);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeAbsenceMenu, setActiveAbsenceMenu] = useState<number | null>(null);

  const gradedCount = students.filter(s => s.grade !== null && s.absenceStatus === 'NONE').length;
  const totalCount = students.length;
  const progress = Math.round(((gradedCount + students.filter(s => s.absenceStatus !== 'NONE').length) / totalCount) * 100);
  
  const average = gradedCount > 0 
    ? (students.filter(s => s.grade !== null && s.absenceStatus === 'NONE').reduce((acc, curr) => acc + (curr.grade || 0), 0) / gradedCount).toFixed(2) 
    : '0.00';

  const handleGradeChange = (studentId: number, value: string) => {
    let numValue = parseFloat(value);
    if (isNaN(numValue)) numValue = null as any;
    
    setStudents(prev => prev.map(s => 
      s.id === studentId ? { ...s, grade: numValue } : s
    ));
  };

  const setAbsence = (studentId: number, status: AbsenceStatus) => {
    setStudents(prev => prev.map(s => 
      s.id === studentId ? { ...s, absenceStatus: status, grade: status !== 'NONE' ? null : s.grade } : s
    ));
    setActiveAbsenceMenu(null);
  };

  const filteredStudents = students.filter(s => 
    s.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.matricule.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAppreciation = (grade: number | null, absenceStatus: AbsenceStatus) => {
    if (absenceStatus === 'JUSTIFIED') return { text: 'Non Noté', color: 'blue' };
    if (absenceStatus === 'UNJUSTIFIED') return { text: 'Zéro', color: 'rose' };
    if (grade === null) return { text: '-', color: 'none' };
    if (grade >= 16) return { text: 'Très Bien', color: 'emerald' };
    if (grade >= 12) return { text: 'Bien', color: 'indigo' };
    if (grade >= 10) return { text: 'Passable', color: 'blue' };
    return { text: 'Insuffisant', color: 'rose' };
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }} onClick={() => activeAbsenceMenu && setActiveAbsenceMenu(null)}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h1 className="page-title" style={{ fontSize: '24px' }}>
            Saisie des Notes : <span style={{ color: 'var(--primary)' }}>Évaluation #{id}</span>
          </h1>
          <p className="page-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></span>
            Mathématiques - Terminale S
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate('/prof/evaluations')} className="glass-card hover-lift" style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', 
            padding: '10px 20px', background: 'white', color: 'var(--text-main)', border: '1px solid var(--glass-border)', borderRadius: '12px', cursor: 'pointer', fontWeight: 600
          }}>
            <ArrowLeft size={18} />
            Retour
          </button>
          <button className="hover-lift" style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', 
            padding: '10px 20px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <Save size={18} />
            Enregistrer Tout
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
        <div className="glass-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Élèves</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-main)' }}>{totalCount}</div>
          </div>
          <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', color: 'var(--text-muted)' }}>
            <Users size={20} />
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '4px' }}>Élèves Notés</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-main)' }}>{gradedCount}</div>
          </div>
          <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: 'var(--success)' }}>
            <CheckCircle size={20} />
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '2px' }}>Progression</div>
              <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-main)' }}>{progress}%</div>
            </div>
            <div style={{ padding: '8px', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', borderRadius: '8px', fontSize: '12px', fontWeight: 700, fontFamily: 'monospace' }}>
              {progress}%
            </div>
          </div>
          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: 'full', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(to right, #8b5cf6, #6366f1)', borderRadius: 'full' }}></div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '4px' }}>Moyenne de l'épreuve</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-main)' }}>{average}</div>
          </div>
          <div style={{ padding: '12px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px', color: 'var(--warning)' }}>
            <Award size={20} />
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '16px', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '6px', marginLeft: '4px' }}>Rechercher un étudiant</label>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '38px' }} />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Nom, Prénom ou Matricule..." 
            style={{ 
              width: '100%', padding: '10px 10px 10px 44px', 
              background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', 
              borderRadius: '12px', color: 'var(--text-main)', outline: 'none', fontSize: '14px', fontWeight: 600
            }} 
          />
        </div>
      </div>

      <div className="glass-panel" style={{ overflow: 'visible' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)' }}>
              <th style={{ padding: '16px 24px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)' }}>Étudiant</th>
              <th style={{ padding: '16px', textAlign: 'center', width: '200px' }}>
                <span style={{ display: 'block', fontSize: '12px', fontWeight: 900, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Note</span>
                <span style={{ fontSize: '9px', fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>Max: 20</span>
              </th>
              <th style={{ padding: '16px', textAlign: 'center', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)' }}>Appréciation</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((row) => {
              const appreciation = getAppreciation(row.grade, row.absenceStatus);
              return (
                <tr key={row.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', transition: 'background 0.2s' }} className="hover-bg">
                  <td style={{ padding: '16px 24px', borderRight: '1px solid rgba(255,255,255,0.02)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '9px', fontWeight: 700, fontFamily: 'monospace', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{row.matricule}</span>
                      <span style={{ fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>{row.lastName} {row.firstName}</span>
                    </div>
                  </td>

                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      {row.absenceStatus !== 'NONE' && (
                        <div 
                          onClick={() => setAbsence(row.id, 'NONE')}
                          style={{ position: 'absolute', inset: '4px', background: 'rgba(225, 29, 72, 0.1)', border: '1px solid rgba(225, 29, 72, 0.3)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
                          title="Cliquer pour réactiver"
                        >
                          <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            ABS {row.absenceStatus === 'JUSTIFIED' ? '(J)' : '(NJ)'}
                          </span>
                        </div>
                      )}
                      <input 
                        type="number" 
                        value={row.grade !== null ? row.grade : ''}
                        onChange={(e) => handleGradeChange(row.id, e.target.value)}
                        step={0.25} min={0} max={20}
                        style={{ 
                          width: '100px', height: '44px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', 
                          borderRadius: '8px', textAlign: 'center', fontWeight: 800, fontSize: '16px', color: 'var(--text-main)', outline: 'none',
                          opacity: row.absenceStatus !== 'NONE' ? 0.4 : 1,
                          ...(row.grade !== null && row.absenceStatus === 'NONE' ? {
                            color: row.grade < 10 ? 'var(--danger)' : 'var(--success)',
                            background: row.grade < 10 ? 'rgba(225, 29, 72, 0.05)' : 'rgba(16, 185, 129, 0.05)',
                            borderColor: row.grade < 10 ? 'rgba(225, 29, 72, 0.2)' : 'rgba(16, 185, 129, 0.2)'
                          } : {})
                        }}
                        placeholder="--"
                      />
                      {row.absenceStatus === 'NONE' && (
                        <div style={{ position: 'absolute', top: '-8px', right: '16px' }}>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setActiveAbsenceMenu(activeAbsenceMenu === row.id ? null : row.id); }}
                            style={{ width: '28px', height: '22px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: '1px solid var(--glass-border)', fontSize: '9px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                            title="Marquer comme absent"
                          >
                            ABS
                          </button>
                          {activeAbsenceMenu === row.id && (
                            <div style={{ position: 'absolute', top: '26px', right: '0', background: '#1e293b', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '8px', zIndex: 50, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)', width: '200px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setAbsence(row.id, 'JUSTIFIED'); }} 
                                  style={{ padding: '8px 12px', background: 'transparent', border: 'none', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', cursor: 'pointer', borderRadius: '6px' }}
                                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                  onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                  Absence Justifiée (Neutre)
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setAbsence(row.id, 'UNJUSTIFIED'); }} 
                                  style={{ padding: '8px 12px', background: 'rgba(225, 29, 72, 0.1)', border: '1px solid rgba(225, 29, 72, 0.2)', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--danger)', cursor: 'pointer', borderRadius: '6px' }}
                                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(225, 29, 72, 0.2)'}
                                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(225, 29, 72, 0.1)'}
                                >
                                  Absence Non-Justifiée (0)
                                </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </td>

                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <span style={{ 
                      display: 'inline-flex', alignItems: 'center', padding: '4px 12px', borderRadius: '12px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px',
                      ...(appreciation.color !== 'none' ? {
                        color: appreciation.color === 'emerald' ? '#047857' : appreciation.color === 'indigo' ? '#4338ca' : appreciation.color === 'blue' ? '#1d4ed8' : '#be123c',
                        background: appreciation.color === 'emerald' ? '#d1fae5' : appreciation.color === 'indigo' ? '#e0e7ff' : appreciation.color === 'blue' ? '#dbeafe' : '#ffe4e6',
                        border: `1px solid ${appreciation.color === 'emerald' ? '#a7f3d0' : appreciation.color === 'indigo' ? '#c7d2fe' : appreciation.color === 'blue' ? '#bfdbfe' : '#fecdd3'}`
                      } : {
                        color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)'
                      })
                    }}>
                      {appreciation.text}
                    </span>
                  </td>
                </tr>
              );
            })}
            {filteredStudents.length === 0 && (
              <tr>
                <td colSpan={3} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Aucun élève trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'flex-end', fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Étudiants filtrés : {filteredStudents.length} / {students.length}
        </div>
      </div>
    </div>
  );
};

export default GradeEntryProf;
