// Client API du Portail Eteyelo
// L'URL du backend se configure via VITE_API_URL (voir .env.example).
function getApiBaseUrl(): string {
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  if (envUrl !== undefined && envUrl !== '') {
    return envUrl.replace(/\/$/, '');
  }
  // En mode développement local (Vite dev server)
  if ((import.meta as any).env?.DEV) {
    return 'http://localhost:8000';
  }
  // En production (VPS / Nginx), utiliser des URLs relatives pour passer par le reverse proxy
  return '';
}

const API_BASE: string = getApiBaseUrl();

export type PortalSpace = 'student' | 'prof' | 'manager';

export interface ManagerMetrics {
  totalStudents: number;
  registeredStudents: number;
  pendingStudents: number;
  totalClassrooms: number;
  totalStaff: number;
  teacherCount: number;
  totalEvaluations: number;
  validationRate: number;
  totalInvoiced?: number;
  totalCollected?: number;
  totalRemaining?: number;
  collectionRate?: number;
}

export interface ManagerEnrolmentItem {
  id: string;
  studentName: string;
  className: string;
  date: string;
  status: string;
}

export interface ManagerDashboardData {
  metrics: ManagerMetrics;
  recentEnrolments: ManagerEnrolmentItem[];
}

export interface ManagerStudentItem {
  id: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  matricule: string;
  gender: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  address?: string;
  className: string;
  classroomId?: string;
  enrollmentId?: string;
  status: string;
  statusLabel?: string;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface ManagerStudentsData {
  metrics: {
    totalStudents: number;
    registeredCount: number;
    pendingCount: number;
  };
  pagination?: PaginationInfo;
  classrooms: { id: string; name: string }[];
  students: ManagerStudentItem[];
}


export interface ManagerInvoiceItem {
  id: string;
  reference: string;
  studentId: string;
  studentName: string;
  studentMatricule: string;
  className: string;
  title: string;
  category: string;
  categoryLabel: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'UNPAID' | 'PARTIAL' | 'PAID' | 'CANCELLED';
  statusLabel?: string;
  dueDate: string;
  createdAt: string;
}

export interface ManagerFinancePaymentItem {
  id: string;
  invoiceId: string;
  invoiceReference: string;
  reference: string;
  studentName: string;
  amount: number;
  method: string;
  methodLabel: string;
  date: string;
  note: string;
}

export interface ManagerFinanceMetrics {
  totalInvoiced: number;
  totalCollected: number;
  totalRemaining: number;
  collectionRate: number;
  invoiceCount: number;
}

export interface ManagerFinanceData {
  metrics: ManagerFinanceMetrics;
  pagination?: PaginationInfo;
  invoices: ManagerInvoiceItem[];
  history: ManagerFinancePaymentItem[];
  categories: { value: string; label: string }[];
  statuses: { value: string; label: string }[];
  paymentMethods: { value: string; label: string }[];
}

export interface ManagerFinanceItem {
  id: string;
  reference: string;
  studentName: string;
  amount: number;
  method: string;
  date: string;
}

export interface ManagerStaffItem {
  id: string;
  name: string;
  jobTitle: string;
  phone: string;
  email: string;
  isTeacher: boolean;
}

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
  isSuperAdmin?: boolean;
  roles?: string[];
  establishments?: any[];
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

function getActiveEstablishmentId(): string {
  try {
    const rawSession = localStorage.getItem('eteyelo.portal.session');
    if (rawSession) {
      const session = JSON.parse(rawSession);
      return session?.person?.establishmentId || '';
    }
  } catch {
    /* fallback */
  }
  return '';
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const activeEstId = getActiveEstablishmentId();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(activeEstId ? { 'X-Establishment-Id': activeEstId } : {}),
    ...(options.headers as Record<string, string> | undefined),
  };

  let finalPath = path;
  if (activeEstId && !path.includes('establishment_id=')) {
    const separator = finalPath.includes('?') ? '&' : '?';
    finalPath = `${finalPath}${separator}establishment_id=${encodeURIComponent(activeEstId)}`;
  }

  let finalBody = options.body;
  if (
    activeEstId &&
    options.body &&
    typeof options.body === 'string' &&
    options.method &&
    ['POST', 'PUT', 'PATCH'].includes(options.method.toUpperCase())
  ) {
    try {
      const parsed = JSON.parse(options.body);
      if (typeof parsed === 'object' && parsed !== null && !parsed.establishment_id) {
        parsed.establishment_id = activeEstId;
        finalBody = JSON.stringify(parsed);
      }
    } catch {
      /* non-JSON body */
    }
  }

