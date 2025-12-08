import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms'; // N'oublie pas ces imports
import { Apollo, QueryRef } from 'apollo-angular';
import { DocumentNode } from 'graphql';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ToastService } from '@core/services/toast.service';

@Component({ template: '' })
export abstract class BaseListComponent<T> implements OnInit {
  protected apollo = inject(Apollo);
  protected fb = inject(FormBuilder); // Important pour l'enfant

  abstract query: DocumentNode;
  abstract responseKey: string;
  abstract initFilterForm(): FormGroup;

  filterForm!: FormGroup;
  items$!: Observable<T[]>;
  isLoading = signal(true);
  queryRef!: QueryRef<any>;

  // Pagination State
  currentPage = signal(1);
  pageSize = signal(10);
  totalCount = signal(0);
  numPages = signal(0);

  ngOnInit(): void {
    this.filterForm = this.initFilterForm();
    this.initQuery();

    // Reactive Sync: Auto-refresh on mutation
    if (this.service && this.service.refresh$) {
      this.service.refresh$.subscribe(() => {
        this.refresh();
      });
    }
  }

  protected initQuery(): void {
    console.log('[BaseListComponent] initQuery called with query:', this.query);
    this.queryRef = this.apollo.watchQuery({
      query: this.query,
      variables: {
        ...this.filterForm.value,
        page: this.currentPage(),
        pageSize: this.pageSize()
      },
      notifyOnNetworkStatusChange: true,
      fetchPolicy: 'network-only'
    });

    this.items$ = this.queryRef.valueChanges.pipe(
      tap(result => this.isLoading.set(result.loading)),
      map((result: any) => {
        const data = result.data[this.responseKey];
        // Support both camelCase (Graphene default) and snake_case (Python raw)
        const totalCount = data?.totalCount ?? data?.total_count;
        const numPages = data?.numPages ?? data?.num_pages;

        // Auto-update pagination metadata if available
        if (totalCount !== undefined) {
          this.totalCount.set(totalCount);
          this.numPages.set(numPages ?? 0);
          // If the response has 'items', return that, otherwise return the data itself
          return data.items || data;
        }
        return data;
      })
    );
  }

  refresh() {
    this.queryRef.refetch({
      ...this.filterForm.value,
      page: this.currentPage(),
      pageSize: this.pageSize()
    });
  }

  // Pagination Methods
  nextPage() {
    if (this.currentPage() < this.numPages()) {
      this.currentPage.update(p => p + 1);
      this.refresh();
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
      this.refresh();
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.numPages()) {
      this.currentPage.set(page);
      this.refresh();
    }
  }
  // Service pour les opérations d'écriture (REST)
  abstract service: any; // On utilise any ou une interface commune si possible (ex: BaseService)
  protected toastService = inject(ToastService);

  // Status Toggle Generic
  toggleStatus(item: any) {
    if (!item || !item.id) return;

    // On suppose que l'item a une propriété isActive ou is_active
    // Mais le backend renvoie souvent isActive en camelCase via GraphQL
    // Le service attend l'ID.

    this.service.status(item.id).subscribe({
      next: (updatedItem: any) => {
        // On peut soit rafraîchir toute la liste
        this.refresh();
        // Soit mettre à jour localement si on veut être optimiste (mais refresh est plus sûr)
        const status = updatedItem.isActive ?? updatedItem.is_active;
        this.toastService.success(`Statut modifié avec succès.`);
      },
      error: (err: any) => {
        console.error('Error toggling status:', err);
        this.toastService.error('Une erreur est survenue lors du changement de statut.');
      }
    });
  }
  // Export State
  showExportModal = signal(false);
  isExporting = signal(false);

  openExportModal() {
    this.showExportModal.set(true);
  }

  closeExportModal() {
    this.showExportModal.set(false);
  }

  async confirmExport(format: 'excel' | 'pdf') {
    this.closeExportModal();
    this.isExporting.set(true);

    try {
      // 1. Fetch ALL data (bypass pagination)
      // On utilise une requête unique avec une limite élevée
      const result = await this.apollo.query({
        query: this.query,
        variables: {
          ...this.filterForm.value,
          page: 1,
          pageSize: 1000 // Limite arbitraire pour l'export "tout"
        },
        fetchPolicy: 'network-only'
      }).toPromise();

      const data = (result as any).data[this.responseKey];
      const items = data.items || data;

      if (!items || items.length === 0) {
        this.toastService.warning('Aucune donnée à exporter.');
        this.isExporting.set(false);
        return;
      }

      // 2. Generate File
      if (format === 'excel') {
        this.generateExcel(items);
      } else {
        this.generatePdf(items);
      }

      this.toastService.success(`Export ${format.toUpperCase()} terminé.`);

    } catch (error) {
      console.error('Export error:', error);
      this.toastService.error("Erreur lors de l'export.");
    } finally {
      this.isExporting.set(false);
    }
  }

