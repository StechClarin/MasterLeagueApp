import { Component, inject, ViewChild, TemplateRef, AfterViewInit, ChangeDetectorRef, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { BaseModalListComponent } from '@core/abstracts/base-modal-list.component';
import { AcademicYearService } from '../../services/academic_year.service';
import { AcademicYearType } from '@app/graphql/generated';
import { AcademicYearFormComponent } from '../academic-year-form/academic-year-form.component';

// Shared UI Imports
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
    selector: 'app-academic-year-list',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        AcademicYearFormComponent,
        UiModalComponent,
        UiPaginationComponent,
        UiListPageComponent,
        UiToolbarComponent,
        UiConfirmModalComponent,
        UiTableComponent,
        UiFilterPanelComponent,
        UiDropdownComponent
    ],
    templateUrl: './academic-year-list.component.html'
})
export class AcademicYearListComponent extends BaseModalListComponent<AcademicYearType> implements AfterViewInit, OnDestroy {
    query = inject(AcademicYearService).getQuery();
    responseKey = 'academicyears';
    public service = inject(AcademicYearService);

    searchControl = new FormControl('');
    isFiltersOpen = signal(false);
    private cdr = inject(ChangeDetectorRef);
    private destroy$ = new Subject<void>();

    @ViewChild('nameCell') nameCell!: TemplateRef<any>;
    @ViewChild('dateCell') dateCell!: TemplateRef<any>;
    @ViewChild('statusCell') statusCell!: TemplateRef<any>;

    tableColumns: UiTableColumn[] = [];

    ngAfterViewInit() {
        setTimeout(() => {
            this.tableColumns = [
                { header: 'Nom', template: this.nameCell },
                { header: 'Période', template: this.dateCell },
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

    // Required abstract implementations
    initFilterForm() {
        return this.fb.group({
            status_active: [false],
            status_inactive: [false]
            // Add other filters if needed
        });
    }

    protected override getFilterVariables(): any {
        const values = { ...this.filterForm.value };

        // 1. Global Search
        values.search = this.searchControl.value || '';

        // 2. Map checkboxes to isActive boolean
        if (values.status_active && !values.status_inactive) {
            values.isActive = true;
        } else if (!values.status_active && values.status_inactive) {
            values.isActive = false;
        }

        // 3. Cleanup
        delete values.status_active;
        delete values.status_inactive;

        return values;
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

    onImport() {
        // Implement import logic
    }

    onExport() {
        this.isLoading.set(true);
        this.service.export().subscribe({
            next: (blob) => {
                this.downloadFile(blob);
                this.isLoading.set(false);
                this.toastService.success('Export réussi');
            },
            error: (err) => {
                console.error('Export error', err);
                this.isLoading.set(false);
                this.toastService.error('Erreur lors de l\'export');
            }
        });
    }

    onDownloadTemplate() {
        this.isLoading.set(true);
        this.service.downloadTemplate().subscribe({
            next: (blob) => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `template_academic_years.xlsx`;
                link.click();
                window.URL.revokeObjectURL(url);
                this.isLoading.set(false);
                this.toastService.success('Modèle téléchargé avec succès');
            },
            error: (err) => {
                console.error('Template download error', err);
                this.isLoading.set(false);
                this.toastService.error('Erreur lors du téléchargement du modèle');
            }
        });
    }

    private downloadFile(blob: Blob) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `academic_years_${new Date().toISOString().split('T')[0]}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
    }

    protected override getExportConfig() {
        return {
            title: 'Liste des Années Scolaires',
            columns: [
                { header: 'Nom', key: 'name' },
                { header: 'Date de début', key: 'start_date', format: (val: string) => new Date(val).toLocaleDateString('fr-FR') },
                { header: 'Date de fin', key: 'end_date', format: (val: string) => new Date(val).toLocaleDateString('fr-FR') },
                { header: 'Statut', key: 'isActive', format: (val: boolean) => val ? 'Active' : 'Inactive' }
            ]
        }
    }
}
