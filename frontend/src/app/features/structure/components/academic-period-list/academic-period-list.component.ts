import { Component, inject, ViewChild, TemplateRef, AfterViewInit, ChangeDetectorRef, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { BaseModalListComponent } from '@core/abstracts/base-modal-list.component';
import { AcademicPeriodService } from '../../services/academic_period.service';
import { AcademicYearService } from '../../services/academic_year.service';
import { AcademicPeriodType } from '@app/graphql/types';
import { AcademicPeriodFormComponent } from '../academic-period-form/academic-period-form.component';
import { map, tap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { LoggingService } from '@core/services/logging.service';

// Shared UI Imports
import { UiModalComponent } from '@shared/components/ui-modal/ui-modal.component';
import { UiPaginationComponent } from '@shared/components/ui-pagination/ui-pagination.component';
import { UiListPageComponent } from '@shared/components/ui-list-page/ui-list-page.component';
import { UiToolbarComponent } from '@shared/components/ui-toolbar/ui-toolbar.component';
import { UiConfirmModalComponent } from '@shared/components/ui-confirm-modal/ui-confirm-modal.component';
import { UiTableComponent, UiTableColumn } from '@shared/components/ui-table/ui-table.component';
import { UiFilterPanelComponent } from '@shared/components/ui-filter-panel/ui-filter-panel.component';
import { UiSelectComponent } from '@shared/components/ui-select/ui-select.component';
import { UiDropdownComponent } from '@shared/components/ui-dropdown/ui-dropdown.component';
import { UiStatusBadgeComponent } from '@shared/components/ui-status-badge/ui-status-badge.component';

@Component({
    selector: 'app-academic-period-list',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        AcademicPeriodFormComponent,
        UiModalComponent,
        UiPaginationComponent,
        UiListPageComponent,
        UiToolbarComponent,
        UiConfirmModalComponent,
        UiTableComponent,
        UiFilterPanelComponent,
        UiSelectComponent,
        UiDropdownComponent,
        UiStatusBadgeComponent
    ],
    templateUrl: './academic-period-list.component.html'
})
export class AcademicPeriodListComponent extends BaseModalListComponent<AcademicPeriodType> implements AfterViewInit, OnDestroy {
    public service = inject(AcademicPeriodService);
    private academicYearService = inject(AcademicYearService);
    query = this.service.getQuery();
    responseKey = 'academicPeriods';

    searchControl = new FormControl('');
    isFiltersOpen = signal(false);
    private cdr = inject(ChangeDetectorRef);
    private destroy$ = new Subject<void>();

    academicYears$ = this.academicYearService.list();

    @ViewChild('nameCell', { static: true }) nameCell!: TemplateRef<any>;
    @ViewChild('yearCell', { static: true }) yearCell!: TemplateRef<any>;
    @ViewChild('dateCell', { static: true }) dateCell!: TemplateRef<any>;
    @ViewChild('statusCell', { static: true }) statusCell!: TemplateRef<any>;
    @ViewChild('actionsCell', { static: true }) actionsCell!: TemplateRef<any>;

    tableColumns: UiTableColumn[] = [];

    ngAfterViewInit() {
        setTimeout(() => {
            this.tableColumns = [
                { header: 'Nom', template: this.nameCell },
                { header: 'Année Scolaire', template: this.yearCell },
                { header: 'Dates', template: this.dateCell },
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

    initFilterForm() {
        return this.fb.group({
            academic_year: [''],
            isActive: [null]
        });
    }

    protected override getFilterVariables(): any {
        const values = { ...this.filterForm.value };
        values.search = this.searchControl.value || '';
        if (values.academic_year) {
            values.academicYearId = values.academic_year;
        }
        delete values.academic_year;
        return values;
    }

    toggleFilters() {
        this.isFiltersOpen.update(v => !v);
    }

    resetFilters() {
        this.searchControl.setValue('');
        this.filterForm.reset();
    }
}
