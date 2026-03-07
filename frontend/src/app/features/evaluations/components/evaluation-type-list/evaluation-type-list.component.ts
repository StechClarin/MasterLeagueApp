import { Component, inject, ViewChild, TemplateRef, AfterViewInit, ChangeDetectorRef, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { BaseModalListComponent } from '@core/abstracts/base-modal-list.component';
import { EvaluationTypeService } from '../../services/evaluation_type.service';
import { EvaluationTypeType } from '@app/graphql/types';
import { EvaluationTypeFormComponent } from '../evaluation-type-form/evaluation-type-form.component';

// Shared UI Imports
import { UiModalComponent } from '@shared/components/ui-modal/ui-modal.component';
import { UiPaginationComponent } from '@shared/components/ui-pagination/ui-pagination.component';
import { UiListPageComponent } from '@shared/components/ui-list-page/ui-list-page.component';
import { UiToolbarComponent } from '@shared/components/ui-toolbar/ui-toolbar.component';
import { UiConfirmModalComponent } from '@shared/components/ui-confirm-modal/ui-confirm-modal.component';
import { UiTableComponent, UiTableColumn } from '@shared/components/ui-table/ui-table.component';
import { UiFilterPanelComponent } from '@shared/components/ui-filter-panel/ui-filter-panel.component';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-evaluation-type-list',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        EvaluationTypeFormComponent,
        UiModalComponent,
        UiPaginationComponent,
        UiListPageComponent,
        UiToolbarComponent,
        UiConfirmModalComponent,
        UiTableComponent,
        UiFilterPanelComponent
    ],
    templateUrl: './evaluation-type-list.component.html'
})
export class EvaluationTypeListComponent extends BaseModalListComponent<EvaluationTypeType> implements AfterViewInit, OnDestroy {
    public service = inject(EvaluationTypeService);
    query = this.service.getQuery();
    responseKey = 'evaluationTypes';

    searchControl = new FormControl('');
    isFiltersOpen = signal(false);
    private cdr = inject(ChangeDetectorRef);
    private destroy$ = new Subject<void>();

    tableColumns: UiTableColumn[] = [];

    ngAfterViewInit() {
        setTimeout(() => {
            this.tableColumns = [
                { header: 'Nom', key: 'name', className: 'font-medium text-gray-900' },
                { header: 'Description', key: 'description' },
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
    }

    override initFilterForm(): FormGroup {
        return this.fb.group({
            search: ['']
        });
    }

    protected override getFilterVariables(): any {
        return {
            search: this.searchControl.value || ''
        };
    }

    toggleFilters() {
        this.isFiltersOpen.update(v => !v);
    }

    resetFilters() {
        this.searchControl.setValue('');
    }
}
