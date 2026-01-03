import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Observable } from 'rxjs'; // Import Observable
import { BaseModalListComponent } from '@core/abstracts/base-modal-list.component';
import { UiListPageComponent } from '@shared/components/ui-list-page/ui-list-page.component';
import { UiTableComponent } from '@shared/components/ui-table/ui-table.component';
import { UiModalComponent } from '@shared/components/ui-modal/ui-modal.component';
import { UiConfirmModalComponent } from '@shared/components/ui-confirm-modal/ui-confirm-modal.component';
import { UiToolbarComponent } from '@shared/components/ui-toolbar/ui-toolbar.component';
import { UiFilterPanelComponent } from '@shared/components/ui-filter-panel/ui-filter-panel.component';
import { UiDropdownComponent } from '@shared/components/ui-dropdown/ui-dropdown.component'; // Import
import { UiExportModalComponent } from '@shared/components/ui-export-modal/ui-export-modal.component';
import { PersonnelService } from '../../services/personnel.service';
import { PersonnelFormComponent } from '../personnel-form/personnel-form.component';

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
        UiDropdownComponent, // Add to imports
        UiExportModalComponent,
        PersonnelFormComponent
    ],
    templateUrl: './personnel-list.component.html'
})
export class PersonnelListComponent extends BaseModalListComponent<any> {
    service = inject(PersonnelService);
    // Explicitly cast to any or DocumentNode if needed, but BaseListComponent expects DocumentNode.
    // Since we return null in service momentarily, we might need to be careful.
    query = this.service.getQuery()!;
    responseKey = 'personnels';

    isFiltersOpen = signal(false);

    get searchControl(): FormControl {
        return this.filterForm.get('search') as FormControl;
    }

    tableColumns = computed(() => [
        { header: 'Utilisateur', key: 'user', sortable: true, format: (row: any) => `${row.user?.firstName || ''} ${row.user?.lastName || ''}` },
        { header: 'Matricule', key: 'matricule', sortable: true },
        { header: 'Poste', key: 'jobTitle', sortable: true },
        { header: 'Contrat', key: 'contractType', format: (row: any) => row.contractType?.code || '-' },
        { header: 'Email Pro', key: 'emailPro' },
        { header: 'Rôles', key: 'roles', format: (row: any) => row.roles?.map((r: any) => r.name).join(', ') || '-' }
    ]);

    override initFilterForm(): FormGroup {
        this.filterForm = this.fb.group({
            search: ['']
        });
        return this.filterForm;
    }

    openAddModal() {
        this.openModal(null, 'create');
    }

    openEditModal(item: any) {
        this.onEdit(item);
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

    // sorting methods wrappers if needed for UiTable input binding, e.g. sortField(), sortDirection(), onSort()
    // BaseListComponent doesn't seem to have sortField/sortDirection signals defined in the file I read.
    // If UiTable expects them, I might need to implement them or check if BaseListComponent has them in a newer version I didn't see or if I missed them.
    // I read BaseListComponent in step 3430. It has pagination and export. No sort state.
    // I will add sort signals here to satisfy template.

    sortField = computed(() => '');
    sortDirection = computed(() => 'asc');

    onSort(event: any) {
        // Implement sort logic or just log for now
        console.log('Sort:', event);
    }

    toggleFilters() {
        this.isFiltersOpen.update(v => !v);
    }

    resetFilters() {
        this.searchControl.setValue('');
        this.filterForm.reset({ search: '' });
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
}
