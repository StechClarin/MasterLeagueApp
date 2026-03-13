import { Component, OnInit, inject, ViewChild, TemplateRef, AfterViewInit, ChangeDetectorRef, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { BaseModalListComponent } from '@core/abstracts/base-modal-list.component';
import { EnrollmentService } from '../../services/enrollment.service';
import { ClassRoomService } from '@features/structure/services/classroom.service';
import { AcademicYearService } from '@features/structure/services/academic_year.service';

import { UiModalComponent } from '@shared/components/ui-modal/ui-modal.component';
import { UiPaginationComponent } from '@shared/components/ui-pagination/ui-pagination.component';
import { UiAvatarComponent } from '@shared/components/ui-avatar/ui-avatar.component';
import { UiListPageComponent } from '@shared/components/ui-list-page/ui-list-page.component';
import { UiToolbarComponent } from '@shared/components/ui-toolbar/ui-toolbar.component';
import { UiTableComponent, UiTableColumn } from '@shared/components/ui-table/ui-table.component';
import { UiFilterPanelComponent } from '@shared/components/ui-filter-panel/ui-filter-panel.component';

import { UiDropdownComponent } from '@shared/components/ui-dropdown/ui-dropdown.component';
import { UiConfirmModalComponent } from '@shared/components/ui-confirm-modal/ui-confirm-modal.component';

@Component({
    selector: 'app-enrollment-list',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        UiModalComponent,
        UiPaginationComponent,
        UiAvatarComponent,
        UiListPageComponent,
        UiToolbarComponent,
        UiTableComponent,
        UiFilterPanelComponent,
        UiDropdownComponent,
        UiConfirmModalComponent
    ],
    template: `
    <app-ui-list-page title="Gestion des Inscriptions" description="Consultez et gérez les inscriptions des élèves par année et par classe."
      [isLoading]="isLoading()" [isEmpty]="(items$ | async)?.length === 0">

      <!-- Header Actions -->
      <ng-container header-actions>
        <app-ui-toolbar [searchControl]="searchControl" placeholder="Rechercher un élève...">
          <button (click)="toggleFilters()"
            class="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 flex items-center shadow-sm font-medium text-sm">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
            Filtres
          </button>
        </app-ui-toolbar>
      </ng-container>

      <!-- Filters Panel -->
      <ng-container filters>
        <app-ui-filter-panel [isOpen]="isFiltersOpen()" [form]="filterForm" (reset)="resetFilters()">
          <div [formGroup]="filterForm" class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <div class="space-y-1.5">
              <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Classe</label>
              <select formControlName="classroomId" class="block w-full border-gray-200 rounded-xl text-sm focus:ring-indigo-500 focus:border-indigo-500">
                <option [ngValue]="null">Toutes les classes</option>
                <ng-container *ngIf="classrooms$ | async as classrooms">
                    <option *ngFor="let c of classrooms" [value]="c?.id">{{ c?.name }}</option>
                </ng-container>
              </select>
            </div>
            <div class="space-y-1.5">
              <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Année Académique</label>
              <select formControlName="academicYearId" class="block w-full border-gray-200 rounded-xl text-sm focus:ring-indigo-500 focus:border-indigo-500">
                <option [ngValue]="null">Toutes les années</option>
                <ng-container *ngIf="academicYears$ | async as years">
                    <option *ngFor="let y of years" [value]="y?.id">{{ y?.name }}</option>
                </ng-container>
              </select>
            </div>
          </div>
        </app-ui-filter-panel>
      </ng-container>

      <!-- Table Section -->
      <ng-container table>
        <app-ui-table [data]="items$ | async" [columns]="tableColumns" [actionsTemplate]="actionsCell"></app-ui-table>
      </ng-container>

      <!-- Pagination -->
      <ng-container pagination>
        <app-ui-pagination [currentPage]="currentPage()" [pageSize]="pageSize()" [totalCount]="totalCount()"
          [numPages]="numPages()" (prev)="prevPage()" (next)="nextPage()" (goTo)="goToPage($event)"></app-ui-pagination>
      </ng-container>

      <!-- Templates -->
      <ng-template #studentCell let-item>
        <div class="flex items-center">
            <app-ui-avatar [name]="item.student.firstName + ' ' + item.student.lastName" [photoUrl]="item.student.photo" size="sm"></app-ui-avatar>
            <div class="ml-3">
                <div class="text-sm font-semibold text-gray-900">{{ item.student.firstName }} {{ item.student.lastName }}</div>
                <div class="text-xs text-indigo-600 font-medium">{{ item.student.matricule }}</div>
            </div>
        </div>
      </ng-template>

      <ng-template #statusCell let-item>
        <span [class]="getStatusClass(item.status)">
            {{ getStatusLabel(item.status) }}
        </span>
      </ng-template>

      <ng-template #actionsCell let-item>
        <app-ui-dropdown [isOpen]="activeMenuId() === item.id" direction="horizontal"
          (isOpenChange)="$event ? toggleMenu(item.id) : closeMenu()">
  
          <!-- Trigger -->
          <button trigger
            class="bg-indigo-600 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:bg-indigo-700 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/30"
            [ngClass]="{'ring-4 ring-indigo-500/30': activeMenuId() === item.id}">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
  
          <!-- Menu Content -->
          <div menu class="flex items-center gap-1">
            <button (click)="onExpel(item)" class="p-2 rounded-full text-red-500 hover:bg-red-50" title="Renvoyer">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6"></path></svg>
            </button>
            <button (click)="onTransfer(item)" class="p-2 rounded-full text-orange-500 hover:bg-orange-50" title="Transférer">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
            </button>
            <div class="w-px h-6 bg-gray-200 mx-1"></div>
            <button (click)="onDelete(item)" class="p-2 rounded-full text-gray-400 hover:bg-gray-50 hover:text-red-600" title="Supprimer">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </div>
        </app-ui-dropdown>
      </ng-template>

    </app-ui-list-page>

    <app-ui-modal [isOpen]="isModalOpen()" (close)="closeModal()">
        <app-ui-confirm-modal *ngIf="isMode('delete')"
            title="Supprimer l'inscription"
            message="Êtes-vous sûr de vouloir supprimer cette inscription ? Cette action est irréversible."
            (confirm)="confirmDelete()"
            (cancel)="closeModal()"></app-ui-confirm-modal>

        <app-ui-confirm-modal *ngIf="isMode('expel')"
            title="Renvoyer l'élève"
            message="Confirmez-vous le renvoi de cet élève ? Son statut passera à 'Renvoyé'."
            (confirm)="confirmExpel()"
            (cancel)="closeModal()"></app-ui-confirm-modal>

        <app-ui-confirm-modal *ngIf="isMode('transfer')"
            title="Transférer l'élève"
            message="Confirmez-vous le départ de cet élève ? Son statut passera à 'Parti'."
            (confirm)="confirmTransfer()"
            (cancel)="closeModal()"></app-ui-confirm-modal>
    </app-ui-modal>
    `
})
export class EnrollmentListComponent extends BaseModalListComponent<any> implements OnInit, AfterViewInit, OnDestroy {
    service = inject(EnrollmentService);
    classroomService = inject(ClassRoomService);
    academicYearService = inject(AcademicYearService);

