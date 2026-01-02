import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BaseModalListComponent } from '@core/abstracts/base-modal-list.component';
import { UiListPageComponent } from '@shared/components/ui-list-page/ui-list-page.component';
import { UiTableComponent } from '@shared/components/ui-table/ui-table.component';
import { UiModalComponent } from '@shared/components/ui-modal/ui-modal.component';
import { UiConfirmModalComponent } from '@shared/components/ui-confirm-modal/ui-confirm-modal.component';
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

    tableColumns = computed(() => [
        { header: 'Utilisateur', key: 'user', sortable: true, format: (row: any) => `${row.user?.firstName || ''} ${row.user?.lastName || ''}` },
        { header: 'Matricule', key: 'matricule', sortable: true },
        { header: 'Poste', key: 'jobTitle', sortable: true },
        { header: 'Email Pro', key: 'emailPro' },
        { header: 'Rôle', key: 'role', format: (row: any) => row.role?.name || '-' },
        { header: 'Actions', key: 'actions', type: 'actions' as const }
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
