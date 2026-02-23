import { Component, inject, ViewChild, TemplateRef, AfterViewInit, ChangeDetectorRef, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { BaseModalListComponent } from '@core/abstracts/base-modal-list.component';
import { EstablishmentService } from '../../services/establishment.service';
import { EstablishmentType } from '@app/graphql/types';
import { EstablishmentFormComponent } from '../establishment-form/establishment-form.component';

import { UiModalComponent } from '@shared/components/ui-modal/ui-modal.component';
import { UiPaginationComponent } from '@shared/components/ui-pagination/ui-pagination.component';
import { UiListPageComponent } from '@shared/components/ui-list-page/ui-list-page.component';
import { UiToolbarComponent } from '@shared/components/ui-toolbar/ui-toolbar.component';
import { UiConfirmModalComponent } from '@shared/components/ui-confirm-modal/ui-confirm-modal.component';
import { UiTableComponent, UiTableColumn } from '@shared/components/ui-table/ui-table.component';

import { UiFilterPanelComponent } from '@shared/components/ui-filter-panel/ui-filter-panel.component';
import { UiDropdownComponent } from '@shared/components/ui-dropdown/ui-dropdown.component';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-establishment-list',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        EstablishmentFormComponent,
        UiModalComponent,
        UiPaginationComponent,
        UiListPageComponent,
        UiToolbarComponent,
        UiConfirmModalComponent,
        UiTableComponent,
        UiFilterPanelComponent,
        UiDropdownComponent
    ],
    templateUrl: './establishment-list.component.html'
})
export class EstablishmentListComponent extends BaseModalListComponent<EstablishmentType> implements AfterViewInit, OnDestroy {
    query = inject(EstablishmentService).getQuery();
    responseKey = 'establishments';
    public service = inject(EstablishmentService);

    searchControl = new FormControl('');
    isFiltersOpen = signal(false);
    private cdr = inject(ChangeDetectorRef);
    private destroy$ = new Subject<void>();

    @ViewChild('nameCell') nameCell!: TemplateRef<any>;
    @ViewChild('statusCell') statusCell!: TemplateRef<any>;

    tableColumns: UiTableColumn[] = [];

    ngAfterViewInit() {
        setTimeout(() => {
            this.tableColumns = [
                { header: 'Nom', template: this.nameCell },
                { header: 'Ville', key: 'city' },
                { header: 'Email', key: 'email' },
                { header: 'Téléphone', key: 'phone' },
                { header: 'Statut', template: this.statusCell },
            ];
            this.cdr.detectChanges();
        });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    override ngOnInit(): void {
        this.filterForm = this.initFilterForm();
        super.ngOnInit();

        // Sync Search -> Refresh
        this.searchControl.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            takeUntil(this.destroy$)
        ).subscribe(() => {
            this.currentPage.set(1);
            this.refresh();
        });

        // Sync Filters -> Refresh
        this.filterForm.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            takeUntil(this.destroy$)
        ).subscribe(() => {
            this.currentPage.set(1);
            this.refresh();
        });
    }


    protected override getFilterVariables(): any {
        const values = { ...this.filterForm.value };

        // 1. Global Search (OR condition on multiple fields)
        // 1. Global Search (OR condition on multiple fields)
        // Explicitly set search to empty string if null/empty to reset the filter
        values.search = this.searchControl.value || '';

        // 2. Map checkboxes to isActive boolean
        if (values.status_active && !values.status_inactive) {
            values.isActive = true;
        } else if (!values.status_active && values.status_inactive) {
            values.isActive = false;
        }

        // 3. Cleanup temporary UI fields
        delete values.status_active;
        delete values.status_inactive;

        return values;
    }

    initFilterForm() {
        return this.fb.group({
            city: [''],
            address: [''],
            phone: [''],
            status_active: [false],
            status_inactive: [false]
        });
    }



    dispatchFilters() {
        this.refresh();
    }

    toggleFilters() {
        this.isFiltersOpen.update(v => !v);
    }

    resetFilters() {
        this.searchControl.setValue('');
        this.filterForm.reset();
    }

    // Import/Export removed as per requirements (Not needed for Establishment structure)
}
