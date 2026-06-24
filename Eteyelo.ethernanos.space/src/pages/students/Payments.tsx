import React from 'react';
import { Download, CheckCircle, Wallet, TrendingUp, AlertCircle } from 'lucide-react';

const Payments: React.FC = () => {
  const history = [
    { id: 'INV-2026-06', date: '12 Juin 2026', amount: 150, description: 'Scolarité Juin 2026', status: 'Payé' },
    { id: 'INV-2026-05', date: '10 Mai 2026', amount: 150, description: 'Scolarité Mai 2026', status: 'Payé' },
    { id: 'INV-2026-04', date: '11 Avril 2026', amount: 150, description: 'Scolarité Avril 2026', status: 'Payé' },
    { id: 'FEE-LAB-01', date: '05 Mars 2026', amount: 75, description: 'Frais de laboratoire', status: 'Payé' },
  ];

  const totalAPayer = 1500; // Mock total for the year
  const dejaPaye = history.reduce((sum, item) => sum + item.amount, 0);
  const resteAPayer = totalAPayer - dejaPaye;

  const progressPercentage = (dejaPaye / totalAPayer) * 100;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Finances & Paiements</h1>
        <p className="page-subtitle">Suivez votre situation financière et l'historique de vos transactions.</p>
      </div>

      {/* Dashboard Financier */}
      <div className="grid-cards" style={{ marginBottom: '40px' }}>
        <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(99, 102, 241, 0.05))', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-label">Total Annuel à Payer</div>
            <Wallet color="var(--primary)" />
          </div>
          <div className="stat-value">{totalAPayer} $</div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Frais de scolarité et annexes</p>
        </div>

        <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05))', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-label" style={{ color: 'var(--success)' }}>Déjà Payé</div>
            <TrendingUp color="var(--success)" />
          </div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>{dejaPaye} $</div>
          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', marginTop: '12px', overflow: 'hidden' }}>
            <div style={{ width: `${progressPercentage}%`, height: '100%', background: 'var(--success)', borderRadius: '3px' }}></div>
          </div>
        </div>

        <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-label" style={{ color: 'var(--danger)' }}>Reste à Payer</div>
            <AlertCircle color="var(--danger)" />
          </div>
          <div className="stat-value" style={{ color: 'var(--danger)' }}>{resteAPayer} $</div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Échéances futures et dettes</p>
        </div>
      </div>

      <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>Historique des Transactions</h2>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
              <th style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>ID Facture</th>
              <th style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>Date</th>
              <th style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>Description</th>
              <th style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>Montant</th>
              <th style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>Statut</th>
              <th style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item, idx) => (
              <tr key={item.id} style={{ transition: 'background 0.2s ease' }} className="hover-row">
                <td style={{ padding: '20px', borderBottom: idx !== history.length - 1 ? '1px solid var(--glass-border)' : 'none', fontWeight: 600 }}>{item.id}</td>
                <td style={{ padding: '20px', borderBottom: idx !== history.length - 1 ? '1px solid var(--glass-border)' : 'none', color: 'var(--text-main)' }}>{item.date}</td>
                <td style={{ padding: '20px', borderBottom: idx !== history.length - 1 ? '1px solid var(--glass-border)' : 'none', color: 'var(--text-muted)' }}>{item.description}</td>
                <td style={{ padding: '20px', borderBottom: idx !== history.length - 1 ? '1px solid var(--glass-border)' : 'none', fontWeight: 600, color: 'var(--primary)' }}>{item.amount} $</td>
                <td style={{ padding: '20px', borderBottom: idx !== history.length - 1 ? '1px solid var(--glass-border)' : 'none' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)', padding: '6px 12px', borderRadius: '12px', fontSize: '14px', fontWeight: 500 }}>
                    <CheckCircle size={16} />
                    {item.status}
                  </div>
                </td>
                <td style={{ padding: '20px', borderBottom: idx !== history.length - 1 ? '1px solid var(--glass-border)' : 'none', textAlign: 'right' }}>
                  <button style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-main)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}>
                    <Download size={16} /> Reçu
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <style>{`
        .hover-row:hover {
          background: rgba(255, 255, 255, 0.03);
        }
      `}</style>
    </div>
  );
};

export default Payments;
