import { Component, inject, ViewChild, TemplateRef, AfterViewInit, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { BaseModalListComponent } from '@core/abstracts/base-modal-list.component';
import { SubjectService } from '../../services/subject.service';
import { SubjectType } from '@app/graphql/types';
import { SubjectFormComponent } from '../subject-form/subject-form.component';

import { UiModalComponent } from '@shared/components/ui-modal/ui-modal.component';
import { UiPaginationComponent } from '@shared/components/ui-pagination/ui-pagination.component';
import { UiListPageComponent } from '@shared/components/ui-list-page/ui-list-page.component';
import { UiToolbarComponent } from '@shared/components/ui-toolbar/ui-toolbar.component';
import { UiConfirmModalComponent } from '@shared/components/ui-confirm-modal/ui-confirm-modal.component';
import { UiTableComponent, UiTableColumn } from '@shared/components/ui-table/ui-table.component';

import { UiFilterPanelComponent } from '@shared/components/ui-filter-panel/ui-filter-panel.component';
import { UiExportModalComponent } from '@shared/components/ui-export-modal/ui-export-modal.component';
import { UiDropdownComponent } from '@shared/components/ui-dropdown/ui-dropdown.component';

@Component({
    selector: 'app-subject-list',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        SubjectFormComponent,
        UiModalComponent,
        UiPaginationComponent,
        UiListPageComponent,
        UiToolbarComponent,
        UiConfirmModalComponent,
        UiTableComponent,
        UiFilterPanelComponent,
        UiDropdownComponent,
        UiExportModalComponent
    ],
    templateUrl: './subject-list.component.html'
})
export class SubjectListComponent extends BaseModalListComponent<SubjectType> implements AfterViewInit {
    query = inject(SubjectService).getQuery();
    responseKey = 'subjects';
    public service = inject(SubjectService);

    searchControl = new FormControl('');
    isFiltersOpen = signal(false);
    private cdr = inject(ChangeDetectorRef);

    @ViewChild('nameCell') nameCell!: TemplateRef<any>;
    @ViewChild('codeCell') codeCell!: TemplateRef<any>;
    @ViewChild('optionalCell') optionalCell!: TemplateRef<any>;

    tableColumns: UiTableColumn[] = [];

    ngAfterViewInit() {
        setTimeout(() => {
            this.tableColumns = [
                { header: 'Nom', template: this.nameCell },
                { header: 'Code', template: this.codeCell },
                { header: 'Type', template: this.optionalCell },
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

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.isLoading.set(true);
            this.service.import(file).subscribe({
                next: () => {
                    this.toastService.success('Importation réussie.');
                    this.isLoading.set(false);
                    this.refresh();
                },
                error: (err: any) => {
                    this.toastService.error('Erreur lors de l\'importation.');
                    this.isLoading.set(false);
                    console.error(err);
                }
            });
        }
        // Reset l'input
        event.target.value = '';
    }

    onDownloadTemplate() {
        this.isLoading.set(true);
        this.service.downloadTemplate().subscribe({
            next: (blob) => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `template_subjects.xlsx`;
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
        link.download = `subjects_${new Date().toISOString().split('T')[0]}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
    }

    protected override getExportConfig() {
        return {
            title: 'Liste des Matières',
            columns: [
                { header: 'Nom', key: 'name' },
                { header: 'Code', key: 'code' },
                { header: 'Optionnelle', key: 'isOptional' }
            ]
        }
    }
}
