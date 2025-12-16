import { Component, inject, ViewChild, TemplateRef, AfterViewInit, ChangeDetectorRef, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { BaseModalListComponent } from '@core/abstracts/base-modal-list.component';
import { LevelService } from '../../services/level.service';
import { LevelType } from '@app/graphql/generated';
import { LevelFormComponent } from '../level-form/level-form.component';

import { UiModalComponent } from '@shared/components/ui-modal/ui-modal.component';
import { UiPaginationComponent } from '@shared/components/ui-pagination/ui-pagination.component';
import { UiListPageComponent } from '@shared/components/ui-list-page/ui-list-page.component';
import { UiToolbarComponent } from '@shared/components/ui-toolbar/ui-toolbar.component';
import { UiConfirmModalComponent } from '@shared/components/ui-confirm-modal/ui-confirm-modal.component';
import { UiTableComponent, UiTableColumn } from '@shared/components/ui-table/ui-table.component';
import { UiFilterPanelComponent } from '@shared/components/ui-filter-panel/ui-filter-panel.component';
import { UiDropdownComponent } from '@shared/components/ui-dropdown/ui-dropdown.component';

@Component({
    selector: 'app-level-list',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        LevelFormComponent,
        UiModalComponent,
        UiPaginationComponent,
        UiListPageComponent,
        UiToolbarComponent,
        UiConfirmModalComponent,
        UiTableComponent,
        UiFilterPanelComponent,
        UiDropdownComponent
    ],
    templateUrl: './level-list.component.html'
})
export class LevelListComponent extends BaseModalListComponent<LevelType> implements AfterViewInit {
    query = inject(LevelService).getQuery();
    responseKey = 'levels';
    public service = inject(LevelService);

    searchControl = new FormControl('');
    isFiltersOpen = signal(false);
    private cdr = inject(ChangeDetectorRef);

    @ViewChild('nameCell') nameCell!: TemplateRef<any>;
    @ViewChild('cycleCell') cycleCell!: TemplateRef<any>;

    @Input() isEmbedded: boolean = false;

    tableColumns: UiTableColumn[] = [];

    ngAfterViewInit() {
        setTimeout(() => {
            this.tableColumns = [
                { header: 'Nom', template: this.nameCell },
                { header: 'Ordre', key: 'order' },
                { header: 'Cycle', template: this.cycleCell },
            ];
            this.cdr.detectChanges();
        });
    }

    override ngOnInit(): void {
        this.filterForm = this.initFilterForm();
        super.ngOnInit();
    }

    initFilterForm() {
        return this.fb.group({});
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

    onImport() { }

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

    private downloadFile(blob: Blob) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `levels_${new Date().toISOString().split('T')[0]}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
    }

    protected override getExportConfig() {
        return {
            title: 'Liste des Niveaux',
            columns: [
                { header: 'Nom', key: 'name' },
                { header: 'Abréviation', key: 'shortName' },
                { header: 'Cycle', key: 'cycle.name' }
            ]
        }
    }
}
