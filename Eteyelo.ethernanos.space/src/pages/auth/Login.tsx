import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  GraduationCap,
  KeyRound,
  Mail,
  Phone,
  RefreshCw,
  Send,
  Users,
} from 'lucide-react';
import { usePortalAuth } from '../../context/PortalAuthContext';
import { ApiError, type PortalSpace } from '../../lib/api';

type Step = 'space' | 'contact' | 'code';

function BrandHeader({ subtitle }: { subtitle: string }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: '28px' }}>
      <div
        style={{
          width: '56px',
          height: '56px',
          margin: '0 auto 16px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '28px',
          fontWeight: 900,
          boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
        }}
      >
        E
      </div>
      <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
        Eteyelo
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginTop: '6px' }}>{subtitle}</p>
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { requestCode, confirmCode } = usePortalAuth();

  const initialSpace = (searchParams.get('space') === 'prof' ? 'prof' : 'student') as PortalSpace;
  const [space, setSpace] = useState<PortalSpace>(initialSpace);
  const [step, setStep] = useState<Step>(searchParams.get('space') ? 'contact' : 'space');

  const [contact, setContact] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const debugCode = useRef<string | null>(null);
  const submitted = useRef(false);

  const isEmail = contact.includes('@');

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  function pickSpace(next: PortalSpace) {
    setSpace(next);
    setError(null);
    setStep('contact');
  }

  async function sendCode() {
    const value = contact.trim();
    if (!value) {
      setError('Indiquez votre email ou votre numéro de téléphone.');
      return;
    }
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      const res = await requestCode(space, value);
      debugCode.current = res.debug_code ?? null;
      const channel = res.channel === 'sms' ? 'SMS' : 'email';
      setInfo(
        res.profile_found === false
          ? 'Aucun compte n’est associé à ce contact. Vérifiez votre saisie (mode démo).'
          : `Un code de connexion a été envoyé par ${channel} à ${value}.`,
      );
      setResendIn(res.resend_after);
      setStep('code');
      setCode('');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Impossible d’envoyer le code. Vérifiez que le serveur est joignable.');
    } finally {
      setBusy(false);
    }
  }

  async function confirmLogin() {
    if (submitted.current) return;
    if (!/^\d{6}$/.test(code.trim())) {
      setError('Le code doit contenir exactement 6 chiffres.');
      return;
    }
    submitted.current = true;
    setError(null);
    setBusy(true);
    try {
      await confirmCode(space, contact.trim(), code.trim());
      navigate(space === 'prof' ? '/prof' : '/student', { replace: true });
    } catch (e) {
      submitted.current = false;
      setError(e instanceof ApiError ? e.message : 'Code incorrect.');
    } finally {
      setBusy(false);
    }
  }

  function fillDebug() {
    if (debugCode.current) setCode(debugCode.current);
  }

  const backToSpaces = () => {
    setStep('space');
    setError(null);
    setInfo(null);
    setCode('');
  };

  const spinner = (
    <span
      style={{
        display: 'inline-block',
        width: '18px',
        height: '18px',
        border: '2px solid rgba(255,255,255,0.4)',
        borderTopColor: 'white',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}
    />
  );

  return (
    <div className="auth-screen animate-fade-in">
      <div className="auth-card glass-panel">
        <BrandHeader subtitle="Connexion par code à usage unique (email ou SMS)" />

        {step === 'space' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="auth-space-tab" style={{ justifyContent: 'flex-start', padding: '20px', textAlign: 'left' }} onClick={() => pickSpace('student')} role="button">
              <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(99,102,241,0.14)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <GraduationCap size={26} />
              </div>
              <div>
                <div style={{ fontSize: '17px', fontWeight: 800 }}>Espace Étudiant / Parent</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Suivi des notes, emploi du temps et paiements de vos enfants.
                </div>
              </div>
            </div>
            <div className="auth-space-tab" style={{ justifyContent: 'flex-start', padding: '20px', textAlign: 'left' }} onClick={() => pickSpace('prof')} role="button">
              <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(236,72,153,0.14)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Users size={26} />
              </div>
              <div>
                <div style={{ fontSize: '17px', fontWeight: 800 }}>Espace Enseignant</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Vos classes, plannings, évaluations et saisie de notes.
                </div>
              </div>
            </div>
            <a href="/admin/" className="auth-space-tab" style={{ justifyContent: 'flex-start', padding: '20px', textAlign: 'left', textDecoration: 'none' }} role="button">
              <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(16,185,129,0.14)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Building2 size={26} />
              </div>
              <div>
                <div style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-main)' }}>Espace Administration</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Accès à la console d'administration et de gestion scolaire.
                </div>
              </div>
            </a>
          </div>
        )}

        {step === 'contact' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendCode();
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', alignSelf: 'center', padding: '8px 16px', borderRadius: '100px', background: space === 'prof' ? 'rgba(236,72,153,0.12)' : 'rgba(99,102,241,0.12)', border: '1px solid var(--glass-border)', fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
              {space === 'prof' ? <Users size={14} /> : <GraduationCap size={14} />}
              {space === 'prof' ? 'Espace Enseignant' : 'Espace Étudiant / Parent'}
            </div>

            <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>
              Email ou numéro de téléphone
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}>
                {isEmail ? <Mail size={18} /> : <Phone size={18} />}
              </div>
              <input
                className="auth-input"
                style={{ paddingLeft: '46px' }}
                autoFocus
                type="text"
                inputMode={isEmail ? 'email' : 'tel'}
                placeholder="ex : +241 06 00 00 001 ou parent@ecole.com"
                value={contact}
                onChange={(e) => {
                  setContact(e.target.value);
                  setError(null);
                }}
              />
            </div>

            {error && (
              <div className="auth-alert error" style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <AlertCircle size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" className="auth-btn" disabled={busy} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              {busy ? spinner : <Send size={18} />}
              {busy ? 'Envoi en cours…' : 'Recevoir mon code'}
            </button>

            <button type="button" className="auth-btn auth-secondary-btn" onClick={backToSpaces} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <ArrowLeft size={16} /> Changer d’espace
            </button>
          </form>
        )}

        {step === 'code' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              confirmLogin();
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent)' }}>
              <KeyRound size={18} />
              <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>
                Saisissez le code reçu
              </span>
            </div>

            {info && (
              <div className="auth-alert info" style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <CheckCircle2 size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
                <span>{info}</span>
              </div>
            )}

            <input
              className="auth-input code-input"
              autoFocus
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="••••••"
              value={code}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, '').slice(0, 6);
                setCode(digits);
                setError(null);
              }}
            />

            {debugCode.current && code.length === 0 && (
              <button type="button" className="auth-btn auth-secondary-btn" onClick={fillDebug} style={{ padding: '10px', fontSize: '13px' }}>
                ✨ Mode démo : utiliser le code {debugCode.current}
              </button>
            )}

            {error && (
              <div className="auth-alert error" style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <AlertCircle size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" className="auth-btn" disabled={busy || code.length !== 6} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              {busy ? spinner : <CheckCircle2 size={18} />}
              {busy ? 'Connexion…' : 'Me connecter'}
            </button>

            <button type="button" className="auth-btn auth-secondary-btn" disabled={busy || resendIn > 0} onClick={sendCode} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <RefreshCw size={16} style={busy ? { animation: 'spin 1s linear infinite' } : undefined} />
              {resendIn > 0 ? `Renvoyer dans ${resendIn}s` : 'Renvoyer le code'}
            </button>

            <button type="button" className="auth-btn auth-secondary-btn" onClick={backToSpaces} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <ArrowLeft size={16} /> Retour
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', marginTop: '22px', lineHeight: 1.5 }}>
          Code à usage unique, valable 10 minutes.
          <br />
          Connexion sécurisée — aucun mot de passe à retenir.
        </p>
      </div>
    </div>
  );

}
