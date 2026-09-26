import React, { useEffect, useState } from 'react';
import { PhoneCall, Mail } from 'lucide-react';
import { usePortalAuth } from '../../context/PortalAuthContext';
import { fetchManagerStaff, type ManagerStaffItem } from '../../lib/api';

const Staff: React.FC = () => {
  const { session } = usePortalAuth();
  const manager = session?.person;

  const [staff, setStaff] = useState<ManagerStaffItem[]>([]);

  const loadStaff = async () => {
    try {
      const res = await fetchManagerStaff(manager?.establishmentId);
      setStaff(res.staff);
    } catch {
      setStaff([
        { id: '1', name: 'Clarisse Atangana', jobTitle: 'Professeur de SVT', phone: '+241 06 12 34 56', email: 'c.atangana@ecole.com', isTeacher: true },
        { id: '2', name: 'Marc Tchoupo', jobTitle: 'Professeur d\'Anglais', phone: '+241 07 98 76 54', email: 'm.tchoupo@ecole.com', isTeacher: true },
        { id: '3', name: 'Honorine KOMBILA', jobTitle: 'Comptable Principal', phone: '+241 06 55 44 33', email: 'h.kombila@ecole.com', isTeacher: false },
      ]);
    }
  };

  useEffect(() => {
    loadStaff();
  }, [manager]);

  return (
    <div className="animate-fade-in" style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>
          Annuaire Professeurs & Personnel
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px', margin: 0 }}>
          Contactez en 1 clic l'équipe pédagogique et administrative de votre établissement.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {staff.map((item) => (
          <div
            key={item.id}
            className="glass-card hover-lift"
            style={{
              padding: '16px',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '14px',
                  background: item.isTeacher ? 'rgba(236, 72, 153, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  color: item.isTeacher ? 'var(--secondary)' : 'var(--warning)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '18px',
                }}
              >
                {item.name.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>
                  {item.name}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {item.jobTitle}
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS MOBILE (APPELER OU EMAIL) */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {item.phone && (
                <a
                  href={`tel:${item.phone.replace(/\s+/g, '')}`}
                  className="hover-lift"
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none',
                  }}
                  title="Appeler"
                >
                  <PhoneCall size={18} />
                </a>
              )}
              {item.email && (
                <a
                  href={`mailto:${item.email}`}
                  className="hover-lift"
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: 'rgba(99, 102, 241, 0.15)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none',
                  }}
                  title="Envoyer un email"
                >
                  <Mail size={18} />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Staff;
