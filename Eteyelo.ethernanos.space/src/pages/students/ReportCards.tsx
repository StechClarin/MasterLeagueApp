import React, { useState } from 'react';
import { Filter, FileText } from 'lucide-react';

const ReportCards: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState('2025/2026');
  const [selectedPeriod, setSelectedPeriod] = useState('Trimestre 3');

  interface SubjectResult {
    subject: string;
    teacher: string;
    evaluations: { title: string; type: string; grade: number | 'ABS' }[];
    average: number;
    rank: string;
  }

  // Mock data simulation based on the new single-grade architecture
  const allGrades: Record<string, Record<string, SubjectResult[]>> = {
    '2025/2026': {
      'Trimestre 3': [
        { 
          subject: 'Mathématiques', teacher: 'Mr. Smith', rank: '1er', average: 16.5,
          evaluations: [
            { title: 'Séquence 5', type: 'DS', grade: 15 }, 
            { title: 'Compo', type: 'Examen', grade: 18 }
          ]
        },
        { 
          subject: 'Physique-Chimie', teacher: 'Mme. Curie', rank: '5ème', average: 13.5,
          evaluations: [
            { title: 'Interrogation', type: 'CC', grade: 12 }, 
            { title: 'TP', type: 'CC', grade: 14.5 }, 
            { title: 'Compo', type: 'Examen', grade: 14 }
          ]
        },
        { 
          subject: 'Histoire-Géo', teacher: 'Mr. Braudel', rank: '10ème', average: 12.0,
          evaluations: [
            { title: 'Carte', type: 'DS', grade: 11 }, 
            { title: 'Compo', type: 'Examen', grade: 13 }
          ]
        },
        { 
          subject: 'Philosophie', teacher: 'Mme. Arendt', rank: '7ème', average: 13.0,
          evaluations: [
            { title: 'Dissertation', type: 'DS', grade: 13 }
          ]
        },
        { 
          subject: 'Langues', teacher: 'Mr. Shakespeare', rank: '2ème', average: 18.0,
          evaluations: [
            { title: 'Oral', type: 'CC', grade: 18 }, 
            { title: 'Écrit', type: 'Examen', grade: 18 }
          ]
        },
        { 
          subject: 'SVT', teacher: 'Mr. Darwin', rank: '12ème', average: 9.5,
          evaluations: [
            { title: 'TP', type: 'CC', grade: 'ABS' }, 
            { title: 'Compo', type: 'Examen', grade: 9.5 }
          ]
        },
      ],
      'Trimestre 2': [
        { 
          subject: 'Mathématiques', teacher: 'Mr. Smith', rank: '3ème', average: 15.0,
          evaluations: [{ title: 'Compo', type: 'Examen', grade: 15 }]
        },
      ]
    }
  };

  const subjectResults: SubjectResult[] = allGrades[selectedYear]?.[selectedPeriod] || [];
  
  const averageTotal = subjectResults.length > 0 
    ? (subjectResults.reduce((sum, g) => sum + g.average, 0) / subjectResults.length).toFixed(2)
    : '--';

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 className="page-title">Bulletins & Notes</h1>
          <p className="page-subtitle">Consultez vos résultats détaillés par période.</p>
        </div>
        
        {/* Filters */}
        <div style={{ display: 'flex', gap: '16px', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid var(--glass-border)', backdropFilter: 'blur(10px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
            <Filter size={18} />
            <span style={{ fontSize: '14px', fontWeight: 500 }}>Filtres</span>
          </div>
          
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            style={{ background: 'rgba(15, 23, 42, 0.8)', color: 'var(--text-main)', border: '1px solid var(--glass-border)', padding: '8px 16px', borderRadius: '8px', outline: 'none', cursor: 'pointer', fontFamily: 'Outfit' }}
          >
            <option value="2025/2026">2025 / 2026</option>
            <option value="2024/2025">2024 / 2025</option>
          </select>

          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            style={{ background: 'rgba(15, 23, 42, 0.8)', color: 'var(--text-main)', border: '1px solid var(--glass-border)', padding: '8px 16px', borderRadius: '8px', outline: 'none', cursor: 'pointer', fontFamily: 'Outfit' }}
          >
            <option value="Trimestre 1">Trimestre 1</option>
            <option value="Trimestre 2">Trimestre 2</option>
            <option value="Trimestre 3">Trimestre 3</option>
          </select>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '10px', borderRadius: '10px' }}>
              <FileText size={24} color="var(--primary)" />
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Relevé de Notes</h2>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{selectedPeriod} • Année {selectedYear}</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {subjectResults.length > 0 && (
              <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', color: 'var(--success)', padding: '8px 20px', borderRadius: '12px', fontWeight: 800, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Moyenne Générale</span>
                {averageTotal} / 20
              </div>
            )}
          </div>
        </div>

        {subjectResults.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 4fr 1fr 1fr', gap: '16px', padding: '0 24px 8px 24px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)' }}>
              <div>Matière & Professeur</div>
              <div>Détail des Évaluations</div>
              <div style={{ textAlign: 'center' }}>Rang</div>
              <div style={{ textAlign: 'right' }}>Moyenne</div>
            </div>

            {/* Rows */}
            {subjectResults.map((result, idx) => (
              <div key={idx} className="glass-card hover-bg" style={{ display: 'grid', gridTemplateColumns: '3fr 4fr 1fr 1fr', gap: '16px', alignItems: 'center', padding: '20px 24px', transition: 'background 0.2s' }}>
                
                {/* Matière */}
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>{result.subject}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Prof. {result.teacher}</div>
                </div>
                
                {/* Badges d'évaluations */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {result.evaluations.map((ev, i) => (
                    <div key={i} title={ev.title} style={{ 
                      display: 'flex', alignItems: 'center', gap: '6px', 
                      background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', 
                      padding: '4px 10px', borderRadius: '8px', fontSize: '12px' 
                    }}>
                      <span style={{ 
                        fontSize: '10px', fontWeight: 800, textTransform: 'uppercase',
                        color: ev.type === 'Examen' ? 'var(--secondary)' : ev.type === 'DS' ? 'var(--primary)' : 'var(--accent)' 
                      }}>
                        {ev.type}
                      </span>
                      <span style={{ width: '1px', height: '10px', background: 'var(--glass-border)' }}></span>
                      <strong style={{ color: ev.grade === 'ABS' ? 'var(--danger)' : 'var(--text-main)', fontWeight: 700 }}>
                        {ev.grade}
                      </strong>
                    </div>
                  ))}
                </div>
                
                {/* Rang */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-muted)' }}>{result.rank}</div>
                </div>

                {/* Moyenne de la matière */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    minWidth: '60px', padding: '6px 12px', borderRadius: '8px',
                    fontSize: '18px', fontWeight: 800,
                    background: result.average >= 15 ? 'rgba(16, 185, 129, 0.1)' : result.average >= 10 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(225, 29, 72, 0.1)',
                    color: result.average >= 15 ? 'var(--success)' : result.average >= 10 ? 'var(--warning)' : 'var(--danger)',
                    border: `1px solid ${result.average >= 15 ? 'rgba(16, 185, 129, 0.3)' : result.average >= 10 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(225, 29, 72, 0.3)'}`
                  }}>
                    {result.average.toFixed(2)}
                  </div>
                </div>

              </div>
            ))}
          </div>
        ) : (
           <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)', border: '1px dashed var(--glass-border)', borderRadius: '12px' }}>
              <div style={{ fontSize: '32px', marginBottom: '16px' }}>📭</div>
              <div style={{ fontSize: '16px', fontWeight: 500 }}>Aucune donnée disponible pour cette période.</div>
           </div>
        )}
      </div>
    </div>
  );
};

export default ReportCards;