  private generateExcel(data: any[]) {
    import('xlsx').then(XLSX => {
      // Aplatir les données si nécessaire (ex: roles: [{name: 'Admin'}] -> roles: 'Admin')
      const flatData = data.map(item => this.flattenItemForExport(item));

      const worksheet = XLSX.utils.json_to_sheet(flatData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Export');

      const fileName = `export_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    });
  }

  // Configuration de l'export (à surcharger par les enfants)
  protected getExportConfig(): { title: string, columns?: { header: string, key: string, format?: (val: any) => string }[] } {
    return {
      title: 'Export des données',
      // Par défaut, pas de colonnes spécifiques (tout exporter)
    };
  }

  private generatePdf(data: any[]) {
    Promise.all([
      import('jspdf'),
      import('jspdf-autotable')
    ]).then(([jsPDFModule, autoTableModule]) => {
      // 1. Instanciation robuste de jsPDF
      const JsPDF = (jsPDFModule as any).default || jsPDFModule;
      const doc = new JsPDF();

      // 2. Récupération de autoTable (fonction ou side-effect)
      // Note: jspdf-autotable v3+ s'attache souvent au prototype, mais v5 peut différer
      const autoTable = (autoTableModule as any).default || autoTableModule;

      const config = this.getExportConfig();

      // ... (Préparation des données - inchangé) ...
      let headers: string[] = [];
      let rows: any[][] = [];

      if (config.columns) {
        headers = config.columns.map(c => c.header);
        rows = data.map(item => {
          return config.columns!.map(col => {
            const val = this.getValueByPath(item, col.key);
            return col.format ? col.format(val) : (val ?? '');
          });
        });
      } else {
        const flatData = data.map(item => this.flattenItemForExport(item));
        if (flatData.length === 0) return;
        headers = Object.keys(flatData[0]);
        rows = flatData.map(item => Object.values(item));
      }

      // ... (En-tête - inchangé) ...
      const title = config.title;
      const date = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

      doc.setFontSize(18);
      doc.setTextColor(40);
      doc.text(title, 14, 22);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Généré le ${date}`, 14, 30);

      // 3. Génération du tableau (Support double : prototype ou fonction)
      const tableConfig = {
        head: [headers],
        body: rows,
        startY: 35,
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229] },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        styles: { fontSize: 9, cellPadding: 3 },
        didDrawPage: (data: any) => {
          const str = 'Page ' + doc.getNumberOfPages();
          doc.setFontSize(10);
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
          doc.text(str, data.settings.margin.left, pageHeight - 10);
        }
      };

      if (typeof (doc as any).autoTable === 'function') {
        (doc as any).autoTable(tableConfig);
      } else if (typeof autoTable === 'function') {
        autoTable(doc, tableConfig);
      } else {
        console.error('AutoTable not found', { docAutoTable: (doc as any).autoTable, autoTable });
        throw new Error('Impossible de charger le plugin AutoTable.');
      }

      doc.save(`export_${new Date().toISOString().slice(0, 10)}.pdf`);
    }).catch(err => {
      console.error('Error generating PDF:', err);
      this.toastService.error('Erreur lors de la génération du PDF.');
    });
  }

  // Helper pour récupérer une valeur imbriquée (ex: 'roles[0].name')
  private getValueByPath(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  }

  // Helper pour nettoyer les objets avant export (à surcharger si besoin)
  protected flattenItemForExport(item: any): any {
    const flat: any = {};
    for (const key in item) {
      if (item.hasOwnProperty(key) && key !== '__typename') {
        const val = item[key];
        if (Array.isArray(val)) {
          // Ex: roles: [{name: 'Admin'}, {name: 'User'}] -> "Admin, User"
          flat[key] = val.map(v => v.name || v).join(', ');
        } else if (typeof val === 'object' && val !== null) {
          // Ex: profile: { bio: '...' } -> "..." (simplification)
          flat[key] = val.name || JSON.stringify(val);
        } else {
          flat[key] = val;
        }
      }
    }
    return flat;
  }
}