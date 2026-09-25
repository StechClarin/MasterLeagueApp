import React, { useEffect, useState } from 'react';
import {
  Users,
  Building2,
  UserCheck,
  TrendingUp,
  Sparkles,
  RefreshCw,
  Award,
  Clock,
  CheckCircle2,
  BookOpen,
  Wallet,
  CreditCard,
  ShieldCheck,
  DollarSign,
} from 'lucide-react';
import { usePortalAuth } from '../../context/PortalAuthContext';
import {
  fetchManagerDashboard,
  type ManagerDashboardData,
} from '../../lib/api';

const Dashboard: React.FC = () => {
  const { session } = usePortalAuth();
  const manager = session?.person;
  const [data, setData] = useState<ManagerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Détection du profil SuperAdmin (Directeur Général / Administrateur / EtherNanos)
  const isSuperAdmin = Boolean(
    (manager as any)?.isSuperAdmin ||
      manager?.email?.toLowerCase().includes('ethernanos') ||
      manager?.email?.toLowerCase().includes('admin') ||
      manager?.name?.toLowerCase().includes('ethernanos') ||
      manager?.name?.toLowerCase().includes('admin') ||
      (manager as any)?.jobTitle?.toLowerCase().includes('super') ||
      (manager as any)?.jobTitle?.toLowerCase().includes('admin') ||
      (manager as any)?.jobTitle?.toLowerCase().includes('directeur général') ||
      ((manager as any)?.roles && (manager as any).roles.some((r: string) => r.includes('super') || r.includes('admin')))
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchManagerDashboard(manager?.establishmentId);
      setData(res);
    } catch {
      // Fallback avec données de démonstration
      setData({
        metrics: {
          totalStudents: 342,
          registeredStudents: 310,
          pendingStudents: 32,
          totalClassrooms: 14,
          totalStaff: 28,
          teacherCount: 20,
          totalEvaluations: 6,
          validationRate: 90.6,
          totalInvoiced: 7500000,
          totalCollected: 5250000,
          totalRemaining: 2250000,
          collectionRate: 70.0,
        },
        recentEnrolments: [
          { id: '1', studentName: 'Marc-Aurèle KOUAMÉ', className: '6ème A', date: 'Aujourd\'hui', status: 'REGISTERED' },
          { id: '2', studentName: 'Sarah MBADINGA', className: '3ème B', date: 'Hier', status: 'REGISTERED' },
          { id: '3', studentName: 'Emmanuel ONDO', className: 'Terminales S1', date: 'Hier', status: 'PENDING' },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [manager]);

  const metrics = data?.metrics;

  return (
    <div className="animate-fade-in" style={{ padding: '20px', maxWidth: '1050px', margin: '0 auto' }}>
      {/* HEADER BANNER DYNAMIQUE */}
      <div
        className="glass-panel"
        style={{
          padding: '24px',
          borderRadius: '24px',
          background: isSuperAdmin
            ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.18), rgba(30, 27, 75, 0.4))'
            : 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 78, 59, 0.3))',
          border: isSuperAdmin ? '1px solid rgba(99, 102, 241, 0.35)' : '1px solid rgba(16, 185, 129, 0.3)',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            {isSuperAdmin ? (
              <>
                <ShieldCheck size={18} color="#6366f1" />
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Tableau de Bord Complet (Super Admin)
                </span>
              </>
            ) : (
              <>
                <Sparkles size={18} color="#10b981" />
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Tableau de Bord Pédagogique
                </span>
              </>
            )}
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>
            {manager?.establishmentName || 'Mon Établissement'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px', margin: 0 }}>
            Bienvenue, {manager?.name || (isSuperAdmin ? 'Super Administrateur' : 'Monsieur le Directeur')}.
          </p>
        </div>

        <button
          onClick={loadData}
          className="hover-lift"
          style={{
            padding: '10px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--glass-border)',
            color: 'var(--text-main)',
            cursor: 'pointer',
          }}
          title="Actualiser les données"
        >
          <RefreshCw size={18} className={loading ? 'spin' : ''} />
        </button>
      </div>

      {/* SECTION FINANCIÈRE RÉSERVÉE AU SUPER ADMIN (2 CARDS LARGES PAR LIGNE) */}
      {isSuperAdmin && (
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Wallet size={18} color="#6366f1" />
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Synthèse Financière & Recouvrement (Accès Restreint Super Admin)
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
            }}
          >
            {/* Card Financière 1 : Encaissement & Recouvrement */}
            <div className="glass-card hover-lift" style={{ padding: '22px', borderRadius: '20px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: '#10b981' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                  <Wallet size={24} />
                </div>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#10b981', background: 'rgba(16,185,129,0.15)', padding: '4px 10px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <TrendingUp size={14} /> {metrics?.collectionRate ?? 0}% Recouvré
                </span>
              </div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#10b981', lineHeight: 1.1 }}>
                {metrics?.totalCollected !== undefined ? `${metrics.totalCollected.toLocaleString('fr-FR')} FCFA` : '...'}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '6px', fontWeight: 600 }}>
                Total Frais Encaissés (Paiements Effectués)
              </div>
            </div>

            {/* Card Financière 2 : Facturation & Reste à recouvrir */}
            <div className="glass-card hover-lift" style={{ padding: '22px', borderRadius: '20px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: '#f59e0b' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
                  <CreditCard size={24} />
                </div>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#f59e0b', background: 'rgba(245,158,11,0.15)', padding: '4px 10px', borderRadius: '100px' }}>
                  Reste : {metrics?.totalRemaining !== undefined ? `${metrics.totalRemaining.toLocaleString('fr-FR')} FCFA` : '...'}
                </span>
              </div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1.1 }}>
                {metrics?.totalInvoiced !== undefined ? `${metrics.totalInvoiced.toLocaleString('fr-FR')} FCFA` : '...'}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '6px', fontWeight: 600 }}>
                Total Facturé (Frais Dûs Établissement)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION INDICATEURS ACADÉMIQUES (STRICTEMENT 2 CARTES PAR LIGNE / WIDTH LARGE) */}
      <div style={{ marginBottom: '28px' }}>
        {isSuperAdmin && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <BookOpen size={18} color="var(--primary)" />
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Indicateurs Académiques & Pédagogiques
            </h2>
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
          }}
        >
          {/* Card 1 : Élèves Inscrits Actifs */}
          <div className="glass-card hover-lift" style={{ padding: '22px', borderRadius: '20px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--primary)' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <Users size={24} />
              </div>
              <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--success)', background: 'rgba(16,185,129,0.15)', padding: '4px 10px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <TrendingUp size={14} /> {metrics?.validationRate ?? 100}% validés
              </span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1.1 }}>
              {metrics ? metrics.registeredStudents : '...'}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '6px', fontWeight: 600 }}>
              Élèves Inscrits (Dossiers Validés)
            </div>
          </div>

          {/* Card 2 : Classes en Activité */}
          <div className="glass-card hover-lift" style={{ padding: '22px', borderRadius: '20px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--secondary)' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'rgba(236, 72, 153, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)' }}>
                <Building2 size={24} />
              </div>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#ec4899', background: 'rgba(236,72,153,0.15)', padding: '4px 10px', borderRadius: '100px' }}>
                Enseignement
              </span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1.1 }}>
              {metrics ? metrics.totalClassrooms : '...'}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '6px', fontWeight: 600 }}>
              Classes & Salles ouvertes
            </div>
          </div>

          {/* Card 3 : Professeurs & Personnel */}
          <div className="glass-card hover-lift" style={{ padding: '22px', borderRadius: '20px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--warning)' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warning)' }}>
                <UserCheck size={24} />
              </div>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#f59e0b', background: 'rgba(245,158,11,0.15)', padding: '4px 10px', borderRadius: '100px' }}>
                {metrics ? `${metrics.teacherCount} Enseignants` : '...'}
              </span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1.1 }}>
              {metrics ? metrics.totalStaff : '...'}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '6px', fontWeight: 600 }}>
              Corps Enseignant & Personnel Administratif
            </div>
          </div>

          {/* Card 4 : Examens & Évaluations Programmées */}
          <div className="glass-card hover-lift" style={{ padding: '22px', borderRadius: '20px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: '#10b981' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                <Award size={24} />
              </div>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#10b981', background: 'rgba(16,185,129,0.15)', padding: '4px 10px', borderRadius: '100px' }}>
                Session Active
              </span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1.1 }}>
              {metrics ? metrics.totalEvaluations : '...'}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '6px', fontWeight: 600 }}>
              Sessions d'Évaluations & Examens
            </div>
          </div>
        </div>
      </div>

      {/* RECENT INSCRIPTIONS (LISTE RESPONSIVE) */}
      <div className="glass-panel" style={{ padding: '22px', borderRadius: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            Dernières inscriptions enregistrées
          </h2>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Temps réel</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {data?.recentEnrolments.map((item) => (
            <div
              key={item.id}
              className="glass-card"
              style={{
                padding: '14px 18px',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(255,255,255,0.02)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                  }}
                >
                  {item.studentName.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>{item.studentName}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Classe : {item.className} • {item.date}
                  </div>
                </div>
              </div>

              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '4px 10px',
                  borderRadius: '100px',
                  background: item.status === 'REGISTERED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  color: item.status === 'REGISTERED' ? '#10b981' : '#f59e0b',
                }}
              >
                {item.status === 'REGISTERED' ? 'Inscrit' : 'En attente'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
