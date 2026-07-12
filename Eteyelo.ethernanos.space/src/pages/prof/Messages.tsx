import React, { useState } from 'react';
import { Send, Search, Users, ShieldAlert, Paperclip } from 'lucide-react';

const messagesData = [
  { id: 1, sender: 'Direction', role: 'Admin', subject: 'Réunion Pédagogique', snippet: 'N\'oubliez pas la réunion de demain à 14h en salle des profs...', time: '10:30', unread: true },
  { id: 2, sender: 'Marie Dupont', role: 'Élève (Tle S)', subject: 'Question DM Math', snippet: 'Bonjour M. Martin, je bloque sur l\'exercice 3 du DM...', time: 'Hier', unread: false },
  { id: 3, sender: 'Parents de Léo', role: 'Parents', subject: 'Absence Léo', snippet: 'Léo sera absent ce jeudi pour des raisons médicales...', time: '12 Juin', unread: false },
];

const MessagesProf: React.FC = () => {
  const [selectedMsg, setSelectedMsg] = useState(messagesData[0]);

  return (
    <div className="animate-fade-in" style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header">
        <h1 className="page-title">Messagerie</h1>
        <p className="page-subtitle">Communiquez avec la direction, les élèves et les parents.</p>
      </div>

      <div className="glass-panel" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Liste des messages */}
        <div style={{ width: '350px', borderRight: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)' }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder="Rechercher..." 
                style={{ 
                  width: '100%', padding: '10px 10px 10px 36px', 
                  background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', 
                  borderRadius: '8px', color: 'var(--text-main)', outline: 'none'
                }} 
              />
            </div>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {messagesData.map((msg) => (
              <div 
                key={msg.id} 
                onClick={() => setSelectedMsg(msg)}
                style={{ 
                  padding: '20px', 
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  cursor: 'pointer',
                  background: selectedMsg.id === msg.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                  borderLeft: msg.unread ? '4px solid var(--primary)' : '4px solid transparent',
                  transition: 'all 0.2s ease'
                }}
                className="hover-bg"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ fontWeight: msg.unread ? 700 : 500, color: 'var(--text-main)' }}>{msg.sender}</div>
                  <div style={{ fontSize: '12px', color: msg.unread ? 'var(--primary)' : 'var(--text-muted)' }}>{msg.time}</div>
                </div>
                <div style={{ fontSize: '12px', color: msg.role === 'Admin' ? 'var(--danger)' : 'var(--accent)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {msg.role === 'Admin' ? <ShieldAlert size={12} /> : <Users size={12} />}
                  {msg.role}
                </div>
                <div style={{ fontSize: '14px', fontWeight: msg.unread ? 600 : 500, marginBottom: '4px' }}>{msg.subject}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {msg.snippet}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Corps du message */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.1)' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>{selectedMsg.subject}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>
                <span>De: <strong style={{ color: 'var(--text-main)' }}>{selectedMsg.sender}</strong></span>
                <span style={{ padding: '2px 8px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', fontSize: '12px' }}>{selectedMsg.role}</span>
              </div>
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{selectedMsg.time}</div>
          </div>
          
          <div style={{ flex: 1, padding: '24px', overflowY: 'auto', fontSize: '15px', lineHeight: 1.6, color: 'var(--text-main)' }}>
            <p>Bonjour,</p>
            <p style={{ marginTop: '16px' }}>{selectedMsg.snippet}</p>
            <p style={{ marginTop: '16px' }}>Merci de me tenir informé.</p>
            <p style={{ marginTop: '32px' }}>Cordialement.</p>
          </div>

          <div style={{ padding: '20px', borderTop: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button style={{ background: 'rgba(255,255,255,0.1)', border: 'none', width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)', cursor: 'pointer' }}>
                <Paperclip size={20} />
              </button>
              <input 
                type="text" 
                placeholder="Répondre..." 
                style={{ 
                  flex: 1, padding: '14px 20px', 
                  background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', 
                  borderRadius: '12px', color: 'var(--text-main)', outline: 'none'
                }} 
              />
              <button style={{ background: 'var(--primary)', border: 'none', width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }} className="hover-lift">
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesProf;
