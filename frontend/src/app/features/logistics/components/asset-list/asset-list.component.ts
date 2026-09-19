import { Component, inject, ViewChild, TemplateRef, AfterViewInit, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { BaseModalListComponent } from '@core/abstracts/base-modal-list.component';
import { AssetService } from '../../services/asset.service';
import { AssetFormComponent } from '../asset-form/asset-form.component';
import { RoomService } from '../../../structure/services/room.service';
import { DocumentService } from '../../../documents/services/document.service';
import { ToastService } from '@core/services/toast.service';

// Shared UI Imports
import { UiModalComponent } from '@shared/components/ui-modal/ui-modal.component';
import { UiPaginationComponent } from '@shared/components/ui-pagination/ui-pagination.component';
import { UiListPageComponent } from '@shared/components/ui-list-page/ui-list-page.component';
import { UiToolbarComponent } from '@shared/components/ui-toolbar/ui-toolbar.component';
import { UiConfirmModalComponent } from '@shared/components/ui-confirm-modal/ui-confirm-modal.component';
import { UiTableComponent, UiTableColumn } from '@shared/components/ui-table/ui-table.component';
import { UiDropdownComponent } from '@shared/components/ui-dropdown/ui-dropdown.component';
import { UiSelectComponent } from '@shared/components/ui-select/ui-select.component';
import { UiInputComponent } from '@shared/components/ui-input/ui-input.component';
import { UiButtonComponent } from '@shared/components/ui-button/ui-button.component';

@Component({
  selector: 'app-asset-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AssetFormComponent,
    UiModalComponent,
    UiPaginationComponent,
    UiListPageComponent,
    UiToolbarComponent,
    UiConfirmModalComponent,
    UiTableComponent,
    UiDropdownComponent,
    UiSelectComponent,
    UiInputComponent,
    UiButtonComponent
  ],
  templateUrl: './asset-list.component.html'
})
export class AssetListComponent extends BaseModalListComponent<any> implements AfterViewInit {
  public service = inject(AssetService);
  private roomService = inject(RoomService);
  private documentService = inject(DocumentService);
  private toast = inject(ToastService);
  
  query = this.service.getQuery();
  responseKey = 'assets';

  searchControl = new FormControl('');
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('nameCell') nameCell!: TemplateRef<any>;
  @ViewChild('serialCell') serialCell!: TemplateRef<any>;
  @ViewChild('categoryCell') categoryCell!: TemplateRef<any>;
  @ViewChild('statusCell') statusCell!: TemplateRef<any>;
  @ViewChild('roomCell') roomCell!: TemplateRef<any>;
  @ViewChild('dateCell') dateCell!: TemplateRef<any>;
  @ViewChild('costCell') costCell!: TemplateRef<any>;
  @ViewChild('nextMaintenanceCell') nextMaintenanceCell!: TemplateRef<any>;
  @ViewChild('actionsCell') actionsCell!: TemplateRef<any>;

  tableColumns: UiTableColumn[] = [];

  // Modals signals and data
  isAssignModalOpen = signal(false);
  isIssueModalOpen = signal(false);
  isMaintenanceModalOpen = signal(false);
  isRetireModalOpen = signal(false);
  isUnassignConfirmOpen = signal(false);
  
  selectedAsset = signal<any | null>(null);
  isActionSubmitting = signal(false);

  // Assignment data
  rooms = signal<any[]>([]);
  selectedRoomId = signal<string>('');

  // Issues data
  issueDescription = signal<string>('');

  // Maintenance data
  maintenanceDescription = signal<string>('');
  selectedMaintenanceFile: File | null = null;

  ngAfterViewInit() {
    setTimeout(() => {
      this.tableColumns = [
        { header: 'Nom de l\'équipement', template: this.nameCell },
        { header: 'Numéro de série / Code barre', template: this.serialCell },
        { header: 'Catégorie', template: this.categoryCell },
        { header: 'Statut', template: this.statusCell },
        { header: 'Local d\'affectation', template: this.roomCell },
        { header: 'Coût d\'achat', template: this.costCell },
        { header: 'Prochaine maintenance', template: this.nextMaintenanceCell }
      ];
      this.cdr.detectChanges();
    });
  }

  getDaysRemaining(item: any): number | null {
    if (!item.nextMaintenanceDate) return null;
    const nextDate = new Date(item.nextMaintenanceDate);
    const today = new Date();
    nextDate.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    const diffTime = nextDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.searchControl.valueChanges.subscribe(() => {
      this.currentPage.set(1);
      this.refresh();
    });
  }

  initFilterForm(): FormGroup {
    return this.fb.group({});
  }

  protected override getFilterVariables(): any {
    return {
      ...this.filterForm.value,
      search: this.searchControl.value || ''
    };
  }

  getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      'INFORMATIQUE': 'Matériel Informatique',
      'MOBILIER': 'Mobilier',
      'AUDIOVISUEL': 'Matériel Audiovisuel',
      'SPORT': 'Équipement Sportif',
      'AUTRE': 'Autre'
    };
    return labels[category] || category;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'DISPONIBLE': 'Disponible',
      'AFFECTE': 'Affecté',
      'EN_PANNE': 'En Panne',
      'REPARATION': 'En Réparation',
      'REBUT': 'Mis au Rebut'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'DISPONIBLE': 'bg-green-50 text-green-700 ring-green-600/20',
      'AFFECTE': 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
      'EN_PANNE': 'bg-red-50 text-red-700 ring-red-600/20',
      'REPARATION': 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
      'REBUT': 'bg-gray-50 text-gray-700 ring-gray-600/20'
    };
    return classes[status] || 'bg-gray-50 text-gray-700 ring-gray-600/20';
  }

  getRoomTypeDisplay(type: string): string {
    const types: Record<string, string> = {
      'CLASSROOM': 'Salle de classe',
      'OFFICE': 'Bureau',
      'LABORATORY': 'Labo',
      'LIBRARY': 'Biblio',
      'OTHER': 'Stockage'
    };
    return types[type] || type;
  }

  // --- ACTIONS WORKFLOWS ---

  // 1. Assignment
  openAssignModal(asset: any) {
    this.selectedAsset.set(asset);
    this.selectedRoomId.set('');
    this.isAssignModalOpen.set(true);

    // Load available rooms
    this.roomService.list().subscribe({
      next: (data: any[]) => {
        this.rooms.set(data.map(r => ({
          label: `${r.name} (${this.getRoomTypeDisplay(r.roomType)})`,
          value: r.id
        })));
      },
      error: () => this.toast.error('Erreur lors du chargement des salles.')
    });
  }

  submitAssign() {
    const asset = this.selectedAsset();
    const roomId = this.selectedRoomId();
    if (!roomId || !asset) return;

    this.isActionSubmitting.set(true);
    this.service.assign(asset.id, roomId).subscribe({
      next: () => {
        this.toast.success('Équipement affecté avec succès.');
        this.isActionSubmitting.set(false);
        this.isAssignModalOpen.set(false);
        this.refresh();
      },
      error: (err) => {
        this.toast.error(err.error?.detail || 'Erreur lors de l\'affectation.');
        this.isActionSubmitting.set(false);
      }
    });
  }

  // 2. Unassign
  confirmUnassign(asset: any) {
    this.selectedAsset.set(asset);
    this.isUnassignConfirmOpen.set(true);
  }

  submitUnassign() {
    const asset = this.selectedAsset();
    if (!asset) return;

    this.isActionSubmitting.set(true);
    this.service.unassign(asset.id).subscribe({
      next: () => {
        this.toast.success('Équipement libéré de son affectation.');
        this.isActionSubmitting.set(false);
        this.isUnassignConfirmOpen.set(false);
        this.refresh();
      },
      error: (err) => {
        this.toast.error(err.error?.detail || 'Erreur lors de la libération.');
        this.isActionSubmitting.set(false);
      }
    });
  }

  // 3. Panne / Issue
  openIssueModal(asset: any) {
    this.selectedAsset.set(asset);
    this.issueDescription.set('');
    this.isIssueModalOpen.set(true);
  }

  submitIssue() {
    const asset = this.selectedAsset();
    const desc = this.issueDescription().trim();
    if (!asset || !desc) return;

    this.isActionSubmitting.set(true);
    this.service.reportIssue(asset.id, desc).subscribe({
      next: () => {
        this.toast.success('Panne signalée. L\'équipement est désormais EN PANNE.');
        this.isActionSubmitting.set(false);
        this.isIssueModalOpen.set(false);
        this.refresh();
      },
      error: (err) => {
        this.toast.error(err.error?.detail || 'Erreur lors de la déclaration.');
        this.isActionSubmitting.set(false);
      }
    });
  }

  // 4. Maintenance
  openMaintenanceModal(asset: any) {
    this.selectedAsset.set(asset);
    this.maintenanceDescription.set('');
    this.selectedMaintenanceFile = null;
    this.isMaintenanceModalOpen.set(true);
  }

  onFileSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedMaintenanceFile = event.target.files[0];
    }
  }

  submitMaintenance() {
    const asset = this.selectedAsset();
    const desc = this.maintenanceDescription().trim();
    if (!asset || !desc) return;

    this.isActionSubmitting.set(true);
    this.service.performMaintenance(asset.id, desc).subscribe({
      next: (response: any) => {
        // Si un fichier joint (fiche de rapport) est sélectionné, on le télécharge vers la GED
        if (this.selectedMaintenanceFile) {
          const recordId = response.data?.id || response.id;
          this.documentService.uploadDocument(
            this.selectedMaintenanceFile,
            'logistics',
            'maintenancerecord',
            recordId,
            'RAPPORT'
          ).subscribe({
            next: () => {
              this.toast.success('Maintenance enregistrée avec fiche de rapport. Équipement DISPONIBLE.');
              this.finalizeMaintenanceSubmit();
            },
            error: () => {
              this.toast.warning('Maintenance enregistrée mais échec du téléversement du fichier joint.');
              this.finalizeMaintenanceSubmit();
            }
          });
        } else {
          this.toast.success('Maintenance enregistrée. Équipement de nouveau DISPONIBLE.');
          this.finalizeMaintenanceSubmit();
        }
      },
      error: (err) => {
        this.toast.error(err.error?.detail || 'Erreur lors de l\'enregistrement de la maintenance.');
        this.isActionSubmitting.set(false);
      }
    });
  }

  private finalizeMaintenanceSubmit() {
    this.isActionSubmitting.set(false);
    this.isMaintenanceModalOpen.set(false);
    this.refresh();
  }

  // 5. Rebut / Retire
  openRetireModal(asset: any) {
    this.selectedAsset.set(asset);
    this.isRetireModalOpen.set(true);
  }

  submitRetire() {
    const asset = this.selectedAsset();
    if (!asset) return;

    this.isActionSubmitting.set(true);
    this.service.retire(asset.id).subscribe({
      next: () => {
        this.toast.success('Équipement classé comme rebut.');
        this.isActionSubmitting.set(false);
        this.isRetireModalOpen.set(false);
        this.refresh();
      },
      error: (err) => {
        this.toast.error(err.error?.detail || 'Erreur de mise au rebut.');
        this.isActionSubmitting.set(false);
      }
    });
  }
}
