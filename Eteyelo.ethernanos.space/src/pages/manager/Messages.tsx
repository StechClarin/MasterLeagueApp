import React from 'react';
import { Send } from 'lucide-react';

const Messages: React.FC = () => {
  return (
    <div className="animate-fade-in" style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>
          Annonces & Communications Mobile
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px', margin: 0 }}>
          Diffusez des notifications d'urgence ou des notes de service aux parents et enseignants.
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '20px', borderRadius: '20px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '14px' }}>
          Nouvelle annonce aux parents / staff
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <input
            type="text"
            className="auth-input"
            placeholder="Sujet de l'annonce (ex: Réunion de rentrée, Paiement des bulletins)"
          />
          <textarea
            className="auth-input"
            rows={4}
            placeholder="Rédigez votre message aux familles ou à l'équipe pédagogique..."
            style={{ resize: 'vertical' }}
          />

          <button
            className="auth-btn hover-lift"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: '12px' }}
          >
            <Send size={18} />
            <span>Envoyer la notification par SMS & App</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Messages;
