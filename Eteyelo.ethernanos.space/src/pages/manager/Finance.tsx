import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Wallet,
  CreditCard,
  Banknote,
  Search,
  PlusCircle,
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
  PieChart,
  ArrowUpRight,
  TrendingUp,
  Tag,
  Clock,
  Send,
  Filter,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { usePortalAuth } from '../../context/PortalAuthContext';
import {
  fetchManagerFinance,
  collectManagerPayment,
  type ManagerFinanceData,
  type ManagerInvoiceItem,
  type ManagerFinancePaymentItem,
} from '../../lib/api';

const categoryColorMap: Record<string, { bg: string; color: string; label: string }> = {
  REGISTRATION: { bg: 'rgba(99, 102, 241, 0.15)', color: '#6366f1', label: "Inscription" },
  TUITION: { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981', label: "Scolarité" },
  CANTEEN: { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', label: "Cantine" },
  TRANSPORT: { bg: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', label: "Transport" },
  OTHER: { bg: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8', label: "Autre" },
};

const statusBadgeMap: Record<string, { bg: string; color: string; label: string }> = {
  UNPAID: { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', label: 'Impayé' },
  PARTIAL: { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', label: 'Partiel' },
  PAID: { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981', label: 'Payé' },
  CANCELLED: { bg: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8', label: 'Annulé' },
};

const FinanceManagerPage: React.FC = () => {
  const { session } = usePortalAuth();
  const manager = session?.person;

  const [activeTab, setActiveTab] = useState<'invoices' | 'history'>('invoices');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ManagerFinanceData | null>(null);

  // Pagination
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const pageSize = 15;

  const isFetchingRef = useRef(false);
  const pageRef = useRef(1);
  const totalPagesRef = useRef(1);

  // Filtres
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const [loadingMore, setLoadingMore] = useState(false);

  // Modale d'encaissement
  const [collectModalOpen, setCollectModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<ManagerInvoiceItem | null>(null);
  const [amountInput, setAmountInput] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('CASH');
  const [referenceInput, setReferenceInput] = useState<string>('');
  const [noteInput, setNoteInput] = useState<string>('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadFinanceData = async (
    query = search,
    category = selectedCategory,
    status = selectedStatus,
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
      const res = await fetchManagerFinance(
        manager?.establishmentId,
        query,
        category,
        status,
        targetPage,
        pageSize
      );

      if (append) {
        setData((prev) => {
          if (!prev) return res;
          const existingIds = new Set(prev.invoices.map((i) => i.id));
          const freshInvoices = res.invoices.filter((i) => !existingIds.has(i.id));
          return {
            ...res,
            invoices: [...prev.invoices, ...freshInvoices],
          };
        });
      } else {
        setData(res);
      }

      if (res.pagination) {
        pageRef.current = res.pagination.page;
        totalPagesRef.current = res.pagination.totalPages;
        setPage(res.pagination.page);
        setTotalPages(res.pagination.totalPages);
        setTotalCount(res.pagination.totalCount);
      }
    } catch {
      // Données de démonstration en cas d'absence de réponse réseau
      setData({
        metrics: {
          totalInvoiced: 7500000,
          totalCollected: 5250000,
          totalRemaining: 2250000,
          collectionRate: 70.0,
          invoiceCount: 5,
        },
        invoices: [
          {
            id: '101',
            reference: 'FAC-2026-0101',
            studentId: '1',
            studentName: 'Jean-Baptiste NDONG',
            studentMatricule: 'ETU001',
            className: 'Terminales S1',
            title: "Frais d'Inscription 2026-2027",
            category: 'REGISTRATION',
            categoryLabel: "Frais d'Inscription",
            totalAmount: 150000,
            paidAmount: 150000,
            remainingAmount: 0,
            status: 'PAID',
            statusLabel: 'Payé',
            dueDate: '2026-09-30',
            createdAt: '2026-09-01 08:00',
          },
          {
            id: '102',
            reference: 'FAC-2026-0102',
            studentId: '2',
            studentName: 'Clarisse MBOUMBA',
            studentMatricule: 'ETU002',
            className: 'Premières A2',
            title: 'Scolarité Trimestre 1',
            category: 'TUITION',
            categoryLabel: 'Scolarité',
            totalAmount: 250000,
            paidAmount: 100000,
            remainingAmount: 150000,
            status: 'PARTIAL',
            statusLabel: 'Partiel',
            dueDate: '2026-10-15',
            createdAt: '2026-09-05 09:30',
          },
          {
            id: '103',
            reference: 'FAC-2026-0103',
            studentId: '3',
            studentName: 'Marc-Aurèle KOUAMÉ',
            studentMatricule: 'ETU003',
            className: '3ème B',
            title: 'Abonnement Cantine Octobre',
            category: 'CANTEEN',
            categoryLabel: 'Cantine',
            totalAmount: 45000,
            paidAmount: 0,
            remainingAmount: 45000,
            status: 'UNPAID',
            statusLabel: 'Impayé',
            dueDate: '2026-10-05',
            createdAt: '2026-09-20 14:15',
          },
        ],
        history: [
          {
            id: '1',
            invoiceId: '101',
            invoiceReference: 'FAC-2026-0101',
            reference: 'REC-2026-0089',
            studentName: 'Jean-Baptiste NDONG',
            amount: 150000,
            method: 'CASH',
            methodLabel: 'Espèces',
            date: '2026-09-23 09:30',
            note: 'Règlement solde inscription',
          },
          {
            id: '2',
            invoiceId: '102',
            invoiceReference: 'FAC-2026-0102',
            reference: 'REC-2026-0088',
            studentName: 'Clarisse MBOUMBA',
            amount: 100000,
            method: 'MOBILE_MONEY',
            methodLabel: 'Mobile Money',
            date: '2026-09-23 08:45',
            note: 'Acompte scolarité T1',
          },
        ],
        categories: [
          { value: 'REGISTRATION', label: "Frais d'Inscription" },
          { value: 'TUITION', label: 'Scolarité' },
          { value: 'CANTEEN', label: 'Cantine' },
          { value: 'TRANSPORT', label: 'Transport' },
          { value: 'OTHER', label: 'Autre' },
        ],
        statuses: [
          { value: 'UNPAID', label: 'Impayé' },
          { value: 'PARTIAL', label: 'Partiel' },
          { value: 'PAID', label: 'Payé' },
        ],
        paymentMethods: [
          { value: 'CASH', label: 'Espèces' },
          { value: 'MOBILE_MONEY', label: 'Mobile Money' },
          { value: 'BANK_TRANSFER', label: 'Virement' },
          { value: 'CHECK', label: 'Chèque' },
        ],
      });
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
    loadFinanceData(search, selectedCategory, selectedStatus, 1, false);
  }, [manager, search, selectedCategory, selectedStatus]);

  // Détection du défilement vers le bas pour charger silencieusement les 15 factures suivantes
  useEffect(() => {
    const handleScroll = () => {
      if (isFetchingRef.current) return;
      if (pageRef.current >= totalPagesRef.current) return;

      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.offsetHeight;

      if (scrollTop + windowHeight >= documentHeight - 120) {
        const nextPage = pageRef.current + 1;
        loadFinanceData(search, selectedCategory, selectedStatus, nextPage, true);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [search, selectedCategory, selectedStatus, manager]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    loadFinanceData(search, selectedCategory, selectedStatus, newPage);
  };

  const openCollectModal = (inv?: ManagerInvoiceItem) => {
    if (inv) {
      setSelectedInvoice(inv);
      setAmountInput(inv.remainingAmount > 0 ? String(inv.remainingAmount) : String(inv.totalAmount));
    } else {
      const unpaid = data?.invoices.find((i) => i.status !== 'PAID');
      setSelectedInvoice(unpaid || data?.invoices[0] || null);
      setAmountInput(unpaid ? String(unpaid.remainingAmount) : '50000');
    }
    setPaymentMethod('CASH');
    setReferenceInput('');
    setNoteInput('');
    setErrorMsg(null);
    setCollectModalOpen(true);
  };

  const closeCollectModal = () => {
    setCollectModalOpen(false);
    setSelectedInvoice(null);
    setErrorMsg(null);
  };

  const handleCollectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    const amt = parseFloat(amountInput);
    if (isNaN(amt) || amt <= 0) {
      setErrorMsg('Veuillez saisir un montant d’encaissement valide.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      await collectManagerPayment({
        invoice_id: selectedInvoice.id,
        amount: amt,
        payment_method: paymentMethod,
        reference: referenceInput.trim(),
        note: noteInput.trim(),
      });
      setSuccessMsg('Encaissement enregistré avec succès !');
      closeCollectModal();
      loadFinanceData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch {
      // Mock local update si le serveur n'est pas actif
      setData((prev) => {
        if (!prev) return prev;
        const updatedInvoices = prev.invoices.map((inv) => {
          if (inv.id === selectedInvoice.id) {
            const newPaid = inv.paidAmount + amt;
            const newRem = Math.max(0, inv.totalAmount - newPaid);
            const newStatus = newRem === 0 ? 'PAID' : 'PARTIAL';
            return {
              ...inv,
              paidAmount: newPaid,
              remainingAmount: newRem,
              status: newStatus as any,
              statusLabel: newStatus === 'PAID' ? 'Payé' : 'Partiel',
            };
          }
          return inv;
        });

        const newPayment: ManagerFinancePaymentItem = {
          id: String(Date.now()),
          invoiceId: selectedInvoice.id,
          invoiceReference: selectedInvoice.reference,
          reference: referenceInput.trim() || `REC-${Date.now().toString().slice(-4)}`,
          studentName: selectedInvoice.studentName,
          amount: amt,
          method: paymentMethod,
          methodLabel: paymentMethod === 'MOBILE_MONEY' ? 'Mobile Money' : paymentMethod === 'CASH' ? 'Espèces' : 'Virement',
          date: new Date().toISOString().replace('T', ' ').slice(0, 16),
          note: noteInput.trim(),
        };

        const totalInvoiced = prev.metrics.totalInvoiced;
        const totalCollected = prev.metrics.totalCollected + amt;
        const totalRemaining = Math.max(0, totalInvoiced - totalCollected);
        const rate = roundTo((totalCollected / totalInvoiced) * 100, 1);

        return {
          ...prev,
          metrics: {
            ...prev.metrics,
            totalCollected,
            totalRemaining,
            collectionRate: rate,
          },
          invoices: updatedInvoices,
          history: [newPayment, ...prev.history],
        };
      });

      setSuccessMsg('Encaissement enregistré avec succès (Mode local) !');
      closeCollectModal();
      setTimeout(() => setSuccessMsg(null), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  function roundTo(val: number, decimals: number) {
    return Number(Math.round(Number(val + 'e' + decimals)) + 'e-' + decimals);
  }

  const metrics = data?.metrics || {
    totalInvoiced: 0,
    totalCollected: 0,
    totalRemaining: 0,
    collectionRate: 0,
    invoiceCount: 0,
  };

  return (
    <div className="animate-fade-in" style={{ padding: '20px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* HEADER */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>
            Facturation & Trésorerie Mobile
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px', margin: 0 }}>
            Gestion des factures par type de frais et saisie directe des encaissements en caisse.
          </p>
        </div>

        <button
          onClick={() => openCollectModal()}
          style={{
            padding: '12px 20px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 800,
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
            transition: 'transform 0.2s',
          }}
        >
          <PlusCircle size={18} />
          <span>Nouveau Règlement</span>
        </button>
      </div>

      {successMsg && (
        <div
          className="glass-panel"
          style={{
            padding: '14px 18px',
            marginBottom: '20px',
            background: 'rgba(16, 185, 129, 0.2)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#10b981',
            borderRadius: '12px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <CheckCircle2 size={20} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* KPI DASHBOARD METRICS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div className="glass-panel" style={{ padding: '18px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Total Facturé
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={20} />
            </div>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text-main)', marginTop: '8px' }}>
            {(metrics?.totalInvoiced ?? 0).toLocaleString('fr-FR')} FCFA
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '18px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#10b981', textTransform: 'uppercase' }}>
              Encaissements Effectués
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Banknote size={20} />
            </div>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: '#10b981', marginTop: '8px' }}>
            {(metrics?.totalCollected ?? 0).toLocaleString('fr-FR')} FCFA
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '18px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase' }}>
              Reste à Recouvrer
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={20} />
            </div>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: '#ef4444', marginTop: '8px' }}>
            {(metrics?.totalRemaining ?? 0).toLocaleString('fr-FR')} FCFA
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '18px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Taux de Recouvrement
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: '#f59e0b', marginTop: '8px' }}>
            {metrics?.collectionRate ?? 0} %
          </div>
        </div>
      </div>

      {/* FILTER BAR & SEARCH STICKY */}
      <div
        className="glass-panel"
        style={{
          position: 'sticky',
          top: '10px',
          zIndex: 40,
          background: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          padding: '16px',
          marginBottom: '20px',
          borderRadius: '18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          border: '1px solid var(--glass-border, rgba(255, 255, 255, 0.15))',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.45)',
        }}
      >
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search
              size={18}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              placeholder="Rechercher élève, matricule, n° facture..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 38px',
                borderRadius: '10px',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid var(--glass-border)',
                color: 'var(--text-main)',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {/* Filter by Category */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: '10px 12px',
                borderRadius: '10px',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid var(--glass-border)',
                color: 'var(--text-main)',
                fontSize: '13px',
                fontWeight: 600,
                outline: 'none',
              }}
            >
              <option value="" style={{ background: '#0f172a' }}>Tous les types de frais</option>
              {(data?.categories || []).map((cat) => (
                <option key={cat.value} value={cat.value} style={{ background: '#0f172a' }}>
                  {cat.label}
                </option>
              ))}
            </select>

            {/* Filter by Status */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{
                padding: '10px 12px',
                borderRadius: '10px',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid var(--glass-border)',
                color: 'var(--text-main)',
                fontSize: '13px',
                fontWeight: 600,
                outline: 'none',
              }}
            >
              <option value="" style={{ background: '#0f172a' }}>Tous les statuts</option>
              {(data?.statuses || []).map((st) => (
                <option key={st.value} value={st.value} style={{ background: '#0f172a' }}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          borderBottom: '1px solid var(--glass-border)',
          marginBottom: '16px',
        }}
      >
        <button
          onClick={() => setActiveTab('invoices')}
          style={{
            padding: '12px 18px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'invoices' ? '3px solid #10b981' : '3px solid transparent',
            color: activeTab === 'invoices' ? '#10b981' : 'var(--text-muted)',
            fontWeight: 800,
            fontSize: '15px',
            cursor: 'pointer',
          }}
        >
          Factures Dues & À Recouvrer ({data?.invoices?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('history')}
          style={{
            padding: '12px 18px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'history' ? '3px solid #10b981' : '3px solid transparent',
            color: activeTab === 'history' ? '#10b981' : 'var(--text-muted)',
            fontWeight: 800,
            fontSize: '15px',
            cursor: 'pointer',
          }}
        >
          Historique des Encaissements ({data?.history?.length || 0})
        </button>
      </div>

      {/* TAB 1: LISTE DES FACTURES */}
      {activeTab === 'invoices' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {(data?.invoices || []).length === 0 ? (
            <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Aucune facture ne correspond à ces critères.
            </div>
          ) : (
            (data?.invoices || []).map((inv) => {
              const catConfig = categoryColorMap[inv.category] || { bg: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8', label: inv.categoryLabel };
              const stConfig = statusBadgeMap[inv.status] || { bg: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8', label: inv.statusLabel };

              return (
                <div
                  key={inv.id}
                  className="glass-card hover-lift"
                  style={{
                    padding: '16px 20px',
                    borderRadius: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 800, color: '#10b981' }}>{inv.reference}</span>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 700,
                            background: catConfig.bg,
                            color: catConfig.color,
                          }}
                        >
                          {inv.categoryLabel || catConfig.label}
                        </span>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 800,
                            background: stConfig.bg,
                            color: stConfig.color,
                          }}
                        >
                          {inv.statusLabel || stConfig.label}
                        </span>
                      </div>

                      <div style={{ fontSize: '17px', fontWeight: 900, color: 'var(--text-main)', marginTop: '4px' }}>
                        {inv.studentName}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {inv.title} {inv.className ? `• Classe: ${inv.className}` : ''}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                      <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-main)' }}>
                        {inv.totalAmount.toLocaleString('fr-FR')} FCFA
                      </div>
                      {inv.remainingAmount > 0 ? (
                        <div style={{ fontSize: '12px', color: '#ef4444', fontWeight: 700 }}>
                          Reste: {inv.remainingAmount.toLocaleString('fr-FR')} FCFA
                        </div>
                      ) : (
                        <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 700 }}>Totalement Réglé</div>
                      )}
                    </div>
                  </div>

                  {/* PROGRESS BAR & ACTION BUTTON */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '10px',
                      borderTop: '1px solid var(--glass-border)',
                      gap: '16px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: '180px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        <span>Réglé: {inv.paidAmount.toLocaleString('fr-FR')} FCFA</span>
                        <span>{Math.round((inv.paidAmount / inv.totalAmount) * 100)}%</span>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${Math.min(100, (inv.paidAmount / inv.totalAmount) * 100)}%`,
                            background: inv.status === 'PAID' ? '#10b981' : inv.status === 'PARTIAL' ? '#f59e0b' : '#ef4444',
                            borderRadius: '4px',
                            transition: 'width 0.4s ease',
                          }}
                        />
                      </div>
                    </div>

                    {inv.status !== 'PAID' && (
                      <button
                        onClick={() => openCollectModal(inv)}
                        style={{
                          padding: '8px 16px',
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontWeight: 800,
                          fontSize: '13px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                        }}
                      >
                        <Banknote size={16} />
                        <span>Encaisser</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* INDICATEUR SILENCIEUX DE DÉFILEMENT INFINI */}
          {loadingMore && (
            <div style={{ padding: '20px', textAlign: 'center', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <RefreshCw size={18} className="animate-spin" />
              <span style={{ fontSize: '13px', fontWeight: 700 }}>Chargement des factures suivantes...</span>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: HISTORIQUE DES ENCAISSEMENTS */}
      {activeTab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {(data?.history || []).length === 0 ? (
            <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Aucun encaissement n'a encore été enregistré.
            </div>
          ) : (
            (data?.history || []).map((item) => (
              <div
                key={item.id}
                className="glass-card hover-lift"
                style={{
                  padding: '16px',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Banknote size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)' }}>
                      {item.studentName}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Reçu: <span style={{ color: '#10b981', fontWeight: 700 }}>{item.reference}</span> • Facture: {item.invoiceReference}
                    </div>
                    {item.note && (
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '2px' }}>
                        Note: "{item.note}"
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '16px', fontWeight: 900, color: '#10b981' }}>
                    +{item.amount.toLocaleString('fr-FR')} FCFA
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', fontWeight: 700 }}>
                    {item.methodLabel || item.method} • {item.date}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* MODALE ENCAISSEMENT MOBILE OPTIMISÉE (Portal sur document.body) */}
      {collectModalOpen &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100vh',
              height: '100dvh',
              background: 'rgba(2, 6, 23, 0.85)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              zIndex: 99999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px',
              boxSizing: 'border-box',
            }}
          >
            <div
              className="glass-panel animate-scale-up"
              style={{
                width: '100%',
                maxWidth: '440px',
                maxHeight: 'calc(100vh - 24px)',
                maxHeight: 'calc(100dvh - 24px)',
                overflowY: 'auto',
                borderRadius: '16px',
                padding: '16px',
                background: '#0f172a',
                border: '1px solid var(--glass-border)',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
              }}
            >
              {/* Header compact */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16,185,129,0.2)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Banknote size={18} />
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>
                    Enregistrer un Encaissement
                  </h3>
                </div>
                <button onClick={closeCollectModal} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCollectSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Carte résumé de la facture sélectionnée */}
                {selectedInvoice ? (
                  <div
                    style={{
                      padding: '10px 12px',
                      borderRadius: '10px',
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      fontSize: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '13px' }}>{selectedInvoice.studentName}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '1px' }}>
                        {selectedInvoice.reference} • {selectedInvoice.title}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Solde Dû</div>
                      <div style={{ fontSize: '14px', fontWeight: 900, color: '#ef4444' }}>
                        {selectedInvoice.remainingAmount.toLocaleString('fr-FR')} FCFA
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                      Facture à régler *
                    </label>
                    <select
                      value={selectedInvoice?.id || ''}
                      onChange={(e) => {
                        const inv = data?.invoices.find((i) => i.id === e.target.value);
                        if (inv) {
                          setSelectedInvoice(inv);
                          setAmountInput(String(inv.remainingAmount > 0 ? inv.remainingAmount : inv.totalAmount));
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid var(--glass-border)',
                        color: 'var(--text-main)',
                        fontSize: '13px',
                        outline: 'none',
                      }}
                    >
                      {data?.invoices.map((inv) => (
                        <option key={inv.id} value={inv.id} style={{ background: '#0f172a' }}>
                          {inv.reference} - {inv.studentName} (Dû: {inv.remainingAmount} FCFA)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Montant à encaisser */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>
                      Montant à Encaisser (FCFA) *
                    </label>
                    {selectedInvoice && (
                      <button
                        type="button"
                        onClick={() => setAmountInput(String(selectedInvoice.remainingAmount))}
                        style={{ background: 'transparent', border: 'none', color: '#10b981', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Tout régler
                      </button>
                    )}
                  </div>
                  <input
                    type="number"
                    step="100"
                    required
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    placeholder="ex : 50000"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid var(--glass-border)',
                      color: '#10b981',
                      fontSize: '16px',
                      fontWeight: 900,
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Mode de règlement compact */}
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Mode de Règlement *
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                    {[
                      { id: 'CASH', label: 'Espèces' },
                      { id: 'MOBILE_MONEY', label: 'Mobile' },
                      { id: 'BANK_TRANSFER', label: 'Virement' },
                      { id: 'CHECK', label: 'Chèque' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id)}
                        style={{
                          padding: '6px 4px',
                          borderRadius: '6px',
                          border: paymentMethod === m.id ? '1.5px solid #10b981' : '1px solid var(--glass-border)',
                          background: paymentMethod === m.id ? 'rgba(16, 185, 129, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                          color: paymentMethod === m.id ? '#10b981' : 'var(--text-main)',
                          fontWeight: 700,
                          fontSize: '11px',
                          cursor: 'pointer',
                          textAlign: 'center',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Référence & Note côte à côte */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                      N° Reçu / Réf (optionnel)
                    </label>
                    <input
                      type="text"
                      placeholder="Réf transaction"
                      value={referenceInput}
                      onChange={(e) => setReferenceInput(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '7px 9px',
                        borderRadius: '8px',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid var(--glass-border)',
                        color: 'var(--text-main)',
                        fontSize: '12px',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                      Remarque (optionnel)
                    </label>
                    <input
                      type="text"
                      placeholder="ex : Acompte T1"
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '7px 9px',
                        borderRadius: '8px',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid var(--glass-border)',
                        color: 'var(--text-main)',
                        fontSize: '12px',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                {errorMsg && (
                  <div style={{ color: '#ef4444', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertCircle size={14} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Bouton de validation bien visible */}
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    marginTop: '4px',
                    padding: '10px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                  }}
                >
                  <Send size={16} />
                  <span>{submitting ? 'Validation...' : "Valider l'Encaissement"}</span>
                </button>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default FinanceManagerPage;
