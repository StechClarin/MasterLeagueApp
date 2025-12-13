import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { BaseModalListComponent } from '@core/abstracts/base-modal-list.component';
import { EvenementService } from '../../services/evenement.service';
import { UiListPageComponent } from '@shared/components/ui-list-page/ui-list-page.component';
import { UiToolbarComponent } from '@shared/components/ui-toolbar/ui-toolbar.component';
import { UiTableComponent } from '@shared/components/ui-table/ui-table.component';
import { UiPaginationComponent } from '@shared/components/ui-pagination/ui-pagination.component';
import { UiModalComponent } from '@shared/components/ui-modal/ui-modal.component';
import { UiConfirmModalComponent } from '@shared/components/ui-confirm-modal/ui-confirm-modal.component';
import { UiDropdownComponent } from '@shared/components/ui-dropdown/ui-dropdown.component';
import { EvenementFormComponent } from '../evenement-form/evenement-form.component';

@Component({
    selector: 'app-evenement-list',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, UiListPageComponent, UiToolbarComponent, UiTableComponent, UiPaginationComponent, UiModalComponent, UiConfirmModalComponent, UiDropdownComponent, EvenementFormComponent],
    templateUrl: './evenement-list.component.html'
})
export class EvenementListComponent extends BaseModalListComponent<any> {

    service = inject(EvenementService);
    query = this.service.getQuery();
    responseKey = 'evenements';

    tableColumns = [
        { key: 'id', header: '#' },
        { key: 'nom', header: 'Nom' },
        { key: 'lieu', header: 'Lieu' },
        { key: 'dateDebut', header: 'Date Début', type: 'date' },
        { key: 'dateFin', header: 'Date Fin', type: 'date' },
    ];

    get searchControl() {
        return this.filterForm.get('search') as any; // Cast to any or FormControl to avoid strict checks if needed
    }

    override initFilterForm(): FormGroup {
        return this.fb.group({
            search: ['']
        });
    }
}
