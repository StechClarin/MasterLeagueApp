import React, { useState } from 'react';
import { Mail, Send, User } from 'lucide-react';

const Messages: React.FC = () => {
  const [activeMessage, setActiveMessage] = useState<number | null>(0);

  const messages = [
    {
      id: 0,
      sender: 'Administration',
      subject: 'Convocation réunion parents-profs',
      date: 'Aujourd\'hui, 10:30',
      content: 'Bonjour,\\n\\nNous vous rappelons que la réunion parents-professeurs se tiendra ce vendredi 18 Juin à 17h00 dans la salle polyvalente.\\n\\nCordialement,\\nL\'Administration.',
      unread: true
    },
    {
      id: 1,
      sender: 'Prof. Mathématiques',
      subject: 'Devoir de rattrapage',
      date: 'Hier, 14:15',
      content: 'Bonjour John,\\n\\nSuite à votre absence justifiée lors du dernier devoir, une session de rattrapage est organisée ce mercredi à 14h00.\\n\\nMerci de confirmer votre présence.',
      unread: false
    },
    {
      id: 2,
      sender: 'Comptabilité',
      subject: 'Reçu de paiement',
      date: '12 Juin 2026',
      content: 'Bonjour,\\n\\nNous vous confirmons la bonne réception de votre paiement de 150 $ pour le mois de Juin. Le reçu est disponible dans l\'onglet "Paiements".\\n\\nMerci.',
      unread: false
    }
  ];

  return (
    <div className="animate-fade-in" style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <h1 className="page-title">Messagerie</h1>
        <p className="page-subtitle">Communiquez avec l'administration et vos professeurs.</p>
      </div>

      <div className="glass-panel" style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        {/* Inbox List */}
        <div style={{ width: '350px', borderRight: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)' }}>
            <button style={{ width: '100%', background: 'var(--primary)', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'background 0.2s' }}>
              <Mail size={18} /> Nouveau Message
            </button>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {messages.map((msg, idx) => (
              <div 
                key={msg.id} 
                onClick={() => setActiveMessage(idx)}
                style={{ 
                  padding: '20px', 
                  borderBottom: '1px solid var(--glass-border)', 
                  cursor: 'pointer',
                  background: activeMessage === idx ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                  borderLeft: activeMessage === idx ? '4px solid var(--primary)' : '4px solid transparent',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ fontWeight: msg.unread ? 700 : 500, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {msg.unread && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></div>}
                    {msg.sender}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{msg.date}</div>
                </div>
                <div style={{ fontSize: '14px', fontWeight: msg.unread ? 600 : 400, color: msg.unread ? 'var(--text-main)' : 'var(--text-muted)' }}>
                  {msg.subject}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Message Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.1)' }}>
          {activeMessage !== null ? (
            <>
              <div style={{ padding: '24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                  <User size={24} />
                </div>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>{messages[activeMessage].subject}</h2>
                  <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>De : <span style={{ color: 'var(--text-main)' }}>{messages[activeMessage].sender}</span> • {messages[activeMessage].date}</div>
                </div>
              </div>
              <div style={{ flex: 1, padding: '32px', overflowY: 'auto', fontSize: '15px', lineHeight: 1.6, color: 'var(--text-main)', whiteSpace: 'pre-line' }}>
                {messages[activeMessage].content}
              </div>
              <div style={{ padding: '20px', borderTop: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', gap: '12px', background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                  <input 
                    type="text" 
                    placeholder="Écrire une réponse..." 
                    style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text-main)', padding: '8px 16px', outline: 'none', fontFamily: 'Outfit' }} 
                  />
                  <button style={{ background: 'var(--primary)', color: 'white', border: 'none', width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              Sélectionnez un message pour le lire.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
