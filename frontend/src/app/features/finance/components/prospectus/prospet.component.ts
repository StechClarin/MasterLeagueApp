import { Component, ElementRef, HostListener, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface ProspectusModule {
  name: string;
  desc: string;
  tags: string[];
  color: string;
  soft: string;
  paths: string[];
}

interface Pack {
  name: string;
  badge: string;
  price: string;
  period: string;
  desc: string;
  features: string[];
  cta: string;
  highlight: boolean;
  icon: string;
  paths: string[];
}

@Component({
  selector: 'app-prospet',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './prospet.component.html',
  styles: [`
:host { display: block; font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif; color-scheme: light; }

/* ============================================================
   VISUEL A4 PAYSAGE — PROFESSIONNEL · BLANC DOMINANT
   2 feuilles · 3 volets · 6 pages recto-verso
   ============================================================ */
.prospet-viewport { padding: 26px 18px 60px; background: #e9eef5; overflow: auto; }
.prospet-stage { width: max-content; margin: 0 auto; display: flex; flex-direction: column; gap: 18px; }
.sheet-label { display: flex; align-items: center; gap: 8px; color: #64748b; font-size: 12px; font-weight: 600; margin: 2px 2px 4px; }
.sl-pill { display: inline-flex; align-items: center; gap: 6px; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; font-weight: 800; font-size: 10.5px; padding: 3px 10px; border-radius: 999px; }
.sl-pill--alt { background: linear-gradient(135deg, #0284c7, #4f46e5); }
.sheet-frame { position: relative; }
.sheet-scale { width: 1123px; height: 794px; transform-origin: top left; }
.prospet-sheet { position: relative; width: 1123px; height: 794px; display: grid; grid-template-columns: repeat(3, 374px); overflow: hidden; border-radius: 6px; background: #ffffff; box-shadow: 0 30px 60px rgba(15,23,42,.16), 0 0 0 1px rgba(15,23,42,.06); }

/* ============ PANNEAUX ============ */
.panel { position: relative; height: 794px; padding: 28px 25px 24px; display: flex; flex-direction: column; overflow: hidden; background: #ffffff; }
.panel + .panel { border-left: 1px solid #e2e8f0; }
.panel--p1 { background: radial-gradient(120% 95% at 88% -12%, rgba(99,102,241,.10), transparent 55%), radial-gradient(120% 95% at 4% 112%, rgba(236,72,153,.06), transparent 55%), linear-gradient(180deg, #ffffff 0%, #f8faff 100%); }
.panel--p6 { background: radial-gradient(120% 95% at 10% -12%, rgba(168,85,247,.08), transparent 55%), radial-gradient(120% 95% at 100% 112%, rgba(99,102,241,.08), transparent 55%), linear-gradient(180deg, #ffffff 0%, #f8faff 100%); }
.panel--p2 { --glow: rgba(99,102,241,.10); }
.panel--p3 { --glow: rgba(168,85,247,.10); }
.panel--p4 { --glow: rgba(16,185,129,.09); }
.panel--p5 { --glow: rgba(6,182,212,.10); }
.p-glow { position: absolute; top: -70px; right: -80px; width: 270px; height: 270px; border-radius: 50%; background: radial-gradient(circle, var(--glow, rgba(99,102,241,.10)), transparent 65%); pointer-events: none; }
.orb { position: absolute; border-radius: 50%; pointer-events: none; }
.orb--a { width: 380px; height: 380px; top: -130px; right: -110px; background: radial-gradient(circle, rgba(99,102,241,.18), transparent 62%); }
.orb--b { width: 330px; height: 330px; bottom: -130px; left: -90px; background: radial-gradient(circle, rgba(236,72,153,.12), transparent 62%); }
.grid-overlay { position: absolute; inset: 0; background-image: linear-gradient(rgba(79,70,229,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(79,70,229,.05) 1px, transparent 1px); background-size: 34px 34px; pointer-events: none; }

/* ============ REPÈRES DE PLIAGE & NUMÉROS DE PAGE ============ */
.fold-mark { position: absolute; top: 0; bottom: 0; left: 374px; width: 0; border-left: 1px dashed rgba(100,116,139,.4); z-index: 4; pointer-events: none; }
.fold-mark--2 { left: 748px; }
.fold-mark span { position: absolute; top: 50%; left: 9px; transform: translateY(-50%) rotate(90deg); transform-origin: left center; font-size: 7.5px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: rgba(100,116,139,.55); white-space: nowrap; }
.page-tag { position: absolute; z-index: 4; bottom: 10px; font-size: 7.5px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: rgba(71,85,105,.6); background: rgba(255,255,255,.9); border: 1px solid #e2e8f0; padding: 2px 8px; border-radius: 999px; }
.guides-off .fold-mark, .guides-off .page-tag { display: none; }

/* ============ STRUCTURE COMMUNE DES PAGES CONTENU ============ */
.p-head { position: relative; z-index: 2; }
.p-eyebrow { display: inline-flex; align-items: center; gap: 7px; font-size: 8.5px; font-weight: 800; letter-spacing: .22em; text-transform: uppercase; color: #4f46e5; }
.p-eyebrow::before { content: ''; width: 20px; height: 2px; border-radius: 2px; background: linear-gradient(90deg, #4f46e5, rgba(79,70,229,0)); }
.p-title { margin: 9px 0 0; font-family: 'Plus Jakarta Sans', 'Inter', sans-serif; font-size: 22px; line-height: 1.14; font-weight: 800; letter-spacing: -.02em; color: #0f172a; }
.p-desc { margin: 9px 0 0; font-size: 10.5px; line-height: 1.55; color: #475569; }
.p-body { position: relative; z-index: 2; display: flex; flex-direction: column; flex: 1; gap: 11px; margin-top: 18px; min-height: 0; }
.p-foot { position: relative; z-index: 2; margin-top: 16px; padding-top: 14px; border-top: 1px solid #e2e8f0; }
.p-note { margin: 12px 0 0; font-size: 9px; color: #64748b; line-height: 1.5; text-align: center; }
/* ============ CARTES MODULES ============ */
.mod-card { display: flex; gap: 12px; padding: 13px; border-radius: 14px; background: #f8fafc; border: 1px solid #e2e8f0; }
.mod-icon { flex: none; width: 40px; height: 40px; border-radius: 11px; display: flex; align-items: center; justify-content: center; background: var(--ms); color: var(--mc); }
.mod-icon svg { width: 20px; height: 20px; }
.mod-info { min-width: 0; }
.mod-name { margin: 0; font-size: 12.5px; font-weight: 700; color: #0f172a; letter-spacing: -.01em; }
.mod-desc { margin: 4px 0 0; font-size: 9.5px; line-height: 1.5; color: #475569; }
.mod-tags { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 8px; }
.tag { font-size: 8px; font-weight: 700; letter-spacing: .03em; color: #4f46e5; background: #eef2ff; border: 1px solid #c7d2fe; padding: 2.5px 8px; border-radius: 999px; }

/* ============ ESPACES CONNECTÉS ============ */
.spaces-box { border-radius: 13px; padding: 12px; background: #f8fafc; border: 1px solid #e2e8f0; }
.spaces-label { display: block; font-size: 8px; font-weight: 800; letter-spacing: .2em; text-transform: uppercase; color: #64748b; margin-bottom: 9px; }
.spaces-chips { display: flex; flex-wrap: wrap; gap: 7px; }
.space-chip { display: inline-flex; align-items: center; gap: 6px; font-size: 9px; font-weight: 700; color: #334155; padding: 5px 11px; border-radius: 999px; background: #ffffff; border: 1px solid #e2e8f0; }
.space-chip::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: #4f46e5; }
.space-chip--prof::before { background: #7c3aed; }
.space-chip--student::before { background: #10b981; }
.space-chip--parent::before { background: #f59e0b; }

/* ============ AVANTAGES ============ */
.benefit { display: flex; gap: 11px; padding: 10px 0; border-bottom: 1px dashed #e2e8f0; }
.benefit:first-child { padding-top: 0; }
.benefit:last-child { border-bottom: none; padding-bottom: 0; }
.ben-icon { flex: none; width: 32px; height: 32px; border-radius: 9px; display: flex; align-items: center; justify-content: center; background: var(--ms); color: var(--mc); }
.ben-icon svg { width: 16px; height: 16px; }
.ben-title { margin: 1px 0 0; font-size: 11.5px; font-weight: 700; color: #0f172a; }
.ben-desc { margin: 2px 0 0; font-size: 9px; line-height: 1.45; color: #475569; }

.stats-strip { display: flex; border-radius: 12px; overflow: hidden; border: 1px solid #c7d2fe; background: linear-gradient(135deg, #eef2ff, #f5f3ff); }
.stat-cell { flex: 1; padding: 9px 4px; text-align: center; }
.stat-cell + .stat-cell { border-left: 1px solid #e2e8f0; }
.stat-cell b { display: block; font-size: 15px; font-weight: 800; color: #0f172a; letter-spacing: -.01em; }
.stat-cell span { display: block; margin-top: 2px; font-size: 7px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: #4f46e5; }

/* ============ PACKS (PAGES 3 & 4) ============ */
.pack-card { position: relative; border-radius: 15px; padding: 14px 15px 13px; background: #ffffff; border: 1px solid #e2e8f0; }
.pack-card + .pack-card { margin-top: 12px; }
.pack-card--hot { border: 2px solid #4f46e5; box-shadow: 0 12px 26px rgba(79,70,229,.14); }
.pack-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
.pack-name { margin: 0; display: flex; align-items: center; gap: 7px; font-size: 14px; font-weight: 800; color: #0f172a; letter-spacing: -.01em; }
.pack-name svg { flex: none; width: 15px; height: 15px; color: #4f46e5; }
.pack-badge { flex: none; font-size: 7px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; color: #fff; background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 3px 9px; border-radius: 999px; }
.pack-desc { margin: 4px 0 0; font-size: 9px; line-height: 1.45; color: #64748b; }
.pack-price { margin-top: 9px; display: flex; align-items: baseline; gap: 5px; }
.pack-price b { font-size: 19px; font-weight: 800; color: #4f46e5; letter-spacing: -.02em; }
.pack-price span { font-size: 8.5px; font-weight: 600; color: #64748b; }
.pack-feats { margin: 9px 0 0; padding: 9px 0 0; border-top: 1px dashed #e2e8f0; display: flex; flex-direction: column; gap: 5px; }
.pack-feat { display: flex; gap: 7px; align-items: flex-start; font-size: 8.8px; line-height: 1.4; color: #334155; }
.pack-feat svg { flex: none; width: 11px; height: 11px; margin-top: 1px; color: #10b981; }
.pack-cta { display: block; margin-top: 10px; padding: 6px 0; border-radius: 999px; text-align: center; font-size: 9px; font-weight: 700; }
.pack-cta--primary { color: #fff; background: linear-gradient(135deg, #4f46e5, #7c3aed); box-shadow: 0 8px 18px rgba(79,70,229,.3); }
.pack-cta--ghost { color: #4f46e5; background: #eef2ff; border: 1px solid #c7d2fe; }
.adh-box { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 12px; border-radius: 12px; padding: 10px 13px; background: #f0fdf4; border: 1px solid #bbf7d0; }
.adh-box p { margin: 0; font-size: 9px; color: #166534; line-height: 1.45; }
.adh-box b { display: block; font-size: 12px; }
.incl-list { margin-top: 12px; padding: 11px 13px; border-radius: 12px; background: #f8fafc; border: 1px solid #e2e8f0; }
.incl-list span { display: block; font-size: 8px; font-weight: 800; letter-spacing: .18em; text-transform: uppercase; color: #64748b; margin-bottom: 7px; }
.incl-list ul { margin: 0; padding: 0; list-style: none; display: flex; flex-wrap: wrap; gap: 5px; }
.incl-list li { font-size: 8.5px; font-weight: 600; color: #334155; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 999px; padding: 3px 9px; }
.pack-contact-note { margin-top: 12px; text-align: center; font-size: 8.5px; color: #64748b; line-height: 1.5; }
.pack-contact-note b { color: #4f46e5; }
/* ============ COUVERTURE (PAGE 1) ============ */
.cover-head { position: relative; z-index: 2; display: flex; flex-direction: column; gap: 13px; }
.logo-lockup { display: flex; align-items: center; gap: 11px; }
.logo-tile { width: 40px; height: 40px; border-radius: 11px; display: flex; align-items: center; justify-content: center; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 20px; font-weight: 800; color: #fff; background: linear-gradient(135deg, #4f46e5, #7c3aed); box-shadow: 0 8px 20px rgba(79,70,229,.35); }
.logo-name { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 19px; font-weight: 800; color: #0f172a; letter-spacing: -.02em; line-height: 1.1; }
.logo-sub { display: block; margin-top: 2px; font-size: 7px; font-weight: 800; letter-spacing: .3em; text-transform: uppercase; color: #4f46e5; }
.badge-pill { align-self: flex-start; display: inline-flex; align-items: center; gap: 6px; font-size: 9px; font-weight: 700; color: #4338ca; padding: 5px 11px; border-radius: 999px; background: #eef2ff; border: 1px solid #c7d2fe; }
.badge-pill svg { width: 12px; height: 12px; color: #f59e0b; }
.cover-body { position: relative; z-index: 2; margin-top: 20px; display: flex; flex-direction: column; }
.cover-title { margin: 0; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 29px; line-height: 1.12; font-weight: 800; letter-spacing: -.03em; color: #0f172a; }
.cover-title span { color: #4f46e5; }
.cover-sub { margin: 11px 0 0; font-size: 10.5px; line-height: 1.6; color: #475569; }
.mockup { margin-top: 18px; border-radius: 14px; overflow: hidden; border: 1px solid #e2e8f0; background: #ffffff; box-shadow: 0 18px 36px rgba(15,23,42,.12); }
.mockup-bar { display: flex; align-items: center; gap: 5px; padding: 7px 10px; background: #f1f5f9; border-bottom: 1px solid #e2e8f0; }
.mockup-bar .dot { width: 7px; height: 7px; border-radius: 50%; background: #cbd5e1; }
.mockup-bar .dot:nth-child(2) { background: #4f46e5; }
.mockup-url { margin-left: 8px; flex: 1; max-width: 150px; font-size: 7.5px; font-weight: 600; color: #475569; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 999px; padding: 2px 9px; text-align: center; }
.mockup-body { display: flex; height: 142px; }
.mockup-side { width: 44px; display: flex; flex-direction: column; align-items: center; gap: 9px; padding-top: 11px; background: #f8fafc; border-right: 1px solid #e2e8f0; }
.ms-logo { width: 20px; height: 20px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800; color: #fff; background: linear-gradient(135deg, #4f46e5, #7c3aed); }
.ms-nav { width: 26px; height: 6px; border-radius: 3px; background: rgba(100,116,139,.3); }
.ms-nav.active { background: linear-gradient(90deg, #4f46e5, #7c3aed); }
.mockup-main { flex: 1; display: flex; flex-direction: column; gap: 8px; padding: 10px; background: #f8fafc; }
.stat-row { display: flex; gap: 8px; }
.stat { flex: 1; border-radius: 8px; padding: 7px 8px; background: #ffffff; border: 1px solid #e2e8f0; }
.stat b { display: block; font-size: 11.5px; font-weight: 800; color: #0f172a; }
.stat small { font-size: 6.8px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: #64748b; }
.chart { flex: 1; display: flex; align-items: flex-end; gap: 7px; padding: 2px 4px 0; }
.chart i { flex: 1; border-radius: 3px 3px 2px 2px; background: linear-gradient(180deg, #6366f1, #4f46e5); }
.chart i:nth-child(even) { background: linear-gradient(180deg, #a855f7, #7c3aed); }
.trust-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 18px; }
.trust-chip { display: inline-flex; align-items: center; gap: 6px; font-size: 9px; font-weight: 700; color: #334155; padding: 6px 11px; border-radius: 999px; background: #ffffff; border: 1px solid #e2e8f0; }
.trust-chip svg { width: 12px; height: 12px; color: #4f46e5; }
.cover-foot { position: relative; z-index: 2; margin-top: auto; padding-top: 14px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; font-size: 8px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: #64748b; }
/* ============ DERNIÈRE PAGE (P6) — AVANTAGES & ACCOMPAGNEMENT ============ */
.p6-body { position: relative; z-index: 2; display: flex; flex-direction: column; flex: 1; }
.prox-box { margin-top: 14px; border-radius: 14px; padding: 13px 14px; background: linear-gradient(135deg, #eef2ff, #f5f3ff); border: 1px solid #c7d2fe; }
.prox-title { display: flex; align-items: center; gap: 7px; margin: 0; font-size: 11.5px; font-weight: 800; color: #3730a3; }
.prox-title svg { width: 14px; height: 14px; color: #4f46e5; }
.prox-desc { margin: 6px 0 0; font-size: 9px; line-height: 1.5; color: #475569; }
.prox-contact { margin-top: 10px; display: flex; flex-direction: column; gap: 6px; }
.contact-row { display: flex; align-items: center; gap: 8px; font-size: 9px; font-weight: 600; color: #334155; }
.contact-row svg { flex: none; width: 13px; height: 13px; color: #4f46e5; }
.qr-wrap { position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center; gap: 6px; margin-top: 13px; }
.qr { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; width: 90px; height: 90px; padding: 7px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 9px; }
.qr i { background: #ffffff; border-radius: 1px; }
.qr i.on { background: #0f172a; }
.qr-caption { font-size: 8px; font-weight: 600; color: #64748b; }
.p6-brand { font-size: 8.5px; font-weight: 700; color: #334155; }
.p6-copy { font-size: 7.5px; color: #64748b; }

/* ============ IMPRESSION ============ */
@media print {
  @page { size: A4 landscape; margin: 0; }
  app-root > app-prospet { display: block !important; }
  .prospet-toolbar, .sheet-label { display: none !important; }
  .prospet-viewport { padding: 0 !important; background: #fff !important; overflow: visible !important; }
  .prospet-stage { margin: 0 !important; gap: 0 !important; display: block !important; width: auto !important; }
  .sheet-frame { width: 297mm !important; height: 210mm !important; margin: 0 !important; page-break-after: always; break-after: page; }
  .sheet-frame:last-of-type { page-break-after: auto; break-after: auto; }
  .sheet-scale { transform: none !important; width: 297mm !important; height: 210mm !important; }
  .prospet-sheet { width: 297mm !important; height: 210mm !important; grid-template-columns: repeat(3, 1fr) !important; border-radius: 0 !important; box-shadow: none !important; }
  .panel { height: 210mm !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
}



`]
})
export class ProspetComponent implements OnInit {
  private el = inject(ElementRef);

  readonly year = new Date().getFullYear();
  readonly pdfBusy = signal(false);
  readonly pdfStatus = signal('');
  readonly showGuides = signal(true);
  readonly previewScale = signal(1);

  /** Coordonnées — À MODIFIER selon vos informations */
  readonly contact = {
    email: 'contact@ethernanos.com',
    phone: '+242 06 464 05 13',
    phoneAlt: '+237 6 99 76 54 32',
    site: 'ethernanos.space',
    brand: 'EtherNanos'
  };

  /** Modules du pack Starter — Page 2 (verso, volet 1) — source : seed_navigation.py */
  readonly coreModules: ProspectusModule[] = [
    {
      name: 'Référentiel',
      color: '#4f46e5', soft: 'rgba(79,70,229,.10)',
      desc: 'Configuration complète de l\'école : établissements, cycles & niveaux, années scolaires, classes, matières, salles, options & filieres, UE.',
      tags: ['Établissements', 'Cycles & Niveaux', 'Classes', 'Matières', 'Group & UE', 'Options & Filieres'],
      paths: ['M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z', 'M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2', 'M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2', 'M10 6h4', 'M10 10h4', 'M10 14h4', 'M10 18h4']
    },
    {
      name: 'Vie Scolaire',
      color: '#7c3aed', soft: 'rgba(124,58,237,.10)',
      desc: 'Gestion des apprenants (élèves) et de leurs inscriptions, de l\'arrivée à la sortie.',
      tags: ['Élèves', 'Inscriptions', 'Scolarité'],
      paths: ['M22 10v6', 'M2 10l10-5 10 5-10 5z', 'M6 12v5c3 3 9 3 12 0v-5']
    },
    {
      name: 'Finance',
      color: '#059669', soft: 'rgba(5,150,105,.10)',
      desc: 'Configuration des tarifs, facturation, encaissements, dépenses et generation des rapports de caisses.',
      tags: ['Tarifs', 'Factures', 'Paiements','Dépenses', 'Recouvrement'],
      paths: ['M21 12V7H5a2 2 0 0 1 0-4h14v4', 'M3 5v14a2 2 0 0 0 2 2h16v-5', 'M18 12a2 2 0 0 0 0 4h4v-4']
    },
    {
      name: 'Logistique',
      color: '#d97706', soft: 'rgba(217,119,6,.10)',
      desc: 'Gestion de materiel et fourniture de l\'éblissement',
      tags: ['Equipements','Fournitures et Consommables'],
      paths: ['M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z', 'M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z']
    }
  ];

  /** Modules Standard & Premium — Page 5 (recto, volet 1) — source : seed_navigation.py */
  readonly opsModules: ProspectusModule[] = [
    {
      name: 'Évaluations',
      color: '#db2777', soft: 'rgba(219,39,119,.10)',
      desc: 'Sessions d\'examens, saisie des notes et génération des bulletins.',
      tags: ['Examens', 'Notes', 'Bulletins', 'Barèmes'],
      paths: ['M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2', 'M12 11h4', 'M12 16h4', 'M8 11h.01', 'M8 16h.01', 'M9 2h6v4H9z']
    },
    {
      name: 'Ressources Humaines',
      color: '#d97706', soft: 'rgba(217,119,6,.10)',
      desc: 'Gestion du personnel, types de contrat et affectations des enseignants.',
      tags: ['Personnel', 'Contrats', 'Affectations'],
      paths: ['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M22 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75']
    },
    {
      name: 'Académique',
      color: '#0284c7', soft: 'rgba(2,132,199,.10)',
      desc: 'Emploi du temps, plannings pédagogiques et suivi de la scolarité.',
      tags: ['Emploi du temps', 'Plannings'],
      paths: ['M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z', 'M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z']
    }
  ];

  /** Nos packs — Pages 3 & 4 */
  readonly packs: Pack[] = [
    {
      name: 'Pack Starter',
      badge: '',
      icon: 'rocket',
      price: '450 000',
      period: 'FCFA / an',
      desc: 'Le socle pour digitaliser la configuration, les inscriptions et la finance de votre école.',
      features: [
        'Dashboard et indicateur',
        'Configuration de l\'école(Réferentiel) : Etablissement, Cycles&Niveaux, classe ',
        'Gestion des apprenants & inscriptions (certificat d\'inscription, transfert)',
        'Finance : tarifs, facturation, encaissements, Etat de recouvrement'
      ],
      cta: 'Choisir Starter',
      highlight: false,
      paths: ['M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z', 'm12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z', 'M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0', 'M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5']
    },
    {
      name: 'Pack Standard',
      badge: 'Populaire',
      icon: 'star',
      price: '650 000',
      period: 'FCFA / an',
      desc: 'Le pack le plus choisi : pilotage pédagogique complet et portail élève.',
      features: [
        'Dashboard et indicateur',
        'Configuration de l\'école avec Réferentiel au complet',
        'Gestion des apprenants & inscriptions (certificat d\'inscription, transfert, suivi d\'evolution)',
        'Finance : tarifs, facturation, encaissements,Gestion des dépenses, Etat de recouvrement',
        'Évaluations : examens, notes & bulletins',
        'Ressources humaines & affectations des profs',
        'Dépenses, logistique & palnning(emploi du temps)',
        'Portail élève : consultation des notes en ligne',
        
      ],
      cta: 'Choisir Standard',
      highlight: false,
      paths: ['M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z']
    },
    {
      name: 'Pack Premium',
      badge: 'Le plus complet',
      icon: 'crown',
      price: '750 000',
      period: 'FCFA / an',
      desc: 'L\'expérience complète pour une école 100 % connectée.',
      features: [
        'Accès à tous les modules & fonctionnalités',
        'Portail élève : notes, annonces & courbes d\'évolution',
        'Portail professeur : saisie des notes & suivi de classe',
        'Suivi de l\'évolution des élèves par l\'école',
        'Impression des cartes scolaires'
      ],
      cta: 'Choisir Premium',
      highlight: true,
      paths: ['M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.735H5.81a1 1 0 0 1-.957-.735L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z', 'M5 21h14']
    }
  ];
  /** Avantages — Dernière page (P6, recto volet 2) */
  readonly benefits = [
    {
      title: 'Zéro papier',
      color: '#0284c7', soft: 'rgba(2,132,199,.10)',
      desc: 'Fini les registres manuels et les classeurs : chaque donnée est digitalisée et retrouvable en un clic.',
      paths: ['M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z', 'M14 2v4a2 2 0 0 0 2 2h4', 'M10 9H8', 'M16 13H8', 'M16 17H8']
    },
    {
      title: 'Gain de temps',
      color: '#059669', soft: 'rgba(5,150,105,.10)',
      desc: 'Jusqu\'à 80 % de temps administratif en moins grâce à l\'automatisation des tâches répétitives.',
      paths: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z', 'M12 6v6l4 2']
    },
    {
      title: 'Pilotage en temps réel',
      color: '#4f46e5', soft: 'rgba(79,70,229,.10)',
      desc: 'Tableaux de bord et rapports pour suivre scolarité, recouvrement et résultats en continu.',
      paths: ['M22 7l-8.5 8.5-5-5L2 17', 'M16 7h6v6']
    },
    {
      title: 'Sécurité garantie',
      color: '#db2777', soft: 'rgba(219,39,119,.10)',
      desc: 'Accès par rôles (RBAC), données chiffrées, badges QR / RFID et sauvegardes automatiques.',
      paths: ['M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z', 'm9 12 2 2 4-4']
    }
  ];

  readonly stats = [
    { value: '−80 %', label: 'temps administratif' },
    { value: '100 %', label: 'digitalisé' },
    { value: '24/7', label: 'accessible' },
    { value: '1', label: 'plateforme unique' }
  ];

  /** Frais d'adhésion — Page 4 */
  readonly adhesion = '150 000';

  /** Inclus dans tous les packs — Page 4 */
  readonly includedInAll = ['Support & formation', 'Sauvegardes automatiques', 'Mises à jour incluses', 'Données sécurisées', 'Accompagnement EtherNanos'];

  readonly spaces = [
    { label: 'Administration', cls: 'admin' },
    { label: 'Professeur', cls: 'prof' },
    { label: 'Étudiant', cls: 'student' },
    { label: 'Parent', cls: 'parent' }
  ];

  readonly trustChips = [
    {
      label: '100 % sécurisé',
      paths: ['M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z', 'm9 12 2 2 4-4']
    },
    { label: 'Architecture modulaire', paths: ['M3 3h7v7H3z', 'M14 3h7v7h-7z', 'M14 14h7v7h-7z', 'M3 14h7v7H3z'] },
    {
      label: 'Espaces connectés',
      paths: ['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M22 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75']
    }
  ];

  /** QR code décoratif (déterministe) — Page 6 */
  readonly qrCells: boolean[] = (() => {
    const cells = new Array<boolean>(49).fill(false);
    const mark = (x: number, y: number) => { cells[y * 7 + x] = true; };
    const finder = (ox: number, oy: number) => {
      for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) {
        if (x === 0 || x === 2 || y === 0 || y === 2 || (x === 1 && y === 1)) mark(ox + x, oy + y);
      }
    };
    finder(0, 0); finder(0, 4); finder(4, 0);
    for (let i = 0; i < 49; i++) {
      const x = i % 7, y = Math.floor(i / 7);
      if (x > 2 || y > 2) { if (((x * 7 + y) % 3) === 0 || ((x + y) % 5) === 0) mark(x, y); }
    }
    return cells;
  })();

  ngOnInit() { this.computeScale(); }

  @HostListener('window:resize')
  onResize() { this.computeScale(); }

  /** Ajuste la taille d'affichage des feuilles pour tenir dans la largeur de l'écran */
  private computeScale() {
    const vp = this.el.nativeElement.querySelector('.prospet-viewport') as HTMLElement | null;
    if (!vp) return;
    const avail = vp.clientWidth - 36;
    this.previewScale.set(Math.max(0.45, Math.min(1, avail / 1123)));
  }

  print() { window.print(); }

  /** Génère un PDF A4 paysage : feuille 1 (recto) puis feuille 2 (verso) */
  async downloadPdf() {
    if (this.pdfBusy()) return;
    this.pdfBusy.set(true);
    this.pdfStatus.set('');
    try {
      await (document as any).fonts?.ready;
      const host = this.el.nativeElement;
      const sheets = Array.from(host.querySelectorAll('.prospet-sheet')) as HTMLElement[];
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      for (let i = 0; i < sheets.length; i++) {
        const canvas = await html2canvas(sheets[i], { scale: 2, backgroundColor: '#ffffff', useCORS: true, logging: false });
        const img = canvas.toDataURL('image/jpeg', 0.95);
        if (i > 0) pdf.addPage('a4', 'landscape');
        pdf.addImage(img, 'JPEG', 0, 0, 297, 210, undefined, 'FAST');
      }
      pdf.save(`Prospectus-Eteyelo-${this.year}.pdf`);
      this.pdfStatus.set('PDF généré avec succès ✓');
    } catch (e) {
      console.error('Erreur génération PDF prospectus', e);
      this.pdfStatus.set('Erreur lors de la génération du PDF. Réessayez.');
    } finally {
      this.pdfBusy.set(false);
    }
  }
}


