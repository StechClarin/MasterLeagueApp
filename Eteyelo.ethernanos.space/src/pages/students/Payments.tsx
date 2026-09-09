import React, { useState } from 'react';
import { Download, CheckCircle, Wallet, TrendingUp, AlertCircle, CreditCard, Phone, X } from 'lucide-react';

interface PaidInvoice {
  id: string;
  date: string;
  amount: number;
  description: string;
  status: string;
}

interface DueInvoice {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
}

const todayLabel = new Date().toLocaleDateString('fr-FR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

const initialHistory: PaidInvoice[] = [
  { id: 'INV-2026-06', date: '12 Juin 2026', amount: 150, description: 'Scolarité Juin 2026', status: 'Payé' },
  { id: 'INV-2026-05', date: '10 Mai 2026', amount: 150, description: 'Scolarité Mai 2026', status: 'Payé' },
  { id: 'INV-2026-04', date: '11 Avril 2026', amount: 150, description: 'Scolarité Avril 2026', status: 'Payé' },
  { id: 'FEE-LAB-01', date: '05 Mars 2026', amount: 75, description: 'Frais de laboratoire', status: 'Payé' },
];

const initialDue: DueInvoice[] = [
  { id: 'INV-2026-07', description: 'Scolarité Juillet 2026', amount: 150, dueDate: 'Échéance 01/07/2026' },
  { id: 'INV-2026-08', description: 'Scolarité Août 2026', amount: 150, dueDate: 'Échéance 01/08/2026' },
  { id: 'FEE-EXAM-01', description: 'Frais d’examen blanc', amount: 75, dueDate: 'Échéance 22/06/2026' },
  { id: 'FEE-TRANSP-03', description: 'Transport (3e trimestre)', amount: 50, dueDate: 'Échéance 30/06/2026' },
];

type PayStep = 'method' | 'processing' | 'success';

const Payments: React.FC = () => {
  const [history, setHistory] = useState<PaidInvoice[]>(initialHistory);
  const [dueInvoices, setDueInvoices] = useState<DueInvoice[]>(initialDue);

  // Processus de paiement (simulation Mobile Money, en attendant l'API réelle).
  const [paying, setPaying] = useState<DueInvoice | null>(null);
  const [payStep, setPayStep] = useState<PayStep>('method');
  const [momoPhone, setMomoPhone] = useState('+241 06 00 00 000');
  const [payError, setPayError] = useState<string | null>(null);
  const [payReference, setPayReference] = useState('');

  const dejaPaye = history.reduce((sum, item) => sum + item.amount, 0);
  const upcomingTotal = dueInvoices.reduce((sum, item) => sum + item.amount, 0);
  const totalAPayer = dejaPaye + upcomingTotal;
  const resteAPayer = upcomingTotal;
  const progressPercentage = totalAPayer > 0 ? (dejaPaye / totalAPayer) * 100 : 0;

  const startPayment = (invoice: DueInvoice) => {
    setPaying(invoice);
    setPayStep('method');
    setPayError(null);
    setMomoPhone('+241 06 00 00 000');
    setPayReference('');
  };

  const launchPayment = () => {
    const digits = momoPhone.replace(/\D/g, '');
    if (digits.length < 8) {
      setPayError('Saisissez un numéro de téléphone valide (8 à 15 chiffres).');
      return;
    }
    setPayError(null);
    setPayStep('processing');
    window.setTimeout(() => {
      const ref = `REF-${Math.floor(100000 + Math.random() * 900000)}`;
      setPayReference(ref);
      setPayStep('success');
    }, 1800);
  };

  const confirmSuccess = () => {
    if (paying) {
      setHistory((prev) => [
        { id: paying.id, date: todayLabel, amount: paying.amount, description: paying.description, status: 'Payé' },
        ...prev,
      ]);
      setDueInvoices((prev) => prev.filter((inv) => inv.id !== paying.id));
    }
    setPaying(null);
    setPayStep('method');
    setPayError(null);
  };

  const closeModal = () => {
    setPaying(null);
    setPayStep('method');
    setPayError(null);
  };

  const spinner = (
    <span
      style={{
        display: 'inline-block',
        width: '20px',
        height: '20px',
        border: '3px solid rgba(255,255,255,0.35)',
        borderTopColor: 'white',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}
    />
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Finances & Paiements</h1>
        <p className="page-subtitle">Suivez vos échéances, payez en ligne et consultez votre historique.</p>
      </div>

      {/* Dashboard Financier */}
      <div className="grid-cards" style={{ marginBottom: '40px' }}>
        <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(99, 102, 241, 0.05))', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-label">Total Annuel à Payer</div>
            <Wallet color="var(--primary)" />
          </div>
          <div className="stat-value">{totalAPayer.toLocaleString('fr-FR')} $</div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Frais de scolarité et annexes</p>
        </div>

        <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05))', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-label" style={{ color: 'var(--success)' }}>Déjà Payé</div>
            <TrendingUp color="var(--success)" />
          </div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>{dejaPaye.toLocaleString('fr-FR')} $</div>
          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', marginTop: '12px', overflow: 'hidden' }}>
            <div style={{ width: `${progressPercentage}%`, height: '100%', background: 'var(--success)', borderRadius: '3px' }} />
          </div>
        </div>

        <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-label" style={{ color: 'var(--danger)' }}>Reste à Payer</div>
            <AlertCircle color="var(--danger)" />
          </div>
          <div className="stat-value" style={{ color: 'var(--danger)' }}>{resteAPayer.toLocaleString('fr-FR')} $</div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{dueInvoices.length} échéance(s) en attente</p>
        </div>
      </div>

      {/* Prochains paiements */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <div style={{ background: 'rgba(245, 158, 11, 0.2)', padding: '10px', borderRadius: '10px', display: 'flex' }}>
          <CreditCard size={22} color="var(--warning)" />
        </div>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Prochains paiements</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {dueInvoices.length > 0
              ? 'Cliquez sur « Payer » pour régler une échéance par Mobile Money.'
              : 'Aucune échéance en attente. 🎉'}
          </p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '20px', marginBottom: '40px' }}>
        {dueInvoices.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {dueInvoices.map((inv) => (
              <div
                key={inv.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  flexWrap: 'wrap',
                  padding: '16px 20px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '14px',
                  transition: 'border-color 0.2s ease, background 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: 'rgba(245, 158, 11, 0.12)',
                      color: 'var(--warning)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Wallet size={20} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{inv.description}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {inv.id} · {inv.dueDate}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--warning)' }}>{inv.amount.toLocaleString('fr-FR')} $</div>
                  <button
                    onClick={() => startPayment(inv)}
                    style={{
                      padding: '10px 20px',
                      background: 'var(--primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 6px 16px rgba(99,102,241,0.3)',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    }}
                    className="hover-lift"
                  >
                    <CreditCard size={18} /> Payer
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
            Tous vos frais sont réglés. Rien à payer pour le moment.
          </div>
        )}
      </div>

      {/* Historique des transactions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '10px', borderRadius: '10px', display: 'flex' }}>
          <Download size={22} color="var(--primary)" />
        </div>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Historique des paiements</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Reçus et transactions déjà réglés.</p>
        </div>
      </div>

      <div className="glass-panel">
        <div className="table-wrap">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
                <th style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>ID Facture</th>
                <th style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>Date</th>
                <th style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>Description</th>
                <th style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>Montant</th>
                <th style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>Statut</th>
                <th style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)', textAlign: 'right' }}>Reçu</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item, idx) => (
                <tr key={item.id} style={{ transition: 'background 0.2s ease' }}>
                  <td style={{ padding: '20px', borderBottom: idx !== history.length - 1 ? '1px solid var(--glass-border)' : 'none', fontWeight: 600 }}>{item.id}</td>
                  <td style={{ padding: '20px', borderBottom: idx !== history.length - 1 ? '1px solid var(--glass-border)' : 'none', color: 'var(--text-main)' }}>{item.date}</td>
                  <td style={{ padding: '20px', borderBottom: idx !== history.length - 1 ? '1px solid var(--glass-border)' : 'none', color: 'var(--text-muted)' }}>{item.description}</td>
                  <td style={{ padding: '20px', borderBottom: idx !== history.length - 1 ? '1px solid var(--glass-border)' : 'none', fontWeight: 600, color: 'var(--primary)' }}>{item.amount.toLocaleString('fr-FR')} $</td>
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
      </div>

      {/* Modal de paiement */}
      {paying && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(2, 6, 23, 0.7)',
            backdropFilter: 'blur(6px)',
            padding: '16px',
          }}
          onClick={payStep !== 'processing' ? closeModal : undefined}
        >
          <div
            className="glass-panel animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '440px',
              padding: '28px',
              borderRadius: '20px',
              boxShadow: '0 25px 60px -12px rgba(0,0,0,0.6)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {payStep === 'method' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(99,102,241,0.15)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <CreditCard size={24} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>Payer une échéance</h2>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{paying.id} · {paying.description}</div>
                    </div>
                  </div>
                  <button
                    onClick={closeModal}
                    aria-label="Fermer"
                    style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: 'var(--text-muted)', width: '34px', height: '34px', borderRadius: '50%', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                  >
                    <X size={18} />
                  </button>
                </div>

                <div style={{ textAlign: 'center', padding: '18px', background: 'rgba(255,255,255,0.03)', border: '1px dashed var(--glass-border)', borderRadius: '14px', marginBottom: '20px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Montant à payer</div>
                  <div style={{ fontSize: '34px', fontWeight: 900, color: 'var(--text-main)', marginTop: '4px' }}>
                    {paying.amount.toLocaleString('fr-FR')} <span style={{ fontSize: '18px' }}>$</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--warning)', marginTop: '4px' }}>{paying.dueDate}</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Numéro Mobile Money
                  </label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}>
                      <Phone size={18} />
                    </div>
                    <input
                      type="tel"
                      className="auth-input"
                      style={{ paddingLeft: '44px', fontFamily: 'inherit' }}
                      value={momoPhone}
                      onChange={(e) => {
                        setMomoPhone(e.target.value);
                        setPayError(null);
                      }}
                      placeholder="+241 06 00 00 000"
                    />
                  </div>
                </div>

                {payError && (
                  <div style={{ color: '#fca5a5', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', padding: '10px 12px', borderRadius: '10px', fontSize: '13px', margin: '10px 0' }}>
                    {payError}
                  </div>
                )}

                <button
                  onClick={launchPayment}
                  style={{
                    width: '100%',
                    marginTop: '14px',
                    padding: '14px 20px',
                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '16px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
                  }}
                >
                  <Wallet size={18} />
                  Payer {paying.amount.toLocaleString('fr-FR')} $
                </button>

                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '11px', marginTop: '12px', lineHeight: 1.5 }}>
                  Simulation de paiement Mobile Money (démo). La confirmation reçoit une référence de transaction.
                </p>
              </>
            )}

            {payStep === 'processing' && (
              <div style={{ textAlign: 'center', padding: '28px 8px' }}>
                <div style={{ width: '72px', height: '72px', margin: '0 auto 20px', borderRadius: '50%', background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {spinner}
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>Traitement du paiement…</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '8px', lineHeight: 1.6 }}>
                  {paying.amount.toLocaleString('fr-FR')} $ · {paying.description}
                  <br />
                  Confirmez la demande sur votre téléphone si vous êtes notifié.
                </p>
              </div>
            )}

            {payStep === 'success' && (
              <div style={{ textAlign: 'center', padding: '20px 8px' }}>
                <div style={{ width: '84px', height: '84px', margin: '0 auto 18px', borderRadius: '50%', background: 'rgba(34,197,94,0.12)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 8px rgba(34,197,94,0.08)' }}>
                  <CheckCircle size={44} />
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-main)' }}>Paiement confirmé 🎉</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '10px', lineHeight: 1.6 }}>
                  {paying.amount.toLocaleString('fr-FR')} $ réglés pour {paying.description}.
                </p>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '14px', padding: '8px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', fontSize: '14px', color: 'var(--text-main)', flexWrap: 'wrap', justifyContent: 'center' }}>
                  Réf. transaction : <strong style={{ color: 'var(--success)' }}>{payReference}</strong>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>Le reçu est disponible dans l'historique.</div>
                <button
                  onClick={confirmSuccess}
                  className="hover-lift"
                  style={{
                    width: '100%',
                    marginTop: '20px',
                    padding: '13px 20px',
                    background: 'var(--success)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '15px',
                    cursor: 'pointer',
                  }}
                >
                  Terminer
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
