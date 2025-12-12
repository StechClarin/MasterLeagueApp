import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { BaseListComponent } from '@core/abstracts/base-list.component';
import { VoitureService } from '../../services/voiture.service';
import { UiListPageComponent } from '@shared/components/ui-list-page/ui-list-page.component';
import { UiToolbarComponent } from '@shared/components/ui-toolbar/ui-toolbar.component';
import { UiTableComponent } from '@shared/components/ui-table/ui-table.component';
import { UiPaginationComponent } from '@shared/components/ui-pagination/ui-pagination.component';
@Component({
    selector: 'app-voiture-list',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, UiListPageComponent, UiToolbarComponent, UiTableComponent, UiPaginationComponent],
    templateUrl: './voiture-list.component.html'
})
export class VoitureListComponent extends BaseListComponent<any> {

    // 2. Injection du Service (AVANT la query si on veut utiliser inject() dans la prop)
    // Mais BaseListComponent initQuery est appelé dans ngOnInit, donc c'est bon.
    service = inject(VoitureService);

    // 1. Definition de la Query via le service
    query = this.service.getQuery();
    responseKey = 'voitures';

    tableColumns = [
        { key: 'id', header: '#' },
        { key: 'name', header: 'Nom' },
        { key: 'matricule', header: 'Matricule' },
        { key: 'couleur', header: 'Couleur' },
        { key: 'createdAt', header: 'Créé le', type: 'date' },
    ];

    get searchControl() {
        return this.filterForm.get('search') as any;
    }

    override initFilterForm(): FormGroup {
        return this.fb.group({
            search: ['']
        });
    }
}
