import React, { useMemo } from 'react';
import { BookOpen, Award, CreditCard, AlertTriangle, Compass, Star, TrendingUp, Activity, FileText, CheckCircle, MessageSquare } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Data used for Averages and Orientation
const performanceData = [
  { subject: 'Mathématiques', average: 16.5, category: 'Scientifique' },
  { subject: 'Physique', average: 14.5, category: 'Scientifique' },
  { subject: 'SVT', average: 12.5, category: 'Scientifique' },
  { subject: 'Français', average: 11.5, category: 'Littéraire' },
  { subject: 'Philosophie', average: 12.0, category: 'Littéraire' },
  { subject: 'Histoire-Géo', average: 15.5, category: 'Littéraire' },
  { subject: 'Anglais', average: 18.5, category: 'Langues' },
];

// Data used for the Evolution Curve (Line Chart) over time/evaluations
const evolutionData = [
  { period: 'Devoir 1', 'Mathématiques': 13, 'Physique': 11, 'SVT': 10, 'Français': 14, 'Anglais': 16 },
  { period: 'Devoir 2', 'Mathématiques': 15, 'Physique': 14, 'SVT': 12, 'Français': 12, 'Anglais': 18 },
  { period: 'Examen', 'Mathématiques': 18, 'Physique': 16, 'SVT': 13, 'Français': 10, 'Anglais': 19 },
];

const COLORS = {
  'Mathématiques': '#6366f1', // primary
  'Physique': '#ec4899',      // secondary
  'SVT': '#14b8a6',           // accent
  'Français': '#eab308',      // warning
  'Anglais': '#22c55e'        // success
};

const Dashboard: React.FC = () => {
  const subjectsWithAverage = useMemo(() => {
    return [...performanceData].sort((a, b) => b.average - a.average);
  }, []);

  const bestSubjects = subjectsWithAverage.slice(0, 3);

  const suggestedOrientation = useMemo(() => {
    const categoryAverages = subjectsWithAverage.reduce((acc, curr) => {
      if (!acc[curr.category]) {
        acc[curr.category] = { total: 0, count: 0 };
      }
      acc[curr.category].total += curr.average;
      acc[curr.category].count += 1;
      return acc;
    }, {} as Record<string, { total: number, count: number }>);

    let orientation = 'Générale';
    let maxAvg = 0;
    for (const [category, data] of Object.entries(categoryAverages)) {
      const avg = data.total / data.count;
      if (avg > maxAvg) {
        maxAvg = avg;
        orientation = category;
      }
    }
    return orientation;
  }, [subjectsWithAverage]);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Bonjour, John 👋</h1>
        <p className="page-subtitle">Voici un résumé de votre situation actuelle.</p>
      </div>

      <div className="grid-cards" style={{ marginBottom: '32px' }}>
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-label">Prochain Cours</div>
            <BookOpen color="var(--primary)" />
          </div>
          <div className="stat-value">Mathématiques</div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Salle 102 - 10h00 à 12h00</p>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-label">Moyenne Générale</div>
            <Award color="var(--success)" />
          </div>
          <div className="stat-value">15.5 / 20</div>
          <p style={{ color: 'var(--success)', fontSize: '14px' }}>+0.5 depuis le dernier trimestre</p>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-label">Dernier Paiement</div>
            <CreditCard color="var(--accent)" />
          </div>
          <div className="stat-value">150 $</div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Payé le 12 Juin 2026</p>
        </div>

        <div className="glass-card" style={{ border: '1px solid rgba(99, 102, 241, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-label" style={{ color: 'var(--primary)' }}>Messages Non Lus</div>
            <MessageSquare color="var(--primary)" />
          </div>
          <div className="stat-value" style={{ color: 'var(--primary)' }}>1</div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Administration</p>
        </div>
      </div>

      {/* Analytics Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px', marginBottom: '32px' }}>
        
        {/* Graph: Évolution des notes (Courbes) */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '8px', borderRadius: '8px' }}>
              <TrendingUp size={24} color="var(--primary)" />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Évolution par Matière</h2>
          </div>
          
          <div style={{ width: '100%', height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={evolutionData}
                margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="period" stroke="var(--text-muted)" fontSize={12} />
                <YAxis domain={[0, 20]} stroke="var(--text-muted)" fontSize={12} tickCount={6} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(10px)', borderColor: 'var(--glass-border)', color: 'var(--text-main)', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }} 
                  itemStyle={{ fontWeight: 500 }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                
                {Object.keys(COLORS).map((subject) => (
                  <Line 
                    key={subject}
                    type="monotone" 
                    dataKey={subject} 
                    stroke={COLORS[subject as keyof typeof COLORS]} 
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, fill: 'var(--bg-darker)' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                ))}

              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Highlights: Meilleures Matières & Orientation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Best Subjects */}
          <div className="glass-panel" style={{ padding: '24px', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ background: 'rgba(34, 197, 94, 0.2)', padding: '8px', borderRadius: '8px' }}>
                <Star size={24} color="var(--success)" />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Top Matières</h2>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {bestSubjects.map((subject, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: idx === 0 ? 'var(--warning)' : (idx === 1 ? '#cbd5e1' : '#b45309') }}>#{idx + 1}</div>
                    <div style={{ fontWeight: 600 }}>{subject.subject}</div>
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--success)' }}>
                    {subject.average.toFixed(1)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Orientation */}
          <div className="glass-panel" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(236, 72, 153, 0.1))' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ background: 'rgba(236, 72, 153, 0.2)', padding: '8px', borderRadius: '8px' }}>
                <Compass size={24} color="var(--secondary)" />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Orientation</h2>
            </div>
            
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '12px' }}>
              Basé sur vos excellents résultats dans le pôle <strong>{suggestedOrientation}</strong>, le conseil d'orientation recommande le profil suivant :
            </p>
            
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'transparent', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textAlign: 'center', padding: '16px', border: '1px dashed var(--secondary)', borderRadius: '12px' }}>
              Profil {suggestedOrientation}
            </div>
          </div>

        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ background: 'rgba(234, 179, 8, 0.2)', padding: '8px', borderRadius: '8px' }}>
            <Activity size={24} color="var(--warning)" />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Activité Récente</h2>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', borderLeft: '4px solid var(--primary)' }}>
            <FileText size={20} color="var(--primary)" style={{ marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>Nouvelle note ajoutée</div>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>Vous avez obtenu 18/20 en Mathématiques (Examen).</div>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Il y a 2h</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', borderLeft: '4px solid var(--success)' }}>
            <CheckCircle size={20} color="var(--success)" style={{ marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>Paiement validé</div>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>Le paiement de 150 $ pour le mois de Juin a été confirmé.</div>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Hier, 14:30</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', borderLeft: '4px solid var(--danger)' }}>
            <AlertTriangle size={20} color="var(--danger)" style={{ marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>Nouvelle dette</div>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>Frais de laboratoire (50 $) facturés et en attente de paiement.</div>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Le 10 Juin</div>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default Dashboard;
