import React, { useState, useEffect, useRef } from 'react';
import { ArrowUp } from 'lucide-react';

export const ScrollToTopButton: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const scrollIntervalRef = useRef<any>(null);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 150) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const stopContinuousScroll = () => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  };

  const handlePointerDown = (e: React.SyntheticEvent) => {
    // Empêcher la sélection de texte ou le drag
    e.stopPropagation();
    stopContinuousScroll();

    // Démarrer un défilement progressif vers le haut tant que le bouton est maintenu enfoncé
    scrollIntervalRef.current = setInterval(() => {
      if (window.scrollY <= 0) {
        stopContinuousScroll();
        return;
      }
      window.scrollBy({ top: -35, behavior: 'auto' });
    }, 16);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    stopContinuousScroll();
    // Clic unique : remonter instantanément/smooth au début de la page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!visible) return null;

  return (
    <button
      onClick={handleClick}
      onMouseDown={handlePointerDown}
      onMouseUp={stopContinuousScroll}
      onMouseLeave={stopContinuousScroll}
      onTouchStart={handlePointerDown}
      onTouchEnd={stopContinuousScroll}
      style={{
        position: 'fixed',
        bottom: '85px',
        right: '20px',
        zIndex: 99999,
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #10b981, #059669)',
        color: 'white',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 10px 25px rgba(16, 185, 129, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'none',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      title="Clic simple : remonter en haut • Maintien : remonter progressivement"
    >
      <ArrowUp size={22} strokeWidth={2.5} />
    </button>
  );
};
