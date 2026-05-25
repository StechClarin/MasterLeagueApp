import { Component, computed, inject, signal, ViewChild, TemplateRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Observable } from 'rxjs'; // Import Observable
import { BaseModalListComponent } from '@core/abstracts/base-modal-list.component';
import { UiListPageComponent } from '@shared/components/ui-list-page/ui-list-page.component';
import { UiTableComponent, UiTableColumn } from '@shared/components/ui-table/ui-table.component';
import { UiModalComponent } from '@shared/components/ui-modal/ui-modal.component';
import { UiConfirmModalComponent } from '@shared/components/ui-confirm-modal/ui-confirm-modal.component';
import { UiToolbarComponent } from '@shared/components/ui-toolbar/ui-toolbar.component';
import { UiFilterPanelComponent } from '@shared/components/ui-filter-panel/ui-filter-panel.component';
import { ContractTypeService } from '../../services/contract-type.service';
import { RoleService } from '@features/profilmanagement/services/role.service';
import { map } from 'rxjs/operators';
import { UiDropdownComponent } from '@shared/components/ui-dropdown/ui-dropdown.component';
import { UiExportModalComponent } from '@shared/components/ui-export-modal/ui-export-modal.component';
import { PersonnelService } from '../../services/personnel.service';
import { PersonnelFormComponent } from '../personnel-form/personnel-form.component';
import { PersonnelDetailComponent } from '../personnel-detail/personnel-detail.component';
import { UiAvatarComponent } from '@shared/components/ui-avatar/ui-avatar.component';
import { UiPaginationComponent } from '@shared/components/ui-pagination/ui-pagination.component';

@Component({
    selector: 'app-personnel-list',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        UiListPageComponent,
        UiTableComponent,
        UiModalComponent,
        UiConfirmModalComponent,
        UiToolbarComponent,
        UiFilterPanelComponent,
        UiDropdownComponent,
        UiExportModalComponent,
        PersonnelFormComponent,
        PersonnelDetailComponent,
        PersonnelDetailComponent,
        UiAvatarComponent,
        UiPaginationComponent
    ],
    templateUrl: './personnel-list.component.html'
})
export class PersonnelListComponent extends BaseModalListComponent<any> implements AfterViewInit {
    service = inject(PersonnelService);
    private contractTypeService = inject(ContractTypeService);
    private roleService = inject(RoleService);
    private cdr = inject(ChangeDetectorRef);

    @ViewChild('userCell') userCell!: TemplateRef<any>;

    query = this.service.getQuery()!;
    responseKey = 'personnels';

    contractTypes$ = this.contractTypeService.list().pipe(map((res: any) => res.data.contractTypes.items));
    roles$ = this.roleService.getAll().pipe(map((res: any) => res.data.roles.items));

    isFiltersOpen = signal(false);

    get searchControl(): FormControl {
        return this.filterForm.get('search') as FormControl;
    }

    tableColumns: UiTableColumn[] = [];

    ngAfterViewInit() {
        setTimeout(() => {
            this.tableColumns = [
                { header: 'Utilisateur', template: this.userCell, key: 'user', sortable: true },
                { header: 'Matricule', key: 'matricule', sortable: true },
                { header: 'Genre', key: 'gender', sortable: true },
                { header: 'Poste', key: 'jobTitle', sortable: true },
                { header: 'Contrat', key: 'contractType', format: (row: any) => row.contractType?.code || '-' },
                { header: 'Email Pro', key: 'emailPro' },
                { header: 'Rôles', key: 'roles', format: (row: any) => row.roles?.map((r: any) => r.name).join(', ') || '-' }
            ];
            this.cdr.detectChanges();
        });
    }

    override initFilterForm(): FormGroup {
        this.filterForm = this.fb.group({
            search: [''],
            contractType: [null],
            role: [null],
            jobTitle: ['']
        });
        return this.filterForm;
    }

    override getFilterVariables(): any {
        return {
            ...this.filterForm.value,
            establishment: this.structureState.currentEstablishmentId()
        };
    }

    openAddModal() {
        this.openModal(null, 'create');
    }

    openEditModal(item: any) {
        this.onEdit(item);
    }

    openViewModal(item: any) {
        this.openModal(item, 'view' as any);
    }

    openDeleteModal(item: any) {
        this.onDelete(item);
    }

    hasData(): boolean {
        return this.totalCount() > 0;
    }

    onSaveSuccess() {
        this.onSave();
    }

    sortField = computed(() => '');
    sortDirection = computed(() => 'asc');

    onSort(event: any) {
        console.log('Sort:', event);
    }

    toggleFilters() {
        this.isFiltersOpen.update(v => !v);
    }

    resetFilters() {
        this.filterForm.reset();
    }

    dispatchFilters() {
        this.refresh();
    }

    /**
     * Méthode générique pour gérer les opérations de fichiers (import/export)
     * Respecte le principe DRY en évitant la duplication de code
     */
    private handleFileOperation(
        operation: 'import' | 'export',
        serviceMethod: () => Observable<any>,
        successMessage: string
    ) {
        this.isLoading.set(true);

        serviceMethod().subscribe({
            next: (response) => {
                if (operation === 'export') {
                    // Pour l'export, on télécharge le fichier
                    this.downloadFile(response);
                } else {
                    // Pour l'import, on rafraîchit la liste
                    this.refresh();
                }
                this.toastService.success(successMessage);
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error(`Erreur lors de l'${operation}`, err);
                this.toastService.error(`Une erreur est survenue lors de l'${operation}.`);
                this.isLoading.set(false);
            }
        });
    }

    /**
     * Gère l'import de personnel depuis un fichier CSV/Excel
     */
    onImport() {
        // Créer un input file invisible
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv,.xlsx,.xls';

        input.onchange = (event: any) => {
            const file = event.target.files[0];
            if (!file) return;

            this.handleFileOperation(
                'import',
                () => this.service.import(file),
                `${file.name} importé avec succès.`
            );
        };

        input.click();
    }

    /**
     * Télécharge le modèle d'import
     */
    onDownloadTemplate() {
        this.handleFileOperation(
            'export',
            () => this.service.downloadTemplate(),
            'Modèle téléchargé avec succès.'
        );
    }

    /**
     * Télécharge un fichier blob
     */
    private downloadFile(blob: Blob) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `personnel_export_${new Date().toISOString().split('T')[0]}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
    }

    onExport() {
        this.openExportModal();
    }

    override getExportConfig(): { title: string; columns: { header: string; key: string; }[] } {
        return {
            title: 'Liste du Personnel',
            columns: [
                { key: 'matricule', header: 'Matricule' },
                { key: 'user.firstName', header: 'Prénom' },
                { key: 'user.lastName', header: 'Nom' },
                { key: 'jobTitle', header: 'Poste' },
                { key: 'emailPro', header: 'Email Pro' }
            ]
        };
    }

    /**
     * Bascule le statut actif/inactif d'un membre du personnel.
     * Déclenche automatiquement la mise à jour des accès (Membership).
     */
    override toggleStatus(item: any) {
        const action = item.isActive ? 'désactivation' : 'activation';
        this.isLoading.set(true);

        this.service.status(item.id).subscribe({
            next: (response) => {
                this.toastService.success(`La ${action} du personnel a été effectuée avec succès.`);
                this.refresh();
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error(`Erreur lors de la ${action}`, err);
                this.toastService.error(`Impossible de changer le statut.`);
                this.isLoading.set(false);
            }
        });
    }
}