  const res = await fetch(`${API_BASE}${finalPath}`, { ...options, body: finalBody, headers });

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

/** Authentification classique Django (nom d'utilisateur / email + mot de passe) pour le Directeur / Gestionnaire. */
export function loginManagerPassword(username: string, password: string): Promise<PortalSession> {
  return request<PortalSession>('/api/portal/auth/manager-login/', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

/** Recharge une session existante à partir du jeton (données à jour). */
export function fetchPortalSession(token: string): Promise<PortalSession> {
  return request<PortalSession>('/api/portal/session/', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function fetchManagerDashboard(establishmentId?: string): Promise<ManagerDashboardData> {
  const query = establishmentId ? `?establishment_id=${establishmentId}` : '';
  return request<ManagerDashboardData>(`/api/portal/manager/dashboard/${query}`);
}

export function fetchManagerStudents(
  search?: string,
  establishmentId?: string,
  status?: string,
  classroomId?: string,
  page?: number,
  pageSize?: number
): Promise<ManagerStudentsData> {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (establishmentId) params.append('establishment_id', establishmentId);
  if (status) params.append('status', status);
  if (classroomId) params.append('classroom_id', classroomId);
  if (page) params.append('page', String(page));
  if (pageSize) params.append('page_size', String(pageSize));
  return request<ManagerStudentsData>(`/api/portal/manager/students/?${params.toString()}`);
}

export function createManagerStudent(data: {
  first_name: string;
  last_name: string;
  gender?: string;
  date_of_birth?: string;
  place_of_birth?: string;
  address?: string;
  classroom_id?: string;
  is_repeater?: boolean;
  tutor_first_name?: string;
  tutor_last_name?: string;
  tutor_phone_number?: string;
  establishment_id?: string;
  status?: string;
}): Promise<{ success: boolean; message: string; student: any }> {
  return request('/api/portal/manager/students/', {
    method: 'POST',
    body: JSON.stringify({ action: 'create', ...data }),
  });
}

export function updateManagerStudentStatus(data: {
  student_id: string;
  status: string;
  establishment_id?: string;
}): Promise<{ success: boolean; message: string }> {
  return request('/api/portal/manager/students/', {
    method: 'POST',
    body: JSON.stringify({ action: 'update_status', ...data }),
  });
}


export function fetchManagerFinance(
  establishmentId?: string,
  search?: string,
  category?: string,
  status?: string,
  page?: number,
  pageSize?: number
): Promise<ManagerFinanceData> {
  const params = new URLSearchParams();
  if (establishmentId) params.append('establishment_id', establishmentId);
  if (search) params.append('search', search);
  if (category) params.append('category', category);
  if (status) params.append('status', status);
  if (page) params.append('page', String(page));
  if (pageSize) params.append('page_size', String(pageSize));
  return request<ManagerFinanceData>(`/api/portal/manager/finance/?${params.toString()}`);
}

export function collectManagerPayment(data: {
  invoice_id: string;
  amount: number;
  payment_method: string;
  reference?: string;
  note?: string;
}): Promise<{
  success: boolean;
  message: string;
  payment: any;
  invoice: any;
}> {
  return request('/api/portal/manager/finance/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function fetchManagerStaff(establishmentId?: string): Promise<{ staff: ManagerStaffItem[] }> {
  const query = establishmentId ? `?establishment_id=${establishmentId}` : '';
  return request<{ staff: ManagerStaffItem[] }>(`/api/portal/manager/staff/${query}`);
}

/** Transforme un chemin média relatif du backend en URL absolue. */
export function mediaUrl(path?: string | null): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
}

export interface EstablishmentItem {
  id: string;
  name: string;
  code?: string;
  city?: string;
}

export function fetchEstablishments(): Promise<{ establishments: EstablishmentItem[] }> {
  return request<{ establishments: EstablishmentItem[] }>('/api/portal/auth/establishments/');
}

export interface ManagerGradeItem {
  id: string;
  matricule: string;
  lastName: string;
  firstName: string;
  grade?: number | null;
  comment?: string;
  absenceStatus?: string;
}

export interface ManagerGradesData {
  evaluations: { id: string; name: string }[];
  classrooms: { id: string; name: string }[];
  subjects: { id: string; name: string }[];
  selectedEvalId?: string | null;
  selectedClassId?: string | null;
  selectedSubjectId?: string | null;
  evaluationSubjectId?: string | null;
  students: ManagerGradeItem[];
}

export function fetchManagerGrades(
  evaluationId?: string | { evaluation_id?: string; classroom_id?: string; subject_id?: string; establishment_id?: string },
  classroomId?: string,
  subjectId?: string,
  establishmentId?: string
): Promise<ManagerGradesData> {
  let evalId = typeof evaluationId === 'string' ? evaluationId : evaluationId?.evaluation_id;
  let classId = typeof evaluationId === 'object' ? evaluationId?.classroom_id : classroomId;
  let subId = typeof evaluationId === 'object' ? evaluationId?.subject_id : subjectId;
  let estId = typeof evaluationId === 'object' ? evaluationId?.establishment_id : establishmentId;

  const params = new URLSearchParams();
  if (evalId && typeof evalId === 'string' && evalId !== '[object Object]') params.append('evaluation_id', evalId);
  if (classId && typeof classId === 'string' && classId !== '[object Object]') params.append('classroom_id', classId);
  if (subId && typeof subId === 'string' && subId !== '[object Object]') params.append('subject_id', subId);
  if (estId && typeof estId === 'string' && estId !== '[object Object]') params.append('establishment_id', estId);
  return request<ManagerGradesData>(`/api/portal/manager/grades/?${params.toString()}`);
}

export function saveManagerGrades(data: {
  evaluation_id?: string;
  evaluation_session_id?: string;
  classroom_id: string;
  subject_id: string;
  establishment_id?: string;
  grades: {
    student_id: string;
    value: number | null;
    comment?: string;
    absence_status?: string;
  }[];
}): Promise<{ success: boolean; message: string; error?: string }> {
  return request('/api/portal/manager/grades/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export { API_BASE };


