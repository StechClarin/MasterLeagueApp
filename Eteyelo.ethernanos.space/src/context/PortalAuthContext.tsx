import { createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  ApiError,
  fetchPortalSession,
  requestMagicCode,
  verifyMagicCode,
  type PortalChild,
  type PortalSession,
  type PortalSpace,
  type RequestCodeResult,
} from '../lib/api';

const TOKEN_KEY = 'eteyelo.portal.token';
const SPACE_KEY = 'eteyelo.portal.space';
const SESSION_KEY = 'eteyelo.portal.session';
const ACTIVE_CHILD_KEY = 'eteyelo.portal.activeChildId';

export interface PortalAuthValue {
  /** true tant qu'on tente de restaurer une session depuis le localStorage. */
  loading: boolean;
  /** Session courante (null si déconnecté). */
  session: PortalSession | null;
  authenticated: boolean;
  space: PortalSpace | null;
  /** Enfants visibles (parents multi-enfants -> selecteur). */
  children: PortalChild[];
  /** Enfant actuellement sélectionné dans l'espace étudiant. */
  activeChild: PortalChild | null;
  requestCode: (space: PortalSpace, contact: string) => Promise<RequestCodeResult>;
  confirmCode: (space: PortalSpace, contact: string, code: string) => Promise<void>;
  selectChild: (childId: string) => void;
  logout: () => void;
}

const PortalAuthContext = createContext<PortalAuthValue | null>(null);

function readStored<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function store(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

function removeKey(key: string) {
  localStorage.removeItem(key);
}

export function PortalAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<PortalSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeChildId, setActiveChildId] = useState<string | null>(null);

  // ---- Restauration de session au chargement ----
  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        if (!cancelled) {
          setSession(null);
          setLoading(false);
        }
        return;
      }
      try {
        const fresh = await fetchPortalSession(token);
        if (cancelled) return;
        store(SESSION_KEY, fresh);
        const storedChild = localStorage.getItem(ACTIVE_CHILD_KEY);
        setActiveChildId(storedChild);
        setSession(fresh);
      } catch {
        // Jeton expiré/invalide -> on repart proprement.
        if (cancelled) return;
        removeKey(TOKEN_KEY);
        removeKey(SESSION_KEY);
        removeKey(ACTIVE_CHILD_KEY);
        setSession(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    // Session mise en cache en attendant le réseau (pas de flash d'écran de login).
    if (!cancelled && cachedRestorable()) {
      const cached = readStored<PortalSession>(SESSION_KEY);
      if (cached) setSession(cached);
    }
    hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  function cachedRestorable() {
    return Boolean(localStorage.getItem(TOKEN_KEY) && localStorage.getItem(SESSION_KEY));
  }

  const applySession = useCallback((next: PortalSession) => {
    localStorage.setItem(TOKEN_KEY, next.access_token ?? '');
    store(SPACE_KEY, next.space);
    store(SESSION_KEY, next);
    setSession(next);
    // On conserve l'enfant actif s'il appartient toujours à la liste.
    const stillValid = (id: string | null) => id && next.children.some((c) => c.id === id);
    const current = localStorage.getItem(ACTIVE_CHILD_KEY);
    if (!stillValid(current)) {
      const first = next.children[0];
      setActiveChildId(first ? first.id : null);
      if (first) localStorage.setItem(ACTIVE_CHILD_KEY, first.id);
    } else {
      setActiveChildId(current);
    }
  }, []);

  const requestCode = useCallback(
    (space: PortalSpace, contact: string) => requestMagicCode(space, contact),
    [],
  );

  const confirmCode = useCallback(
    async (space: PortalSpace, contact: string, code: string) => {
      const next = await verifyMagicCode(space, contact, code);
      applySession(next);
    },
    [applySession],
  );

  const selectChild = useCallback((childId: string) => {
    setActiveChildId(childId);
    localStorage.setItem(ACTIVE_CHILD_KEY, childId);
  }, []);

  const logout = useCallback(() => {
    removeKey(TOKEN_KEY);
    removeKey(SPACE_KEY);
    removeKey(SESSION_KEY);
    removeKey(ACTIVE_CHILD_KEY);
    setSession(null);
    setActiveChildId(null);
  }, []);

  const value = useMemo<PortalAuthValue>(() => {
    const children = session?.children ?? [];
    const activeChild =
      children.find((c) => c.id === activeChildId) ?? children[0] ?? null;
    return {
      loading,
      session,
      authenticated: session !== null,
      space: session?.space ?? null,
      children,
      activeChild,
      requestCode,
      confirmCode,
      selectChild,
      logout,
    };
  }, [loading, session, activeChildId, requestCode, confirmCode, selectChild, logout]);

  return <PortalAuthContext.Provider value={value}>{children}</PortalAuthContext.Provider>;
}

export function usePortalAuth(): PortalAuthValue {
  const ctx = useContext(PortalAuthContext);
  if (!ctx) {
    throw new Error('usePortalAuth doit être utilisé dans <PortalAuthProvider>.');
  }
  return ctx;
}

export { ApiError };
