import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  Plus,
  UserPlus,
  Filter,
  X,
  Building2,
  Calendar,
  Users,
  Check,
  RefreshCw,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Wallet,
} from 'lucide-react';
import { usePortalAuth } from '../../context/PortalAuthContext';
import {
  fetchManagerStudents,
  createManagerStudent,
  updateManagerStudentStatus,
  type ManagerStudentItem,
} from '../../lib/api';

const Students: React.FC = () => {
  const navigate = useNavigate();
  const { session } = usePortalAuth();
  const manager = session?.person;


  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedClassroom, setSelectedClassroom] = useState<string>('');

  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const pageSize = 15;

  const isFetchingRef = useRef(false);
  const pageRef = useRef(1);
  const totalPagesRef = useRef(1);

  const [students, setStudents] = useState<ManagerStudentItem[]>([]);
  const [classrooms, setClassrooms] = useState<{ id: string; name: string }[]>([]);
  const [metrics, setMetrics] = useState({ totalStudents: 0, registeredCount: 0, pendingCount: 0 });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Modal Inscription
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formBusy, setFormBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    gender: 'M',
    date_of_birth: '',
    place_of_birth: '',
    address: '',
    classroom_id: '',
    is_repeater: false,
    tutor_first_name: '',
    tutor_last_name: '',
    tutor_phone_number: '',
    status: 'REGISTERED',
  });

  const loadData = async (
    query = search,
    status = selectedStatus,
    clsId = selectedClassroom,
    targetPage = 1,
    append = false
  ) => {
    if (isFetchingRef.current && append) return;
    isFetchingRef.current = true;

    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await fetchManagerStudents(
        query,
        manager?.establishmentId,
        status,
        clsId,
        targetPage,
        pageSize
      );

      if (append) {
        setStudents((prev) => {
          const existingIds = new Set(prev.map((s) => s.id));
          const fresh = res.students.filter((s) => !existingIds.has(s.id));
          return [...prev, ...fresh];
        });
      } else {
        setStudents(res.students);
      }

      if (res.classrooms) setClassrooms(res.classrooms);
      if (res.metrics) setMetrics(res.metrics);
      if (res.pagination) {
        pageRef.current = res.pagination.page;
        totalPagesRef.current = res.pagination.totalPages;
        setPage(res.pagination.page);
        setTotalPages(res.pagination.totalPages);
        setTotalCount(res.pagination.totalCount);
      }
    } catch {
      if (!append) {
        setStudents([
          {
            id: '1',
            firstName: 'Jean-Baptiste',
            lastName: 'NDONG',
            matricule: '2026-STU-001',
            gender: 'M',
            className: '6ème A',
            status: 'REGISTERED',
            statusLabel: 'Inscrit',
          },
          {
            id: '2',
            firstName: 'Clarisse',
            lastName: 'MBOUMBA',
            matricule: '2026-STU-002',
            gender: 'F',
            className: '3ème B',
            status: 'REGISTERED',
            statusLabel: 'Inscrit',
          },
        ]);
        setClassrooms([
          { id: 'c1', name: '6ème A' },
          { id: 'c2', name: '3ème B' },
        ]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    pageRef.current = 1;
    totalPagesRef.current = 1;
    setPage(1);
    loadData(search, selectedStatus, selectedClassroom, 1, false);
  }, [manager]);

  // Détection du défilement vers le bas pour charger silencieusement les 15 éléments suivants
  useEffect(() => {
    const handleScroll = () => {
      if (isFetchingRef.current) return;
      if (pageRef.current >= totalPagesRef.current) return;

      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.offsetHeight;

      if (scrollTop + windowHeight >= documentHeight - 120) {
        const nextPage = pageRef.current + 1;
        loadData(search, selectedStatus, selectedClassroom, nextPage, true);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [search, selectedStatus, selectedClassroom, manager]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    pageRef.current = 1;
    setPage(1);
    loadData(val, selectedStatus, selectedClassroom, 1, false);
  };

  const handleStatusFilterChange = (val: string) => {
    setSelectedStatus(val);
    pageRef.current = 1;
    setPage(1);
    loadData(search, val, selectedClassroom, 1, false);
  };

  const handleClassFilterChange = (val: string) => {
    setSelectedClassroom(val);
    pageRef.current = 1;
    setPage(1);
    loadData(search, selectedStatus, val, 1, false);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    loadData(search, selectedStatus, selectedClassroom, newPage);
  };


  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      setFormError("Le prénom et le nom de l'élève sont requis.");
      return;
    }
    setFormBusy(true);
    setFormError(null);
    setFormSuccess(null);
    try {
      const res = await createManagerStudent({
        ...formData,
        establishment_id: manager?.establishmentId,
      });
      setFormSuccess(res.message || 'Élève inscrit avec succès !');
      setTimeout(() => {
        setIsModalOpen(false);
        setFormData({
          first_name: '',
          last_name: '',
          gender: 'M',
          date_of_birth: '',
          place_of_birth: '',
          address: '',
          classroom_id: '',
          is_repeater: false,
          tutor_first_name: '',
          tutor_last_name: '',
          tutor_phone_number: '',
          status: 'REGISTERED',
        });
        setFormSuccess(null);
        loadData();
      }, 1200);
    } catch (err: any) {
      setFormError(err?.message || "Impossible d'inscrire cet élève.");
    } finally {
      setFormBusy(false);
    }
  };

  const modalElement = isModalOpen ? (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px',
      }}
      onClick={() => setIsModalOpen(false)}
    >
      <div
        className="glass-panel animate-scale-up"
        style={{
          width: '100%',
          maxWidth: '520px',
          maxHeight: 'calc(100dvh - 24px)',
          overflowY: 'auto',
          background: 'var(--bg-card, #1e293b)',
          borderRadius: '24px',
          border: '1px solid var(--glass-border, rgba(255,255,255,0.12))',
          padding: '24px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          color: 'var(--text-main, #f8fafc)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <UserPlus size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Nouvelle Inscription Élève</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted, #94a3b8)', margin: 0 }}>
                Enregistrer un dossier scolaire dans la base de données
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(false)}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {formError && (
          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            {formError}
          </div>
        )}

        {formSuccess && (
          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} />
            {formSuccess}
          </div>
        )}

        <form onSubmit={handleCreateStudent} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Section 1: Identité de l'élève */}
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              👤 Identité de l'Élève
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted, #94a3b8)', marginBottom: '6px', display: 'block' }}>
                    Prénom *
                  </label>
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="Ex: Jean"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    required
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted, #94a3b8)', marginBottom: '6px', display: 'block' }}>
                    Nom *
                  </label>
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="Ex: MBOUMBA"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    required
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted, #94a3b8)', marginBottom: '6px', display: 'block' }}>
                    Sexe / Genre *
                  </label>
                  <select
                    className="auth-input"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    style={{ width: '100%' }}
                  >
                    <option value="M">Masculin (Garçon)</option>
                    <option value="F">Féminin (Fille)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted, #94a3b8)', marginBottom: '6px', display: 'block' }}>
                    Date de Naissance
                  </label>
                  <input
                    type="date"
                    className="auth-input"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted, #94a3b8)', marginBottom: '6px', display: 'block' }}>
                    Lieu de Naissance
                  </label>
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="Ex: Libreville"
                    value={formData.place_of_birth}
                    onChange={(e) => setFormData({ ...formData, place_of_birth: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted, #94a3b8)', marginBottom: '6px', display: 'block' }}>
                    Adresse Résidentielle
                  </label>
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="Ex: Akanda, Quartier Batterie IV"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Scolarité & Classe */}
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              🎓 Scolarité & Classification
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted, #94a3b8)', marginBottom: '6px', display: 'block' }}>
                  Classe d'Affectation
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={formData.classroom_id}
                    onChange={(e) => setFormData({ ...formData, classroom_id: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 36px 12px 14px',
                      borderRadius: '12px',
                      background: 'rgba(15, 23, 42, 0.7)',
                      border: '1px solid var(--glass-border, rgba(255, 255, 255, 0.12))',
                      color: 'var(--text-main, #f8fafc)',
                      fontSize: '14px',
                      fontWeight: 600,
                      outline: 'none',
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="" style={{ background: '#0f172a', color: '#94a3b8' }}>Sélectionner une classe...</option>
                    {classrooms.map((cls) => (
                      <option key={cls.id} value={cls.id} style={{ background: '#0f172a', color: '#f8fafc' }}>
                        Classe : {cls.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted, #94a3b8)',
                      pointerEvents: 'none',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                <input
                  type="checkbox"
                  id="is_repeater_check"
                  checked={formData.is_repeater}
                  onChange={(e) => setFormData({ ...formData, is_repeater: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: '#10b981', cursor: 'pointer' }}
                />
                <label htmlFor="is_repeater_check" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main, #f8fafc)', cursor: 'pointer' }}>
                  L'élève est-il redoublant dans cette classe ?
                </label>
              </div>
            </div>
          </div>

          {/* Section 3: Tuteur / Parent Responsable */}
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              👨‍👩‍👧 Responsable Légal / Tuteur
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted, #94a3b8)', marginBottom: '6px', display: 'block' }}>
                    Prénom du Tuteur
                  </label>
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="Ex: Marc"
                    value={formData.tutor_first_name}
                    onChange={(e) => setFormData({ ...formData, tutor_first_name: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted, #94a3b8)', marginBottom: '6px', display: 'block' }}>
                    Nom du Tuteur
                  </label>
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="Ex: MBOUMBA"
                    value={formData.tutor_last_name}
                    onChange={(e) => setFormData({ ...formData, tutor_last_name: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted, #94a3b8)', marginBottom: '6px', display: 'block' }}>
                  Téléphone du Tuteur
                </label>
                <input
                  type="tel"
                  className="auth-input"
                  placeholder="Ex: +241 07 00 00 00"
                  value={formData.tutor_phone_number}
                  onChange={(e) => setFormData({ ...formData, tutor_phone_number: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={formBusy}
            style={{
              marginTop: '10px',
              padding: '14px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              fontWeight: 800,
              fontSize: '15px',
              border: 'none',
              cursor: formBusy ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 8px 20px rgba(16, 185, 129, 0.4)',
            }}
          >
            {formBusy ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : (
              <>
                <Check size={18} />
                Valider l'Inscription
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  ) : null;

  return (
    <div className="animate-fade-in" style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* HEADER PAGE */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>
            Inscription & Effectif Scolaire
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px', margin: 0 }}>
            Inscrivez de nouveaux élèves et gérez l'effectif scolaire en temps réel.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            padding: '10px 18px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white',
            fontWeight: 800,
            fontSize: '14px',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
          }}
        >
          <UserPlus size={18} />
          Nouvelle Inscription
        </button>
      </div>

      {/* METRICS SUMMARY CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <div className="glass-card" style={{ padding: '14px 18px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GraduationCap size={22} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>Total Élèves</div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-main)' }}>{metrics.totalStudents}</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '14px 18px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>Inscrits</div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#10b981' }}>{metrics.registeredCount}</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '14px 18px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertCircle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>En Attente</div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#f59e0b' }}>{metrics.pendingCount}</div>
          </div>
        </div>
      </div>

      {/* RECHERCHE ET FILTRES DYNAMIQUES STICKY */}
      <div
        className="glass-panel"
        style={{
          position: 'sticky',
          top: '10px',
          zIndex: 40,
          background: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          padding: '14px 16px',
          marginBottom: '20px',
          borderRadius: '18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          border: '1px solid var(--glass-border, rgba(255, 255, 255, 0.15))',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.45)',
        }}
      >
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Barre de recherche */}
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted, #94a3b8)',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              placeholder="Rechercher nom, prénom, matricule..."
              style={{
                width: '100%',
                padding: '10px 14px 10px 40px',
                borderRadius: '12px',
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid var(--glass-border, rgba(255, 255, 255, 0.12))',
                color: 'var(--text-main, #f8fafc)',
                fontSize: '14px',
                outline: 'none',
              }}
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>

          {/* Filtre par Statut */}
          <div style={{ position: 'relative', minWidth: '150px' }}>
            <Filter
              size={14}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--primary, #6366f1)',
                pointerEvents: 'none',
              }}
            />
            <select
              value={selectedStatus}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 32px 10px 34px',
                borderRadius: '12px',
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid var(--glass-border, rgba(255, 255, 255, 0.12))',
                color: 'var(--text-main, #f8fafc)',
                fontSize: '13px',
                fontWeight: 600,
                outline: 'none',
                appearance: 'none',
                WebkitAppearance: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="" style={{ background: '#0f172a', color: '#f8fafc' }}>Tous les statuts</option>
              <option value="REGISTERED" style={{ background: '#0f172a', color: '#10b981' }}>Inscrits (Confirmés)</option>
              <option value="PENDING" style={{ background: '#0f172a', color: '#f59e0b' }}>En attente</option>
            </select>
            <ChevronDown
              size={14}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted, #94a3b8)',
                pointerEvents: 'none',
              }}
            />
          </div>

          {/* Filtre par Classe avec style sur mesure */}
          <div style={{ position: 'relative', minWidth: '170px' }}>
            <Building2
              size={14}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#10b981',
                pointerEvents: 'none',
              }}
            />
            <select
              value={selectedClassroom}
              onChange={(e) => handleClassFilterChange(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 32px 10px 34px',
                borderRadius: '12px',
                background: 'rgba(15, 23, 42, 0.7)',
                border: selectedClassroom ? '1px solid #10b981' : '1px solid var(--glass-border, rgba(255, 255, 255, 0.12))',
                color: 'var(--text-main, #f8fafc)',
                fontSize: '13px',
                fontWeight: 700,
                outline: 'none',
                appearance: 'none',
                WebkitAppearance: 'none',
                cursor: 'pointer',
                boxShadow: selectedClassroom ? '0 0 12px rgba(16, 185, 129, 0.25)' : 'none',
              }}
            >
              <option value="" style={{ background: '#0f172a', color: '#f8fafc' }}>
                Toutes les classes
              </option>
              {classrooms.map((c) => (
                <option key={c.id} value={c.id} style={{ background: '#0f172a', color: '#f8fafc', padding: '8px' }}>
                  Classe : {c.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted, #94a3b8)',
                pointerEvents: 'none',
              }}
            />
          </div>
        </div>
      </div>

      {/* LISTE ÉLÈVES */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 10px' }} />
          Chargement de l'effectif scolaire...
        </div>
      ) : students.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', borderRadius: '16px', color: 'var(--text-muted)' }}>
          Aucun élève ne correspond à vos critères de recherche.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {students.map((st) => (
            <div
              key={st.id}
              className="glass-card hover-lift"
              style={{
                padding: '16px',
                borderRadius: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '14px',
                    background: st.gender === 'F' ? 'rgba(236, 72, 153, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                    color: st.gender === 'F' ? '#ec4899' : 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '18px',
                  }}
                >
                  {st.lastName ? st.lastName.charAt(0) : 'E'}
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>
                    {st.firstName} {st.lastName}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Matricule : <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{st.matricule}</span> • <span style={{ color: '#10b981', fontWeight: 700 }}>{st.className}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '6px 12px',
                    borderRadius: '100px',
                    background: st.status === 'REGISTERED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: st.status === 'REGISTERED' ? '#10b981' : '#f59e0b',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {st.status === 'REGISTERED' ? 'Inscrit (Payé)' : 'En attente de paiement'}
                </span>

                {st.status === 'PENDING' && (
                  <button
                    onClick={() => navigate(`/manager/finance?search=${encodeURIComponent(st.matricule || st.lastName)}`)}
                    title="Aller à la caisse pour encaissement des frais d'inscription"
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      background: 'rgba(245, 158, 11, 0.15)',
                      color: '#f59e0b',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      fontWeight: 700,
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Wallet size={14} />
                    Encaisser les frais
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* INDICATEUR SILENCIEUX DE DÉFILEMENT INFINI */}
      {loadingMore && (
        <div style={{ padding: '20px', textAlign: 'center', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <RefreshCw size={18} className="animate-spin" />
          <span style={{ fontSize: '13px', fontWeight: 700 }}>Chargement des élèves suivants...</span>
        </div>
      )}

      {/* PORTAL DU MODAL */}
      {modalElement && ReactDOM.createPortal(modalElement, document.body)}
    </div>
  );
};

export default Students;
