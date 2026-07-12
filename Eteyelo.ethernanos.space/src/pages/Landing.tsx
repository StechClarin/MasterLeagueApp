import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Users, LayoutDashboard, Sparkles, BookOpen, ShieldCheck, ChevronRight, CalendarDays, Wallet, BarChart3, MessageCircle, Star, FileText } from 'lucide-react';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    { icon: <BookOpen size={24} />, title: 'Structure & Pédagogie', desc: 'Gestion complète des années académiques, classes, matières, salles et affectations des enseignants.', color: 'var(--primary)' },
    { icon: <GraduationCap size={24} />, title: 'Dossiers Étudiants', desc: 'Suivi rigoureux du cursus de chaque élève, de la pré-inscription jusqu\'à l\'obtention du diplôme.', color: '#8b5cf6' },
    { icon: <CalendarDays size={24} />, title: 'Évaluations & Bulletins', desc: 'Planification d\'examens, saisie décentralisée des notes par les profs et génération automatisée de bulletins.', color: 'var(--secondary)' },
    { icon: <Wallet size={24} />, title: 'Finance & Trésorerie', desc: 'Contrôle des frais de scolarité, suivi des paiements, édition de reçus et rapports de recouvrement.', color: 'var(--success)' },
    { icon: <Users size={24} />, title: 'Ressources Humaines', desc: 'Gestion du personnel, des professeurs, des profils utilisateurs et contrôle strict des accès (RBAC).', color: 'var(--warning)' },
    { icon: <FileText size={24} />, title: 'Gestion Documentaire', desc: 'Génération et impression massive de certificats, relevés de notes et documents administratifs officiels.', color: 'var(--accent)' },
  ];

  return (
    <div className="animate-fade-in" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)' }}>
      {/* HEADER */}
      <header style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--glass-border)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '24px',
            fontWeight: 900,
            boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)'
          }}>
            E
          </div>
          <span style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Eteyelo</span>
        </div>
        
        <div style={{ display: 'flex', gap: '16px' }}>
          <button 
            onClick={() => navigate('/prof')}
            className="hover-bg"
            style={{ padding: '10px 20px', background: 'transparent', color: 'var(--text-main)', border: '1px solid var(--glass-border)', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, transition: 'all 0.3s' }}
          >
            Espace Professeur
          </button>
          <button 
            onClick={() => navigate('/student')}
            className="hover-lift"
            style={{ padding: '10px 24px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)' }}
          >
            Espace Étudiant
            <ChevronRight size={18} />
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 20px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        
        {/* Glow Effects */}
        <div style={{ position: 'absolute', top: '10%', left: '15%', width: '500px', height: '500px', background: 'rgba(99, 102, 241, 0.12)', filter: 'blur(120px)', borderRadius: '50%', zIndex: 0, pointerEvents: 'none' }}></div>
        <div style={{ position: 'absolute', bottom: '10%', right: '15%', width: '500px', height: '500px', background: 'rgba(236, 72, 153, 0.08)', filter: 'blur(120px)', borderRadius: '50%', zIndex: 0, pointerEvents: 'none' }}></div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '900px', width: '100%' }}>
          
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '100px', marginBottom: '32px', color: 'var(--text-main)', fontSize: '14px', fontWeight: 700, backdropFilter: 'blur(10px)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
            <Sparkles size={16} color="var(--accent)" />
            <span style={{ background: 'linear-gradient(90deg, #fff, #cbd5e1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Le standard de l'Excellence Éducative
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(48px, 6vw, 72px)', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-2px' }}>
            Transformez la gestion de votre <br />
            <span style={{ position: 'relative', display: 'inline-block' }}>
              <span style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', position: 'relative', zIndex: 2 }}>
                Établissement Scolaire.
              </span>
              <svg style={{ position: 'absolute', bottom: '-10px', left: 0, width: '100%', zIndex: 1 }} viewBox="0 0 300 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 15 Q 150 0 295 15" fill="none" stroke="rgba(99, 102, 241, 0.5)" strokeWidth="6" strokeLinecap="round"/>
              </svg>
            </span>
          </h1>

          <p style={{ fontSize: '20px', color: 'var(--text-muted)', marginBottom: '56px', lineHeight: 1.6, maxWidth: '700px', margin: '0 auto 56px auto' }}>
            Eteyelo est l'ERP unifié (Kelassy) qui centralise la scolarité, la finance et la pédagogie. Une plateforme conçue pour les écoles, lycées et universités exigeants.
          </p>

          <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={() => navigate('/student')}
              className="glass-card hover-lift"
              style={{ position: 'relative', overflow: 'hidden', padding: '32px', background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', cursor: 'pointer', width: '280px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, var(--primary), var(--accent))' }}></div>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <GraduationCap size={40} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>Espace Étudiant</span>
                <span style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.5, display: 'block' }}>Consultez vos notes, votre emploi du temps et vos paiements en temps réel.</span>
              </div>
            </button>

            <button 
              onClick={() => navigate('/prof')}
              className="glass-card hover-lift"
              style={{ position: 'relative', overflow: 'hidden', padding: '32px', background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', cursor: 'pointer', width: '280px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, var(--secondary), var(--warning))' }}></div>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(236, 72, 153, 0.1)', border: '1px solid rgba(236, 72, 153, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)' }}>
                <Users size={40} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>Espace Professeur</span>
                <span style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.5, display: 'block' }}>Saisissez vos notes, gérez vos évaluations et suivez vos classes avec précision.</span>
              </div>
            </button>
          </div>

          {/* Trust Indicators */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '40px', marginTop: '64px', opacity: 0.6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
              <Star size={18} color="var(--warning)" fill="var(--warning)" /> Excellence
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
              <ShieldCheck size={18} color="var(--success)" /> 100% Sécurisé
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
              <LayoutDashboard size={18} color="var(--primary)" /> Architecture Modulaire
            </div>
          </div>
        </div>
      </main>

      {/* BENTO GRID FEATURES SECTION */}
      <section style={{ padding: '100px 40px', background: '#090e17', position: 'relative', borderTop: '1px solid var(--glass-border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{ fontSize: '40px', fontWeight: 900, color: 'var(--text-main)', marginBottom: '16px', letterSpacing: '-1px' }}>Tout ce dont votre école a besoin.</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
              Une suite complète d'outils interconnectés pour digitaliser 100% de vos processus métiers.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {features.map((feature, idx) => (
              <div key={idx} className="glass-card hover-lift" style={{ padding: '32px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', transition: 'all 0.3s' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `color-mix(in srgb, ${feature.color} 15%, transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: feature.color, marginBottom: '20px' }}>
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '12px' }}>{feature.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.6 }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section style={{ padding: '100px 40px', background: 'linear-gradient(180deg, #090e17 0%, rgba(15, 23, 42, 1) 100%)', textAlign: 'center' }}>
        <div className="glass-panel" style={{ maxWidth: '800px', margin: '0 auto', padding: '64px 40px', borderRadius: '32px', border: '1px solid rgba(99, 102, 241, 0.3)', background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.1) 0%, transparent 70%)' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 900, color: 'white', marginBottom: '20px' }}>Prêt à moderniser votre établissement ?</h2>
          <p style={{ fontSize: '18px', color: 'var(--text-muted)', marginBottom: '40px', maxWidth: '500px', margin: '0 auto 40px auto' }}>
            Eteyelo est la solution définitive pour dire adieu au papier et aux processus manuels.
          </p>
          <button style={{ padding: '16px 32px', background: 'white', color: '#0f172a', border: 'none', borderRadius: '100px', fontSize: '16px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 10px 25px rgba(255,255,255,0.2)', transition: 'transform 0.2s' }} className="hover-lift">
            Contacter l'Administration
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '32px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--glass-border)', background: 'var(--bg-main)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: 900 }}>E</div>
          <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>Eteyelo</span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500 }}>
          © {new Date().getFullYear()} Développé par EtherNanos. Tous droits réservés.
        </p>
      </footer>
    </div>
  );
};

export default Landing;
