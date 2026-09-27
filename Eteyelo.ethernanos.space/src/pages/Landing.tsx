import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import {
  GraduationCap,
  Users,
  ChevronRight,
  ChevronLeft,
  CalendarDays,
  Wallet,
  Building2,
  Menu,
  X,
  Lock,
  Laptop,
  HelpCircle,
  ChevronDown,
  Layers,
  Activity,
  TrendingUp,
  LineChart,
  FileCheck,
  CheckCircle2,
  ExternalLink,
  Send,
  Mail,
  Phone,
  User,
  ShoppingCart,
  MessageSquare
} from 'lucide-react';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDemoTab, setActiveDemoTab] = useState<'graph' | 'dashboard' | 'bulletins' | 'mobile'>('graph');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Formulaire de contact pour achat
  const [contactForm, setContactForm] = useState({
    fullName: '',
    schoolName: '',
    phone: '',
    email: '',
    message: ''
  });
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    const messageData = {
      name: contactForm.fullName + (contactForm.schoolName ? ` (${contactForm.schoolName})` : ''),
      email: contactForm.email || 'demande-eteyelo@ethernanos.space',
      subject: `[ETEYELO ACHAT] Demande de ${contactForm.fullName} - ${contactForm.schoolName || 'Établissement'}`,
      content: `🛒 DEMANDE D'ACHAT APPLICATION ETEYELO\n\n` +
               `👤 Nom complet: ${contactForm.fullName}\n` +
               `🏫 Établissement / École: ${contactForm.schoolName}\n` +
               `📞 Téléphone / WhatsApp: ${contactForm.phone}\n` +
               `✉️ E-mail: ${contactForm.email || 'Non renseigné'}\n\n` +
               `💬 Message / Besoin:\n${contactForm.message || 'Aucun message spécifique.'}`
    };

    try {
      const { error } = await supabase.from('messages').insert([messageData]);
      if (error) {
        console.error('Supabase error inserting message:', error);
        throw error;
      }
      setContactSubmitted(true);
    } catch (err: any) {
      console.error('Error submitting contact form:', err);
      setSubmitError("Une erreur est survenue lors de l'envoi de votre message. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  // Slides du Carrousel : 1 spéciale EtherNanos Hub (avec logo & bouton), les autres sur les fonctionnalités (sans logo ni bouton)
  const carouselSlides = [
    {
      isEtherNanosSpecial: true,
      badge: "🌐 ÉCOSYSTÈME CLOUD-TO-LOCAL",
      title: "EtherNanos Hub — La Passerelle Applicative Unifiée",
      desc: "Découvrez l'écosystème Cloud-to-Local d'EtherNanos. Une plateforme de bureau intelligente qui synchronise vos données locales avec le Cloud, garantit le fonctionnement hors-ligne et sécurise vos applications scolaires.",
      points: [
        "Synchronisation intelligente Cloud-to-Local",
        "Mises à jour automatisées & sécurité avancé",
        "Expérience App Store fluide et isolation des données"
      ],
      accentColor: "var(--primary)",
      type: "cloud"
    },
    {
      isEtherNanosSpecial: false,
      badge: "📈 SUIVI PÉDAGOGIQUE",
      title: "Courbe d'Évolution des Notes & Détection des Progrès",
      desc: "Visualisez l'évolution des notes de chaque élève au fil des trimestres. Les enseignants et les parents peuvent suivre la progression matière par matière et anticiper les besoins d'accompagnement.",
      points: [
        "Graphiques visuels d'évolution par matière (Maths, Français, Sciences...)",
        "Détection automatique des baisses de notes avant les examens",
        "Consultation simple sur téléphone et ordinateur"
      ],
      accentColor: "#10b981",
      type: "graph"
    },
    {
      isEtherNanosSpecial: false,
      badge: "📑 ÉDITION DES BULLETINS",
      title: "Calcul Automatique des Moyennes & Bulletins PDF",
      desc: "Générez et imprimez en 1 clic les bulletins de trimestre officiels. L'application calcule automatiquement les moyennes coefficientées, les rangs et attribue les mentions du conseil de classe.",
      points: [
        "Calcul instantané des moyennes et rangs de la classe",
        "Impression des bulletins officiels en format PDF",
        "Édition des cartes scolaires sécurisées avec QR Code"
      ],
      accentColor: "var(--secondary)",
      type: "bulletin"
    },
    {
      isEtherNanosSpecial: false,
      badge: "💳 COMPTABILITÉ SCOLAIRE",
      title: "Gestion des Frais de Scolarité & Reçus Instantanés",
      desc: "Enregistrez facilement les versements de scolarité, délivrez des reçus de paiement numérotés en quelques secondes et suivez l'état des encaissements par classe.",
      points: [
        "Émission immédiate de reçus de paiement clairs",
        "Suivi des tranches de scolarité et des impayés",
        "Tableau de bord simple pour la direction de l'école"
      ],
      accentColor: "#f59e0b",
      type: "finance"
    }
  ];

  // Auto-play carrousel toutes les 6 secondes
  useEffect(() => {
    const timer = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % carouselSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [carouselSlides.length]);

  const handleNextSlide = () => {
    setCarouselIndex((prev) => (prev + 1) % carouselSlides.length);
  };

  const handlePrevSlide = () => {
    setCarouselIndex((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length);
  };

  // FAQ simples
  const faqs = [
    {
      q: "Comment les parents et les élèves se connectent-ils ?",
      a: "C'est très simple ! Les parents et les élèves entrent leur numéro de téléphone ou leur matricule. Ils reçoivent un lien d'accès direct sur leur téléphone pour consulter les notes et les bulletins sans mot de passe à retenir."
    },
    {
      q: "Comment fonctionne le suivi des notes avec les graphiques ?",
      a: "À chaque fois qu'une note est saisie par un professeur, l'application génère automatiquement une courbe d'évolution. Cela permet de voir immédiatement si l'élève progresse, stagne ou a besoin d'aide dans une matière."
    },
    {
      q: "Puis-je l'utiliser sur mon téléphone portable ?",
      a: "Oui ! L'application fonctionne sur tous les téléphones (Android, iPhone), tablettes et ordinateurs. Les directeurs et enseignants peuvent l'utiliser partout."
    },
    {
      q: "Peut-on imprimer directement les bulletins de notes ?",
      a: "Tout à fait. L'application calcule automatiquement les moyennes et les rangs de la classe, puis génère des bulletins clairs et prêts à être imprimés ou envoyés en PDF."
    },
    {
      q: "Est-ce facile à utiliser pour les enseignants et les secrétaires ?",
      a: "Oui, les écrans sont clairs et simples. Quelques minutes suffisent pour enregistrer les notes d'une classe ou délivrer un reçu de scolarité."
    }
  ];

  return (
    <div className="animate-fade-in landing-root" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-darker)' }}>
      
      {/* 1. EN-TÊTE DE NAVIGATION */}
      <header
        style={{
          padding: '16px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--glass-border)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <img src="/icons/logo_name_eth.svg" alt="EtherNanos" style={{ height: '36px', width: 'auto' }} />
        </div>

        {/* Desktop Nav Links */}
        <div className="landing-nav-desktop">
          <nav className="landing-nav-links">
            <a href="#ethernanos-hub" className="landing-nav-link">Présentation</a>
            <a href="#portails" className="landing-nav-link">Espaces Portails</a>
            <a href="#services" className="landing-nav-link">Ce que fait l'application</a>
            <a href="#demo" className="landing-nav-link">Démonstration</a>
            <a href="#faq" className="landing-nav-link">FAQ</a>
            <a href="#contact-achat" className="landing-nav-link" style={{ color: 'var(--primary)', fontWeight: 800 }}>Acheter / Contacter</a>
          </nav>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={() => navigate('/auth?space=prof')}
              className="hover-bg"
              style={{
                padding: '9px 18px',
                background: 'rgba(255,255,255,0.04)',
                color: 'var(--text-main)',
                border: '1px solid var(--glass-border)',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '13px',
                transition: 'all 0.2s'
              }}
            >
              Espace Professeur
            </button>
            <button
              onClick={() => navigate('/auth?space=student')}
              className="hover-lift"
              style={{
                padding: '9px 18px',
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
              }}
            >
              Espace Élève
              <ChevronRight size={16} />
            </button>
            <a
              href="/admin/"
              className="hover-lift"
              style={{
                padding: '9px 18px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '13px',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
              }}
            >
              <Building2 size={16} />
              Console PC
            </a>
          </div>
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="landing-mobile-toggle"
          aria-label="Menu Mobile"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* MOBILE DRAWER OVERLAY */}
      {mobileMenuOpen && (
        <div className="mobile-drawer-overlay">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src="/icons/logo_Eth.svg" alt="EtherNanos" style={{ height: '32px', width: 'auto' }} />
              <span style={{ fontSize: '20px', fontWeight: 900, color: 'white' }}>EtherNanos</span>
            </div>
            <button onClick={() => setMobileMenuOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
              <X size={26} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
            <a href="#ethernanos-hub" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-main)', fontSize: '18px', fontWeight: 600, textDecoration: 'none' }}>Présentation</a>
            <a href="#portails" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-main)', fontSize: '18px', fontWeight: 600, textDecoration: 'none' }}>Espaces Portails</a>
            <a href="#services" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-main)', fontSize: '18px', fontWeight: 600, textDecoration: 'none' }}>Ce que fait l'application</a>
            <a href="#demo" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-main)', fontSize: '18px', fontWeight: 600, textDecoration: 'none' }}>Démonstration</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-main)', fontSize: '18px', fontWeight: 600, textDecoration: 'none' }}>Questions fréquentes</a>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: 'auto' }}>
            <button
              onClick={() => { setMobileMenuOpen(false); navigate('/auth?space=student'); }}
              style={{ padding: '14px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '16px' }}
            >
              Espace Élève & Parent
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); navigate('/auth?space=prof'); }}
              style={{ padding: '14px', background: 'rgba(236, 72, 153, 0.15)', color: 'var(--secondary)', border: '1px solid var(--secondary)', borderRadius: '12px', fontWeight: 700, fontSize: '16px' }}
            >
              Espace Enseignant
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); navigate('/auth?space=manager'); }}
              style={{ padding: '14px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid #10b981', borderRadius: '12px', fontWeight: 700, fontSize: '16px' }}
            >
              Espace Directeur (Mobile)
            </button>
            <a
              href="/admin/"
              style={{ padding: '14px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', borderRadius: '12px', textAlign: 'center', fontWeight: 700, textDecoration: 'none', fontSize: '16px' }}
            >
              Console PC (Admin)
            </a>
          </div>
        </div>
      )}

      {/* 2. ACCUEIL ET HÉRO PRINCIPAL */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px 40px 20px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Halo lumineux de fond */}
        <div style={{ position: 'absolute', top: '5%', left: '10%', width: '550px', height: '550px', background: 'rgba(99, 102, 241, 0.14)', filter: 'blur(130px)', borderRadius: '50%', pointerEvents: 'none' }}></div>
        <div style={{ position: 'absolute', top: '25%', right: '10%', width: '500px', height: '500px', background: 'rgba(236, 72, 153, 0.1)', filter: 'blur(130px)', borderRadius: '50%', pointerEvents: 'none' }}></div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', width: '100%' }}>
          
          {/* Badge du haut */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '8px 22px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '100px', marginBottom: '24px', color: 'var(--text-main)', fontSize: '13px', fontWeight: 700, backdropFilter: 'blur(10px)', boxShadow: '0 4px 20px rgba(99,102,241,0.15)' }}>
            <img src="/icons/logo_Eth.svg" alt="EtherNanos Logo" style={{ height: '18px', width: 'auto' }} />
            <span style={{ background: 'linear-gradient(90deg, #fff, #cbd5e1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Eteyelo • Le système de gestion scolaire simple et complet
            </span>
          </div>

          {/* Titre principal */}
          <h1 style={{ fontSize: 'clamp(34px, 5vw, 64px)', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1.15, marginBottom: '18px', letterSpacing: '-1.5px' }}>
            Gérez votre Établissement Scolaire <br />
            <span style={{ position: 'relative', display: 'inline-block', marginTop: '6px' }}>
              <span style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', position: 'relative', zIndex: 2 }}>
                Toute la Scolarité en un Clic.
              </span>
              <svg style={{ position: 'absolute', bottom: '-12px', left: 0, width: '100%', zIndex: 1 }} viewBox="0 0 300 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 15 Q 150 0 295 15" fill="none" stroke="rgba(99, 102, 241, 0.6)" strokeWidth="6" strokeLinecap="round"/>
              </svg>
            </span>
          </h1>

          {/* Description simple */}
          <p style={{ fontSize: 'clamp(15px, 1.8vw, 19px)', color: 'var(--text-muted)', marginBottom: '36px', lineHeight: 1.6, maxWidth: '820px', margin: '0 auto 36px auto' }}>
            Eteyelo vous aide à suivre vos élèves, calculer automatiquement les moyennes et bulletins de notes, gérer les enseignants, suivre les paiements de scolarité et visualiser l'évolution de chaque élève grâce à des graphiques clairs.
          </p>

          {/* 3. BANNIÈRE CARROUSEL HAUTEUR FIXE : SLIDE 1 SPÉCIALE ETHERNANOS HUB (AVEC LOGO & BOUTON REDIRECTION), AUTRES SLIDES SUR L'APP (SANS LOGO NI BOUTON) */}
          <section id="ethernanos-hub" style={{ margin: '0 auto 48px auto', width: '100%' }}>
            <div
              className="glass-panel hover-lift"
              style={{
                padding: '32px 28px',
                borderRadius: '28px',
                border: `2px solid ${carouselSlides[carouselIndex].accentColor}`,
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.8))',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                position: 'relative',
                overflow: 'hidden',
                minHeight: '440px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              {/* Controls Arrows */}
              <button
                onClick={handlePrevSlide}
                aria-label="Diapositive précédente"
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid var(--glass-border)',
                  color: 'white',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 10,
                  transition: 'all 0.2s'
                }}
              >
                <ChevronLeft size={20} />
              </button>

              <button
                onClick={handleNextSlide}
                aria-label="Diapositive suivante"
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid var(--glass-border)',
                  color: 'white',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 10,
                  transition: 'all 0.2s'
                }}
              >
                <ChevronRight size={20} />
              </button>

              {/* Active Slide Content with Fixed Min-Height */}
              <div key={carouselIndex} className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px', alignItems: 'center', padding: '0 24px', flex: 1, minHeight: '350px' }}>
                
                <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
                  
                  {/* SLOTS FIXES : LOGO ETHERNANOS (36px FIXE, MASQUÉ SI PAS SPÉCIAL) */}
                  <div style={{ height: '36px', marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
                    {carouselSlides[carouselIndex].isEtherNanosSpecial && (
                      <img src="/icons/logo_name_eth.svg" alt="EtherNanos Hub" style={{ height: '32px', width: 'auto' }} />
                    )}
                  </div>

                  {/* Badge de la slide */}
                  <div>
                    <span
                      style={{
                        padding: '4px 14px',
                        background: carouselSlides[carouselIndex].accentColor,
                        color: 'white',
                        borderRadius: '100px',
                        fontSize: '11px',
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        display: 'inline-block',
                        marginBottom: '12px'
                      }}
                    >
                      {carouselSlides[carouselIndex].badge}
                    </span>
                  </div>
                  
                  <h3 style={{ fontSize: 'clamp(20px, 2.4vw, 30px)', fontWeight: 900, color: 'white', lineHeight: 1.25, marginBottom: '12px', minHeight: '62px', display: 'flex', alignItems: 'center' }}>
                    {carouselSlides[carouselIndex].title}
                  </h3>
                  
                  <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.5, marginBottom: '16px', minHeight: '68px', display: 'flex', alignItems: 'center' }}>
                    {carouselSlides[carouselIndex].desc}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--text-main)', marginBottom: '18px', minHeight: '84px', justifyContent: 'center' }}>
                    {carouselSlides[carouselIndex].points.map((point, pIdx) => (
                      <div key={pIdx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <CheckCircle2 color="#10b981" size={18} style={{ flexShrink: 0 }} />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>

                  {/* SLOT BOUTON HAUTEUR FIXE (46px, RENDU SI SPÉCIAL) */}
                  <div style={{ height: '46px', display: 'flex', alignItems: 'center' }}>
                    {carouselSlides[carouselIndex].isEtherNanosSpecial && (
                      <a
                        href="https://ethernanos.space"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover-lift"
                        style={{
                          padding: '12px 24px',
                          background: carouselSlides[carouselIndex].accentColor,
                          color: 'white',
                          border: 'none',
                          borderRadius: '12px',
                          fontSize: '14px',
                          fontWeight: 800,
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                          transition: 'all 0.2s'
                        }}
                      >
                        <span>Découvrir l'Écosystème sur EtherNanos.space</span>
                        <ExternalLink size={16} />
                      </a>
                    )}
                  </div>
                </div>

                {/* Visual Graphic Representation (Hauteur Fixe 260px) */}
                <div style={{ padding: '24px', background: 'rgba(0,0,0,0.3)', borderRadius: '20px', border: '1px solid var(--glass-border)', height: '260px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                  {carouselSlides[carouselIndex].type === 'cloud' && (
                    <div style={{ textAlign: 'center', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <img src="/icons/logo_name_eth.svg" alt="EtherNanos Hub" style={{ height: '48px', width: 'auto', marginBottom: '16px' }} />
                      <div style={{ fontSize: '15px', fontWeight: 800, color: 'white', marginBottom: '8px' }}>
                        Votre hub de gestion Cloud to local
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, maxWidth: '280px' }}>
                        Synchronisation intelligente des données locales de l'établissement en toute sécurité.
                      </div>
                    </div>
                  )}

                  {carouselSlides[carouselIndex].type === 'graph' && (
                    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: 'white', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <TrendingUp color="#10b981" size={18} /> Graphique de Progression Élève
                      </div>
                      <div style={{ width: '100%', height: '130px' }}>
                        <svg viewBox="0 0 300 100" style={{ width: '100%', height: '100%' }}>
                          <path d="M 20 80 Q 120 50 200 35 T 280 15" fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
                          <circle cx="20" cy="80" r="5" fill="#6366f1" />
                          <circle cx="150" cy="45" r="5" fill="#ec4899" />
                          <circle cx="280" cy="15" r="6" fill="#10b981" />
                        </svg>
                      </div>
                      <div style={{ textAlign: 'center', fontSize: '13px', color: '#10b981', fontWeight: 700, marginTop: '8px' }}>
                        📈 Trimestre 1 (12/20) ➔ Trimestre 3 (18.5/20)
                      </div>
                    </div>
                  )}

                  {carouselSlides[carouselIndex].type === 'bulletin' && (
                    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: 'white', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileCheck color="var(--secondary)" size={18} /> Bulletin Officiel Prêt à l'Impression
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', fontSize: '13px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontWeight: 700 }}>
                          <span>Moyenne Générale : 16.5 / 20</span>
                          <span style={{ color: '#10b981' }}>Rang : 1ère / 38</span>
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '12px', lineHeight: 1.5 }}>
                          Conseil de classe : Tableau d'Honneur avec félicitations du jury.
                        </div>
                      </div>
                    </div>
                  )}

                  {carouselSlides[carouselIndex].type === 'finance' && (
                    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: 'white', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Wallet color="#f59e0b" size={18} /> Émission de Reçu Numéroté
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', fontSize: '13px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontWeight: 700 }}>
                          <span>Reçu N°REC-2026-0041</span>
                          <span style={{ color: '#10b981' }}>150 000 FCFA</span>
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '12px', lineHeight: 1.5 }}>
                          Quitus de scolarité accordé pour l'année 2025-2026.
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Dots Pagination */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
                {carouselSlides.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    onClick={() => setCarouselIndex(dotIdx)}
                    aria-label={`Aller à la diapositive ${dotIdx + 1}`}
                    style={{
                      width: carouselIndex === dotIdx ? '28px' : '10px',
                      height: '10px',
                      borderRadius: '100px',
                      background: carouselIndex === dotIdx ? carouselSlides[dotIdx].accentColor : 'rgba(255,255,255,0.2)',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* 4. BLOC DES 4 CARTES PORTAILS ACCÈS */}
          <div id="portails" className="hero-space-grid">
            {/* 1. Élève & Parent */}
            <div
              onClick={() => navigate('/auth?space=student')}
              className="glass-card hover-lift"
              style={{
                position: 'relative',
                overflow: 'hidden',
                padding: '28px 24px',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: '20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                boxShadow: '0 15px 35px rgba(0,0,0,0.3)',
                textAlign: 'center'
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, var(--primary), var(--accent))' }}></div>
              <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', marginBottom: '16px' }}>
                <GraduationCap size={32} />
              </div>
              <h3 style={{ fontSize: '19px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>Espace Élève & Parent</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '20px' }}>Consultez vos notes, vos bulletins de trimestre et vos graphiques de progression sur téléphone.</p>
              <span style={{ marginTop: 'auto', fontSize: '13px', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                Accéder au Portail <ChevronRight size={16} />
              </span>
            </div>

            {/* 2. Enseignant */}
            <div
              onClick={() => navigate('/auth?space=prof')}
              className="glass-card hover-lift"
              style={{
                position: 'relative',
                overflow: 'hidden',
                padding: '28px 24px',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(236, 72, 153, 0.3)',
                borderRadius: '20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                boxShadow: '0 15px 35px rgba(0,0,0,0.3)',
                textAlign: 'center'
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, var(--secondary), var(--warning))' }}></div>
              <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(236, 72, 153, 0.12)', border: '1px solid rgba(236, 72, 153, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)', marginBottom: '16px' }}>
                <Users size={32} />
              </div>
              <h3 style={{ fontSize: '19px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>Espace Enseignant</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '20px' }}>Saisissez rapidement vos notes d'examens, devoirs et présences des élèves.</p>
              <span style={{ marginTop: 'auto', fontSize: '13px', fontWeight: 700, color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                Accéder au Portail <ChevronRight size={16} />
              </span>
            </div>

            {/* 3. Directeur Mobile */}
            <div
              onClick={() => navigate('/auth?space=manager')}
              className="glass-card hover-lift"
              style={{
                position: 'relative',
                overflow: 'hidden',
                padding: '28px 24px',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                boxShadow: '0 15px 35px rgba(0,0,0,0.3)',
                textAlign: 'center'
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #10b981, #059669)' }}></div>
              <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', marginBottom: '16px' }}>
                <Building2 size={32} />
              </div>
              <h3 style={{ fontSize: '19px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>Espace Directeur (Mobile)</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '20px' }}>Pilotez l'école depuis votre smartphone (effectifs, trésorerie et équipe).</p>
              <span style={{ marginTop: 'auto', fontSize: '13px', fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                Accéder au Portail <ChevronRight size={16} />
              </span>
            </div>

            {/* 4. Console PC Admin */}
            <a
              href="/admin/"
              className="glass-card hover-lift"
              style={{
                position: 'relative',
                overflow: 'hidden',
                padding: '28px 24px',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                boxShadow: '0 15px 35px rgba(0,0,0,0.3)',
                textAlign: 'center',
                textDecoration: 'none'
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #f59e0b, #d97706)' }}></div>
              <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', marginBottom: '16px' }}>
                <Laptop size={32} />
              </div>
              <h3 style={{ fontSize: '19px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>Console PC (Secrétariat)</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '20px' }}>Logiciel complet pour inscrire les élèves et imprimer les documents.</p>
              <span style={{ marginTop: 'auto', fontSize: '13px', fontWeight: 700, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                Accéder sur Ordinateur <ChevronRight size={16} />
              </span>
            </a>
          </div>

          {/* 5. DÉMONSTRATEUR INTERACTIF EN DIRECT */}
          <div id="demo" className="preview-window-shell" style={{ marginTop: '64px' }}>
            <div className="preview-window-bar">
              <div className="preview-window-dots">
                <span className="preview-dot" style={{ background: '#ef4444' }}></span>
                <span className="preview-dot" style={{ background: '#f59e0b' }}></span>
                <span className="preview-dot" style={{ background: '#10b981' }}></span>
              </div>

              {/* Onglets de démo */}
              <div style={{ display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '10px' }}>
                <button
                  onClick={() => setActiveDemoTab('graph')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: activeDemoTab === 'graph' ? 'var(--primary)' : 'transparent',
                    color: activeDemoTab === 'graph' ? 'white' : 'var(--text-muted)',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  📈 Courbe d'Évolution des Notes
                </button>
                <button
                  onClick={() => setActiveDemoTab('dashboard')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: activeDemoTab === 'dashboard' ? 'var(--primary)' : 'transparent',
                    color: activeDemoTab === 'dashboard' ? 'white' : 'var(--text-muted)',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  📊 Vue Directeur
                </button>
                <button
                  onClick={() => setActiveDemoTab('bulletins')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: activeDemoTab === 'bulletins' ? 'var(--primary)' : 'transparent',
                    color: activeDemoTab === 'bulletins' ? 'white' : 'var(--text-muted)',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  📑 Bulletin de Notes
                </button>
                <button
                  onClick={() => setActiveDemoTab('mobile')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: activeDemoTab === 'mobile' ? 'var(--primary)' : 'transparent',
                    color: activeDemoTab === 'mobile' ? 'white' : 'var(--text-muted)',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  📱 Vue Élève sur Mobile
                </button>
              </div>

              <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock size={12} color="#10b981" /> https://eteyelo.online/demo
              </div>
            </div>

            {/* Zone d'affichage interactif */}
            <div style={{ padding: '24px', textAlign: 'left', minHeight: '340px' }}>
              {activeDemoTab === 'graph' && (
                <div className="animate-fade-in">
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <h4 style={{ fontSize: '17px', fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <LineChart color="var(--primary)" size={20} /> Courbe d'Évolution des Notes — Eden Akiana (3ème A)
                        </h4>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Progression de l'élève par matière au fil des trimestres
                        </p>
                      </div>
                      <span style={{ padding: '6px 14px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)', borderRadius: '100px', fontSize: '12px', fontWeight: 800 }}>
                        📈 Progression : +3.5 points (Excellente)
                      </span>
                    </div>

                    {/* SVG Graphic Curve */}
                    <div style={{ width: '100%', height: '180px', position: 'relative', marginTop: '10px' }}>
                      <svg viewBox="0 0 500 150" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                        <defs>
                          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

                        {/* Grid lines */}
                        <line x1="0" y1="30" x2="500" y2="30" stroke="rgba(255,255,255,0.05)" strokeDasharray="4" />
                        <line x1="0" y1="75" x2="500" y2="75" stroke="rgba(255,255,255,0.05)" strokeDasharray="4" />
                        <line x1="0" y1="120" x2="500" y2="120" stroke="rgba(255,255,255,0.05)" strokeDasharray="4" />

                        {/* Chart Fill Area */}
                        <path d="M 30 110 Q 150 70 250 45 T 470 20 L 470 140 L 30 140 Z" fill="url(#chartGradient)" />

                        {/* Chart Line Curve */}
                        <path d="M 30 110 Q 150 70 250 45 T 470 20" fill="none" stroke="var(--primary)" strokeWidth="4" strokeLinecap="round" />

                        {/* Data Points */}
                        <circle cx="30" cy="110" r="6" fill="#6366f1" stroke="white" strokeWidth="2" />
                        <text x="30" y="95" fill="white" fontSize="11" fontWeight="bold" textAnchor="middle">12.5/20</text>
                        <text x="30" y="135" fill="var(--text-muted)" fontSize="10" textAnchor="middle">Octobre</text>

                        <circle cx="150" cy="70" r="6" fill="#ec4899" stroke="white" strokeWidth="2" />
                        <text x="150" y="55" fill="white" fontSize="11" fontWeight="bold" textAnchor="middle">14.0/20</text>
                        <text x="150" y="135" fill="var(--text-muted)" fontSize="10" textAnchor="middle">Décembre</text>

                        <circle cx="250" cy="45" r="6" fill="#10b981" stroke="white" strokeWidth="2" />
                        <text x="250" y="30" fill="white" fontSize="11" fontWeight="bold" textAnchor="middle">16.5/20</text>
                        <text x="250" y="135" fill="var(--text-muted)" fontSize="10" textAnchor="middle">Février</text>

                        <circle cx="470" cy="20" r="7" fill="#10b981" stroke="white" strokeWidth="3" />
                        <text x="470" y="10" fill="#10b981" fontSize="12" fontWeight="900" textAnchor="middle">18.5/20 🏆</text>
                        <text x="470" y="135" fill="var(--text-muted)" fontSize="10" textAnchor="middle">Trimestre 3</text>
                      </svg>
                    </div>

                    <div style={{ marginTop: '16px', display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#6366f1' }}></span> Mathématiques (+4 pts)</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ec4899' }}></span> Français (+2 pts)</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></span> Physique-Chimie (+3.5 pts)</span>
                    </div>
                  </div>
                </div>
              )}

              {activeDemoTab === 'dashboard' && (
                <div className="animate-fade-in">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                    <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Nombre Total d'Élèves</div>
                      <div style={{ fontSize: '24px', fontWeight: 900, color: 'white', marginTop: '4px' }}>1,248 Élèves</div>
                      <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 700 }}>Inscriptions complètes</span>
                    </div>
                    <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Scolarités Encaissées</div>
                      <div style={{ fontSize: '24px', fontWeight: 900, color: '#10b981', marginTop: '4px' }}>84.5%</div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Paiements à jour</span>
                    </div>
                    <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Moyenne Générale École</div>
                      <div style={{ fontSize: '24px', fontWeight: 900, color: '#6366f1', marginTop: '4px' }}>14.2 / 20</div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Toutes les classes</span>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Activity size={16} color="var(--primary)" /> Dernières mises à jour des cours
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                        <span>📝 M. TCHOUPO a enregistré 32 notes de Mathématiques (Terminale S)</span>
                        <span style={{ color: 'var(--text-muted)' }}>Il y a 2 min</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                        <span>💳 Reçu de scolarité remis à Lucas Akiana (4ème B)</span>
                        <span style={{ color: '#10b981' }}>Payé</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeDemoTab === 'bulletins' && (
                <div className="animate-fade-in">
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '14px', border: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <div>
                        <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'white' }}>Bulletin de Notes du 1er Trimestre — KOMBILA Honorine</h4>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Classe de 3ème A • Année Scolaire 2025-2026</p>
                      </div>
                      <span style={{ padding: '6px 14px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', borderRadius: '100px', fontSize: '12px', fontWeight: 800 }}>
                        Rang : 1ère / 38 élèves
                      </span>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)', textAlign: 'left' }}>
                          <th style={{ padding: '8px' }}>Matière</th>
                          <th style={{ padding: '8px' }}>Note / 20</th>
                          <th style={{ padding: '8px' }}>Coefficient</th>
                          <th style={{ padding: '8px' }}>Appréciation de l'Enseignant</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '10px', fontWeight: 700 }}>Mathématiques</td>
                          <td style={{ padding: '10px', color: '#10b981', fontWeight: 900 }}>18.5</td>
                          <td style={{ padding: '10px' }}>4</td>
                          <td style={{ padding: '10px', color: 'var(--text-muted)' }}>Très bon travail, élève sérieuse et motivée.</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '10px', fontWeight: 700 }}>Français</td>
                          <td style={{ padding: '10px', color: '#6366f1', fontWeight: 900 }}>16.0</td>
                          <td style={{ padding: '10px' }}>3</td>
                          <td style={{ padding: '10px', color: 'var(--text-muted)' }}>Excellente expression écrite.</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '10px', fontWeight: 700 }}>Physique-Chimie</td>
                          <td style={{ padding: '10px', color: '#10b981', fontWeight: 900 }}>17.0</td>
                          <td style={{ padding: '10px' }}>3</td>
                          <td style={{ padding: '10px', color: 'var(--text-muted)' }}>Très bon esprit scientifique.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeDemoTab === 'mobile' && (
                <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <div style={{ width: '280px', background: '#020617', border: '2px solid rgba(255,255,255,0.2)', borderRadius: '28px', padding: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                    <div style={{ width: '60px', height: '12px', background: 'rgba(255,255,255,0.2)', borderRadius: '6px', margin: '0 auto 16px auto' }}></div>
                    <div style={{ background: 'var(--primary)', padding: '12px', borderRadius: '12px', color: 'white', fontSize: '12px', marginBottom: '12px', textAlign: 'center' }}>
                      <strong>Bonjour Juan Akiana 👋</strong>
                      <div style={{ fontSize: '10px', opacity: 0.8 }}>Espace Élève en ligne</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '10px', fontSize: '11px', marginBottom: '8px' }}>
                      📚 Prochain cours : <strong>Physique à 10h00 (Salle 104)</strong>
                    </div>
                    <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', padding: '10px', borderRadius: '10px', fontSize: '11px', textAlign: 'center', fontWeight: 700 }}>
                      ✅ Frais de scolarité réglés
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* 6. CE QUE L'APPLICATION PEUT GÉRER (Services Principaux) */}
      <section id="services" style={{ padding: '80px 32px', background: '#090e17', borderTop: '1px solid var(--glass-border)', position: 'relative' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 16px', background: 'rgba(236, 72, 153, 0.1)', color: 'var(--secondary)', borderRadius: '100px', fontSize: '12px', fontWeight: 800, marginBottom: '16px' }}>
              <Layers size={14} /> FONCTIONNALITÉS SIMPLES & PRATIQUES
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-1px', marginBottom: '16px' }}>
              Tout Ce Que Votre Établissement Peut Gérer.
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '16px', maxWidth: '680px', margin: '0 auto' }}>
              Eteyelo rassemble toutes les tâches du quotidien en un seul endroit simple et facile d'accès.
            </p>
          </div>

          {/* Grille des fonctionnalités */}
          <div className="bento-features-grid">
            {/* Service 1 */}
            <div className="glass-card hover-lift" style={{ padding: '32px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <GraduationCap size={24} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '10px' }}>Inscriptions & Dossiers Élèves</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>
                Enregistrez facilement les nouveaux élèves, attribuez-leur un numéro de matricule et suivez leur classe et tuteur.
              </p>
            </div>

            {/* Service 2 */}
            <div className="glass-card hover-lift" style={{ padding: '32px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(236, 72, 153, 0.15)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <LineChart size={24} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '10px' }}>Examens, Notes & Courbes</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>
                Saisie rapide des notes par les enseignants, calcul automatique des moyennes et génération des courbes de progression par élève.
              </p>
            </div>

            {/* Service 3 */}
            <div className="glass-card hover-lift" style={{ padding: '32px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <FileCheck size={24} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '10px' }}>Bulletins de Notes & Cartes</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>
                Générez et imprimez en un clic les bulletins de trimestre officiels ainsi que les cartes d'élèves avec QR Code.
              </p>
            </div>

            {/* Service 4 */}
            <div className="glass-card hover-lift" style={{ padding: '32px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <CalendarDays size={24} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '10px' }}>Emplois du Temps & Cours</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>
                Organisez facilement l'emploi du temps des classes, l'attribution des salles et l'emploi du temps des professeurs.
              </p>
            </div>

            {/* Service 5 */}
            <div className="glass-card hover-lift" style={{ padding: '32px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(20, 184, 166, 0.15)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <Users size={24} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '10px' }}>Enseignants & Personnel</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>
                Gérez la liste de vos professeurs, leurs matières enseignées, leurs coordonnées et leurs plannings de cours.
              </p>
            </div>

            {/* Service 6 */}
            <div className="glass-card hover-lift" style={{ padding: '32px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <Wallet size={24} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '10px' }}>Frais de Scolarité & Reçus</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>
                Enregistrez les paiements des élèves, éditez des reçus clairs et suivez l'état des scolarités payées par classe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FOIRE AUX QUESTIONS (FAQ Simple) */}
      <section id="faq" style={{ padding: '80px 32px', background: 'var(--bg-darker)', borderTop: '1px solid var(--glass-border)' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 16px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', borderRadius: '100px', fontSize: '12px', fontWeight: 800, marginBottom: '16px' }}>
              <HelpCircle size={14} /> RÉPONSES SIMPLES
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, color: 'white', letterSpacing: '-1px' }}>
              Questions Fréquentes.
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className="faq-accordion-item">
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    style={{
                      width: '100%',
                      padding: '20px 24px',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-main)',
                      fontSize: '16px',
                      fontWeight: 800,
                      textAlign: 'left',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={20}
                      style={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease',
                        color: 'var(--primary)'
                      }}
                    />
                  </button>
                  {isOpen && (
                    <div style={{ padding: '0 24px 20px 24px', color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }} className="animate-fade-in">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. CTA BANNER POUR DÉPLOIEMENT & ACHAT DE L'APPLICATION */}
      <section style={{ padding: '80px 32px', background: 'linear-gradient(180deg, #090e17 0%, rgba(15, 23, 42, 1) 100%)', textAlign: 'center' }}>
        <div
          className="glass-panel"
          style={{
            maxWidth: '960px',
            margin: '0 auto',
            padding: '56px 36px',
            borderRadius: '32px',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.4)'
          }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 18px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)', borderRadius: '100px', fontSize: '13px', fontWeight: 800, marginBottom: '20px' }}>
            <ShoppingCart size={16} /> ACQUISITION & DÉPLOIEMENT ÉTABLISSEMENT
          </div>

          <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, color: 'white', marginBottom: '16px', letterSpacing: '-1px' }}>
            Équiper Votre Établissement Scolaire d'Eteyelo.
          </h2>

          <p style={{ fontSize: '17px', color: 'var(--text-muted)', marginBottom: '36px', maxWidth: '680px', margin: '0 auto 36px auto', lineHeight: 1.6 }}>
            Vous souhaitez déployer la solution Eteyelo dans votre école, collège ou lycée ? Remplissez notre formulaire de contact ci-dessous pour commander l'application ou demander une démonstration personnalisée.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="#contact-achat"
              className="hover-lift"
              style={{
                padding: '16px 32px',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                color: 'white',
                border: 'none',
                borderRadius: '100px',
                fontSize: '15px',
                fontWeight: 900,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 10px 25px rgba(99,102,241,0.4)'
              }}
            >
              <Send size={18} />
              <span>Contacter pour l'Achat / Démo</span>
            </a>

            <a
              href="https://ethernanos.space"
              target="_blank"
              rel="noopener noreferrer"
              className="hover-lift"
              style={{
                padding: '16px 32px',
                background: 'rgba(255,255,255,0.06)',
                color: 'white',
                border: '1px solid var(--glass-border)',
                borderRadius: '100px',
                fontSize: '15px',
                fontWeight: 800,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>Découvrir EtherNanos.space</span>
              <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* 9. FOOTER AVEC FORMULAIRE DE CONTACT POUR ACHAT */}
      <footer id="contact-achat" style={{ padding: '80px 32px 40px 32px', borderTop: '1px solid var(--glass-border)', background: 'var(--bg-darker)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          
          {/* Formulaire de Contact pour Achat */}
          <div
            className="glass-panel"
            style={{
              padding: '48px 36px',
              borderRadius: '28px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.7))',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              marginBottom: '64px'
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '36px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', borderRadius: '100px', fontSize: '12px', fontWeight: 800, marginBottom: '14px' }}>
                <Mail size={14} /> CONTACT COMMERCIAL & ACHAT
              </div>
              <h3 style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 900, color: 'white', marginBottom: '10px' }}>
                Formulaire de Demande d'Achat & Démo
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '15px', maxWidth: '600px', margin: '0 auto' }}>
                Envoyez-nous vos coordonnées et le nom de votre établissement. Notre équipe commerciale prendra directement contact avec vous.
              </p>
            </div>

            {contactSubmitted ? (
              <div
                className="animate-fade-in"
                style={{
                  padding: '32px',
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid #10b981',
                  borderRadius: '20px',
                  textAlign: 'center',
                  color: 'white'
                }}
              >
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                  <CheckCircle2 size={32} />
                </div>
                <h4 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>Demande d'Achat Envoyée avec Succès !</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '520px', margin: '0 auto 20px auto', lineHeight: 1.6 }}>
                  Merci <strong>{contactForm.fullName}</strong> ! Notre équipe commerciale EtherNanos a bien reçu votre demande pour <strong>{contactForm.schoolName || 'votre établissement'}</strong> et vous recontactera rapidement par téléphone ou par e-mail.
                </p>
                <button
                  onClick={() => {
                    setContactSubmitted(false);
                    setContactForm({ fullName: '', schoolName: '', phone: '', email: '', message: '' });
                  }}
                  style={{ padding: '10px 24px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '100px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                >
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                  
                  {/* Nom complet */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                    <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <User size={14} color="var(--primary)" /> Nom complet *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Jean Dupont"
                      value={contactForm.fullName}
                      onChange={(e) => setContactForm({ ...contactForm, fullName: e.target.value })}
                      style={{
                        padding: '14px 18px',
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '12px',
                        color: 'white',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                  </div>

                  {/* Nom de l'établissement */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                    <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Building2 size={14} color="var(--primary)" /> Nom de l'Établissement / École *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Complexe Scolaire Saint-Joseph"
                      value={contactForm.schoolName}
                      onChange={(e) => setContactForm({ ...contactForm, schoolName: e.target.value })}
                      style={{
                        padding: '14px 18px',
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '12px',
                        color: 'white',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                  </div>

                  {/* Téléphone */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                    <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Phone size={14} color="var(--primary)" /> Téléphone / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Ex: +243 90 000 0000"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      style={{
                        padding: '14px 18px',
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '12px',
                        color: 'white',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                  </div>

                  {/* Email */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                    <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Mail size={14} color="var(--primary)" /> Adresse E-mail
                    </label>
                    <input
                      type="email"
                      placeholder="Ex: contact@ecole.com"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      style={{
                        padding: '14px 18px',
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '12px',
                        color: 'white',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                  </div>

                </div>

                {/* Message */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MessageSquare size={14} color="var(--primary)" /> Votre besoin / Message particulier
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Ex: Nous souhaitons acquérir la licence pour notre école de 500 élèves..."
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    style={{
                      padding: '14px 18px',
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '14px',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                  />
                </div>

                {/* Erreur éventuelle */}
                {submitError && (
                  <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--danger)', borderRadius: '12px', color: '#fca5a5', fontSize: '13px', textAlign: 'center' }}>
                    {submitError}
                  </div>
                )}

                {/* Bouton d'envoi */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="hover-lift"
                  style={{
                    padding: '16px 36px',
                    background: submitting ? 'rgba(99, 102, 241, 0.5)' : 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    color: 'white',
                    border: 'none',
                    borderRadius: '14px',
                    fontSize: '16px',
                    fontWeight: 900,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    boxShadow: '0 10px 25px rgba(99,102,241,0.35)',
                    marginTop: '8px',
                    opacity: submitting ? 0.7 : 1
                  }}
                >
                  <Send size={18} />
                  <span>{submitting ? 'Envoi en cours...' : "Envoyer la Demande d'Achat"}</span>
                </button>
              </form>
            )}
          </div>

          {/* Baseline Copyright & Logo Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img src="/icons/logo_name_eth.svg" alt="EtherNanos" style={{ height: '28px', width: 'auto' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '6px 14px', borderRadius: '100px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
              Système EtherNanos Hub Actif
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 500 }}>
              © {new Date().getFullYear()} EtherNanos. Tous droits réservés.
            </p>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default Landing;
