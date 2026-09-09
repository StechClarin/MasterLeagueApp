// Client API du Portail Eteyelo
// L'URL du backend se configure via VITE_API_URL (voir .env.example).
const API_BASE: string =
  (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, '') ?? 'http://localhost:8000';

export type PortalSpace = 'student' | 'prof';

export interface PortalChild {
  id: string;
  firstName: string;
  lastName: string;
  matricule?: string;
  gender?: string;
  photo?: string | null;
  className?: string | null;
  levelName?: string | null;
  academicYear?: string | null;
  status?: string | null;
  establishmentId?: string;
  establishmentName?: string | null;
}

export interface PortalPerson {
  kind: 'guardian' | 'student' | 'personnel';
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  matricule?: string;
  jobTitle?: string;
  establishmentId?: string;
  establishmentName?: string | null;
}

export interface PortalSession {
  space: PortalSpace;
  person: PortalPerson;
  children: PortalChild[];
  access_token?: string;
  expires_in?: number;
}

export interface RequestCodeResult {
  detail: string;
  request_id: string;
  channel: 'email' | 'sms';
  identifier: string;
  expires_in: number;
  resend_after: number;
  /** Uniquement présent quand le backend tourne en mode DEBUG (démo). */
  debug_code?: string;
  profile_found?: boolean;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  let body: any = null;
  try {
    body = await res.json();
  } catch {
    /* réponse vide ou non JSON */
  }

  if (!res.ok) {
    const detail =
      (body && (body.detail || body.message)) ||
      `Erreur ${res.status} — serveur injoignable. Vérifiez VITE_API_URL (${API_BASE}) et que le backend est lancé.`;
    throw new ApiError(String(detail), res.status);
  }
  return body as T;
}

/** Demande l'envoi d'un code magic link (email ou SMS). */
export function requestMagicCode(space: PortalSpace, contact: string): Promise<RequestCodeResult> {
  return request<RequestCodeResult>('/api/portal/auth/request/', {
    method: 'POST',
    body: JSON.stringify({ space, contact }),
  });
}

/** Vérifie le code à 6 chiffres et ouvre la session (retourne le token). */
export function verifyMagicCode(space: PortalSpace, contact: string, code: string): Promise<PortalSession> {
  return request<PortalSession>('/api/portal/auth/verify/', {
    method: 'POST',
    body: JSON.stringify({ space, contact, code }),
  });
}

/** Recharge une session existante à partir du jeton (données à jour). */
export function fetchPortalSession(token: string): Promise<PortalSession> {
  return request<PortalSession>('/api/portal/session/', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

/** Transforme un chemin média relatif du backend en URL absolue. */
export function mediaUrl(path?: string | null): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
}

export { API_BASE };