    query = this.service.getQuery();
    responseKey = 'enrollments';

    // Filters
    searchControl = new FormControl('');
    isFiltersOpen = signal(false);
    classrooms$ = this.classroomService.list();
    academicYears$ = this.academicYearService.list();

    private destroy$ = new Subject<void>();
    private cdr = inject(ChangeDetectorRef);

    @ViewChild('studentCell') studentCell!: TemplateRef<any>;
    @ViewChild('statusCell') statusCell!: TemplateRef<any>;

    tableColumns: UiTableColumn[] = [];

    override initFilterForm(): FormGroup {
        return this.fb.group({
            search: [''],
            classroomId: [null],
            academicYearId: [null]
        });
    }

    override ngOnInit(): void {
        super.ngOnInit();

        // Sync Search
        this.searchControl.valueChanges.pipe(
            takeUntil(this.destroy$)
        ).subscribe(val => {
            this.filterForm.patchValue({ search: val });
        });

        // Auto-refresh on filter change
        this.filterForm.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            takeUntil(this.destroy$)
        ).subscribe(() => {
            this.currentPage.set(1);
            this.refresh();
        });
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.tableColumns = [
                { header: 'Élève', template: this.studentCell },
                { header: 'Classe', format: (item) => item.classroom?.name || '-' },
                { header: 'Passage', format: (item) => item.isRepeater ? '🔵 Redoublant' : '🟢 Passant' },
                { header: 'Année', format: (item) => item.academicYear?.name || '-' },
                { header: 'Date', format: (item) => new Date(item.enrollmentDate).toLocaleDateString('fr-FR') },
                { header: 'Statut', template: this.statusCell }
            ];
            this.cdr.detectChanges();
        });
    }

    onExpel(item: any) {
        this.selectedItem.set(item);
        (this.modalMode as any).set('expel');
        this.openModal();
    }

    onTransfer(item: any) {
        this.selectedItem.set(item);
        (this.modalMode as any).set('transfer');
        this.openModal();
    }

    confirmExpel() {
        if (!this.selectedItem()) return;
        this.service.save({ id: this.selectedItem().id, status: 'EXPELLED' }).subscribe({
            next: () => {
                this.toastService.success('Élève renvoyé avec succès');
                this.closeModal();
                this.refresh();
            },
            error: () => this.toastService.error('Erreur lors de l\'opération')
        });
    }

    confirmTransfer() {
        if (!this.selectedItem()) return;
        this.service.save({ id: this.selectedItem().id, status: 'LEFT' }).subscribe({
            next: () => {
                this.toastService.success('Départ enregistré avec succès');
                this.closeModal();
                this.refresh();
            },
            error: () => this.toastService.error('Erreur lors de l\'opération')
        });
    }

    override confirmDelete() {
        if (!this.selectedItem()) return;
        this.service.delete(this.selectedItem().id).subscribe({
            next: () => {
                this.toastService.success('Inscription supprimée');
                this.closeModal();
                this.refresh();
            },
            error: () => this.toastService.error('Erreur lors de la suppression')
        });
    }

    toggleFilters() {
        this.isFiltersOpen.set(!this.isFiltersOpen());
    }

    resetFilters() {
        this.filterForm.reset({
            search: '',
            classroomId: null,
            academicYearId: null
        });
        this.searchControl.setValue('', { emitEvent: false });
    }

    getStatusLabel(status: string): string {
        const labels: any = {
            'REGISTERED': 'Inscrit',
            'LEFT': 'Parti',
            'EXPELLED': 'Renvoyé'
        };
        return labels[status] || status;
    }

    isMode(mode: string): boolean {
        return (this.modalMode() as any) === mode;
    }

    getStatusClass(status: string): string {
        const base = 'px-2.5 py-1 rounded-full text-xs font-bold border ';
        const classes: any = {
            'REGISTERED': base + 'bg-green-50 text-green-700 border-green-100',
            'LEFT': base + 'bg-gray-50 text-gray-700 border-gray-100',
            'EXPELLED': base + 'bg-red-50 text-red-700 border-red-100'
        };
        return classes[status] || base + 'bg-gray-50 text-gray-400 border-gray-100';
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
