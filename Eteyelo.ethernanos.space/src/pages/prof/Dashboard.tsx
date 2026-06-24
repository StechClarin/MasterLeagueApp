import React from 'react';
import { Users, FileText, CheckCircle, Clock, AlertTriangle, BookOpen, GraduationCap, TrendingUp, Star } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const classEvolutionData = [
  { period: 'Devoir 1', 'Terminale S': 11.5, '1ère S': 10.5, 'Seconde A': 12.0 },
  { period: 'Devoir 2', 'Terminale S': 12.5, '1ère S': 11.0, 'Seconde A': 12.5 },
  { period: 'Examen', 'Terminale S': 13.5, '1ère S': 12.0, 'Seconde A': 14.0 },
];

const CLASS_COLORS = {
  'Terminale S': '#6366f1',
  '1ère S': '#ec4899',
  'Seconde A': '#14b8a6',
};

const DashboardProf: React.FC = () => {
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Bonjour, Prof. Martin 👋</h1>
        <p className="page-subtitle">Voici votre tableau de bord du jour.</p>
      </div>

      <div className="grid-cards" style={{ marginBottom: '32px' }}>
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-label">Prochain Cours</div>
            <Clock color="var(--primary)" />
          </div>
          <div className="stat-value">Maths - Tle S</div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Dans 15 min • Salle 102</p>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-label">Élèves</div>
            <Users color="var(--success)" />
          </div>
          <div className="stat-value">145</div>
          <p style={{ color: 'var(--success)', fontSize: '14px' }}>Répartis sur 4 classes</p>
        </div>

        <div className="glass-card" style={{ border: '1px solid rgba(236, 72, 153, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-label" style={{ color: 'var(--secondary)' }}>Copies à corriger</div>
            <FileText color="var(--secondary)" />
          </div>
          <div className="stat-value" style={{ color: 'var(--secondary)' }}>32</div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Devoir Surveillé - 1ère S</p>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-label">Moyenne Globale</div>
            <GraduationCap color="var(--accent)" />
          </div>
          <div className="stat-value">12.8 / 20</div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Toutes classes confondues</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        
        {/* Évolution par classe */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '8px', borderRadius: '8px' }}>
              <TrendingUp size={24} color="var(--primary)" />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Évolution des Classes</h2>
          </div>
          
          <div style={{ width: '100%', height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={classEvolutionData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="period" stroke="var(--text-muted)" fontSize={12} />
                <YAxis domain={[0, 20]} stroke="var(--text-muted)" fontSize={12} tickCount={6} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(10px)', borderColor: 'var(--glass-border)', color: 'var(--text-main)', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }} 
                  itemStyle={{ fontWeight: 500 }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                
                {Object.keys(CLASS_COLORS).map((cls) => (
                  <Line 
                    key={cls}
                    type="monotone" 
                    dataKey={cls} 
                    stroke={CLASS_COLORS[cls as keyof typeof CLASS_COLORS]} 
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, fill: 'var(--bg-darker)' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'rgba(34, 197, 94, 0.2)', padding: '8px', borderRadius: '8px' }}>
                <Star size={24} color="var(--success)" />
              </div>
              Meilleures Classes
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {['Terminale S', 'Seconde A', '1ère S'].map((cls, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: idx === 0 ? 'var(--warning)' : (idx === 1 ? '#cbd5e1' : '#b45309') }}>#{idx + 1}</div>
                    <div style={{ fontWeight: 600 }}>{cls}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: 'var(--success)', fontSize: '16px' }}>{(14.0 - idx * 0.5).toFixed(1)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'rgba(234, 179, 8, 0.2)', padding: '8px', borderRadius: '8px' }}>
                <AlertTriangle size={24} color="var(--warning)" />
              </div>
              Tâches
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', borderLeft: '3px solid var(--danger)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>Saisir notes DS 2</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Avant vendredi 18h</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', borderLeft: '3px solid var(--warning)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>Préparer sujet Examen</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Pour la Terminale S</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DashboardProf;
