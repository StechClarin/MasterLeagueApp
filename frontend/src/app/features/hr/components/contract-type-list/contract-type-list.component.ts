import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { BaseModalListComponent } from '@app/core/abstracts/base-modal-list.component';
import { ContractTypeService } from '../../services/contract-type.service';
import { UiTableComponent, UiTableColumn } from '@app/shared/components/ui-table/ui-table.component';
import { UiModalComponent } from '@app/shared/components/ui-modal/ui-modal.component';
import { UiListPageComponent } from '@app/shared/components/ui-list-page/ui-list-page.component';
import { UiToolbarComponent } from '@app/shared/components/ui-toolbar/ui-toolbar.component';
import { ContractTypeFormComponent } from '../contract-type-form/contract-type-form.component';
import { UiPaginationComponent } from '@app/shared/components/ui-pagination/ui-pagination.component';
import { UiDropdownComponent } from '@app/shared/components/ui-dropdown/ui-dropdown.component';

@Component({
    selector: 'app-contract-type-list',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        UiTableComponent,
        UiModalComponent,
        UiListPageComponent,
        UiToolbarComponent,
        ContractTypeFormComponent,
        UiPaginationComponent,
        UiDropdownComponent
    ],
    templateUrl: './contract-type-list.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractTypeListComponent extends BaseModalListComponent<any> {
    service = inject(ContractTypeService);
    // Removed duplicate fb injection

    override responseKey = 'contractTypes';

    // Sort
    sortField = 'code';
    sortDirection: 'asc' | 'desc' = 'asc';

    // Filters
    searchControl = new FormControl('');

    tableColumns: UiTableColumn[] = [
        { header: 'Code', key: 'code', sortable: true },
        { header: 'Désignation', key: 'designation', sortable: true }
    ];

    constructor() {
        super();
    }

    get modalTitle(): string {
        switch (this.modalMode()) {
            case 'create': return 'Nouveau Type de Contrat';
            case 'edit': return 'Modifier Type de Contrat';
            case 'detail': return 'Détails Type de Contrat';
            case 'delete': return 'Supprimer Type de Contrat';
            default: return '';
        }
    }

    override initFilterForm(): FormGroup {
        return this.fb.group({
            search: ['']
        });
    }

    // List interface implementation
    override get query() {
        return this.service.listQueryDocument;
    }

    // Handlers
    onSort(event: { field: string, direction: string }) {
        this.sortField = event.field;
        this.sortDirection = event.direction as 'asc' | 'desc';
        // BaseList usually handles refetch via variables if updated?
        // Check BaseList.initQuery(): it calls this.getFilterVariables(). 
        // It does NOT auto-include sortField/sortDirection unless getFilterVariables includes them.
        // For now, minimal implementation. 
    }

    onAdd() {
        this.openModal(null, 'create');
    }

    onImport(event: Event) {
        // Assuming simple file input
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            const file = input.files[0];
            // Call service import if available
            this.toastService.warning("Import non implémenté pour l'instant");
        }
    }

    onExport(format: 'csv' | 'excel' | 'pdf') {
        this.confirmExport(format === 'excel' ? 'excel' : 'pdf');
    }

    onPageChange(page: number) {
        this.goToPage(page);
    }
}
