import React, { useState, useEffect, useRef } from 'react';
import { ArrowUp } from 'lucide-react';

export const ScrollToTopButton: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 100) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const stopScroll = () => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  const startScrollingUp = () => {
    stopScroll();

    const step = () => {
      if (window.scrollY <= 0) {
        stopScroll();
        return;
      }
      // Vitesse progressive 60fps (~32px par frame)
      window.scrollBy(0, -32);
      animationFrameRef.current = requestAnimationFrame(step);
    };

    animationFrameRef.current = requestAnimationFrame(step);
  };

  // Sécurité : arrêter immédiatement le défilement dès que le pointeur est relâché n'importe où
  useEffect(() => {
    const handleGlobalRelease = () => {
      stopScroll();
    };

    window.addEventListener('pointerup', handleGlobalRelease);
    window.addEventListener('mouseup', handleGlobalRelease);
    window.addEventListener('touchend', handleGlobalRelease);
    window.addEventListener('touchcancel', handleGlobalRelease);

    return () => {
      window.removeEventListener('pointerup', handleGlobalRelease);
      window.removeEventListener('mouseup', handleGlobalRelease);
      window.removeEventListener('touchend', handleGlobalRelease);
      window.removeEventListener('touchcancel', handleGlobalRelease);
      stopScroll();
    };
  }, []);

  if (!visible) return null;

  return (
    <button
      onPointerDown={(e) => {
        e.preventDefault();
        startScrollingUp();
      }}
      onPointerUp={stopScroll}
      onPointerLeave={stopScroll}
      onPointerCancel={stopScroll}
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
        transition: 'transform 0.15s ease, opacity 0.2s ease',
      }}
      title="Maintenir enfoncé pour remonter • Relâcher pour arrêter"
    >
      <ArrowUp size={22} strokeWidth={2.5} />
    </button>
  );
};
