import { Component, OnInit, inject, ViewChild, TemplateRef, AfterViewInit, ChangeDetectorRef, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { BaseModalListComponent } from '@core/abstracts/base-modal-list.component';
import { EnrollmentService } from '../../services/enrollment.service';
import { ClassRoomService } from '@features/structure/services/classroom.service';
import { AcademicYearService } from '@features/structure/services/academic_year.service';
import { StructureStateService } from '@core/services/structure-state.service';
import { EstablishmentService } from '@features/structure/services/establishment.service';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Validators } from '@angular/forms';

import { UiModalComponent } from '@shared/components/ui-modal/ui-modal.component';
import { UiPaginationComponent } from '@shared/components/ui-pagination/ui-pagination.component';
import { UiAvatarComponent } from '@shared/components/ui-avatar/ui-avatar.component';
import { UiListPageComponent } from '@shared/components/ui-list-page/ui-list-page.component';
import { UiToolbarComponent } from '@shared/components/ui-toolbar/ui-toolbar.component';
import { UiTableComponent, UiTableColumn } from '@shared/components/ui-table/ui-table.component';
import { UiFilterPanelComponent } from '@shared/components/ui-filter-panel/ui-filter-panel.component';

import { UiDropdownComponent } from '@shared/components/ui-dropdown/ui-dropdown.component';
import { UiConfirmModalComponent } from '@shared/components/ui-confirm-modal/ui-confirm-modal.component';
import { UiExportModalComponent } from '@shared/components/ui-export-modal/ui-export-modal.component';
import { StudentReportModalComponent } from '../student-report-modal/student-report-modal.component';

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
        UiConfirmModalComponent,
        UiExportModalComponent,
        StudentReportModalComponent
    ],
    template: `
    <app-ui-list-page title="Gestion des Inscriptions" description="Consultez et gérez les inscriptions des élèves par année et par classe."
      [isLoading]="isLoading()" [isEmpty]="(items$ | async)?.length === 0">
 
      <ng-container header-actions>
        <app-ui-toolbar [searchControl]="searchControl" placeholder="Rechercher un élève...">
        </app-ui-toolbar>
      </ng-container>
 
      <!-- Filters Panel -->
      <ng-container filters>
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div class="flex items-center gap-2">
            <button (click)="toggleFilters()"
              class="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 focus:ring-2 focus:ring-gray-200 transition-all shadow-sm flex items-center justify-center font-medium text-sm group">
              <svg class="w-5 h-5 mr-2 text-gray-400 group-hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filtres Avancés
              <svg class="w-4 h-4 ml-2 text-gray-400 transform transition-transform duration-200"
                [class.rotate-180]="isFiltersOpen()" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          <div class="flex items-center gap-3">
              <button (click)="openExportModal()"
                  class="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 focus:ring-2 focus:ring-blue-200 transition-all shadow-sm flex items-center justify-center font-medium text-sm group">
                  <svg class="w-5 h-5 mr-2 text-gray-400 group-hover:text-blue-600" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Exporter
              </button>
          </div>
        </div>

        <app-ui-filter-panel [isOpen]="isFiltersOpen()" [form]="filterForm" (reset)="resetFilters()">
          <div [formGroup]="filterForm" class="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            <div class="space-y-1.5">
              <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Classe</label>
              <div class="relative">
                <select formControlName="classroomId" 
                  class="block w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm appearance-none bg-no-repeat bg-right focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer">
                  <option [ngValue]="null">Toutes les classes</option>
                  <ng-container *ngIf="classrooms$ | async as classrooms">
                      <option *ngFor="let c of classrooms" [value]="c?.id">{{ c?.name }}</option>
                  </ng-container>
                </select>
              </div>
            </div>
            <div class="space-y-1.5">
              <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Année Académique</label>
              <div class="relative">
                <select formControlName="academicYearId" 
                  class="block w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm appearance-none bg-no-repeat bg-right focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer">
                  <option [ngValue]="null">Toutes les années</option>
                  <ng-container *ngIf="academicYears$ | async as years">
                      <option *ngFor="let y of years" [value]="y?.id">{{ y?.name }}</option>
                  </ng-container>
                </select>
              </div>
            </div>
            <div class="space-y-1.5">
              <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Statut</label>
              <div class="relative">
                <select formControlName="status" 
                  class="block w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm appearance-none bg-no-repeat bg-right focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer">
                  <option [ngValue]="null">Tous les statuts</option>
                  <option value="PENDING">En attente</option>
                  <option value="REGISTERED">Inscrit</option>
                  <option value="LEFT">Parti</option>
                  <option value="EXPELLED">Renvoyé</option>
                </select>
              </div>
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
            <button (click)="onDetails(item)" class="p-2 rounded-full text-blue-500 hover:bg-blue-50" title="Détails du rapport">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
            </button>
            <div class="w-px h-6 bg-gray-200 mx-1"></div>
            <button (click)="onPrintCertificate(item)" class="p-2 rounded-full text-indigo-500 hover:bg-indigo-50" title="Imprimer l'attestation">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            </button>
            <button (click)="onSelectPrintType(item)" class="p-2 rounded-full text-blue-500 hover:bg-blue-50" title="Imprimer carte scolaire">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path></svg>
            </button>
            <div class="w-px h-6 bg-gray-200 mx-1"></div>
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

        <div *ngIf="isMode('transfer')" class="p-8">
            <div class="flex items-center gap-4 mb-6">
                <div class="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                </div>
                <div>
                    <h3 class="text-xl font-bold text-gray-900">Transfert d'élève</h3>
                    <p class="text-sm text-gray-500">Enregistrez le départ vers un autre établissement</p>
                </div>
            </div>

            <div [formGroup]="transferForm" class="space-y-6">
                <div class="space-y-1.5">
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">École de destination</label>
                  <input type="text" formControlName="targetSchoolName" class="block w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all">
                </div>
                <div class="space-y-1.5">
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Adresse / Ville</label>
                  <input type="text" formControlName="targetSchoolAddress" class="block w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all">
                </div>
            </div>

            <div class="mt-8 flex justify-end gap-3">
                <button (click)="closeModal()" class="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                    Annuler
                </button>
                <button (click)="confirmTransfer()" 
                    [disabled]="transferForm.invalid"
                    class="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200">
                    Confirmer & Imprimer
                </button>
            </div>
        </div>

        <div *ngIf="isMode('print_badge_type')" class="p-8 text-center">
            <h3 class="text-xl font-bold text-gray-900 mb-2">Format de la carte</h3>
            <p class="text-sm text-gray-500 mb-8">Choisissez la technologie de badging à imprimer sur la carte</p>
            
            <div class="grid grid-cols-2 gap-4">
                <button (click)="confirmPrintBadge('QR')" class="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all group">
                    <div class="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
                    </div>
                    <span class="font-bold text-gray-900">QR Code</span>
                    <span class="text-xs text-gray-500 mt-1">Classique (Standard)</span>
                </button>
                
                <button (click)="confirmPrintBadge('RFID')" class="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-2xl hover:border-yellow-500 hover:bg-yellow-50 transition-all group">
                    <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <svg class="w-10 h-10" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="8" y="12" width="48" height="40" rx="6" fill="#FBBF24" />
                            <rect x="8" y="12" width="48" height="40" rx="6" stroke="#D97706" stroke-width="2" />
                            <line x1="8" y1="26" x2="22" y2="26" stroke="#D97706" stroke-width="2" />
                            <line x1="8" y1="38" x2="22" y2="38" stroke="#D97706" stroke-width="2" />
                            <line x1="42" y1="26" x2="56" y2="26" stroke="#D97706" stroke-width="2" />
                            <line x1="42" y1="38" x2="56" y2="38" stroke="#D97706" stroke-width="2" />
                            <rect x="22" y="20" width="20" height="24" rx="10" stroke="#D97706" stroke-width="2" />
                            <line x1="32" y1="12" x2="32" y2="20" stroke="#D97706" stroke-width="2" />
                            <line x1="32" y1="44" x2="32" y2="52" stroke="#D97706" stroke-width="2" />
                        </svg>
                    </div>
                    <span class="font-bold text-gray-900">Puce RFID</span>
                    <span class="text-xs text-gray-500 mt-1">NFC (Premium)</span>
                </button>
            </div>
            
            <button (click)="closeModal()" class="mt-8 px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                Annuler
            </button>
        </div>
    </app-ui-modal>
    
    <app-student-report-modal 
      [isOpen]="isReportModalOpen()" 
      [student]="selectedItem()?.student" 
      [enrollment]="selectedItem()" 
      (close)="isReportModalOpen.set(false)">
    </app-student-report-modal>

    <app-ui-export-modal [isOpen]="showExportModal()" [isExporting]="isExporting()" (close)="closeExportModal()"
        (confirm)="confirmExport($event)">
    </app-ui-export-modal>
    `
})
export class EnrollmentListComponent extends BaseModalListComponent<any> implements OnInit, AfterViewInit, OnDestroy {
    service = inject(EnrollmentService);
    classroomService = inject(ClassRoomService);
    academicYearService = inject(AcademicYearService);
    establishmentService = inject(EstablishmentService);

    query = this.service.getQuery();
    responseKey = 'enrollments';

    // Filters
    searchControl = new FormControl('');
    isFiltersOpen = signal(false);
    isReportModalOpen = signal(false);
    classrooms$ = this.classroomService.list();
    academicYears$ = this.academicYearService.list();

    transferForm = this.fb.group({
        targetSchoolName: [''],
        targetSchoolAddress: ['']
    });

    private destroy$ = new Subject<void>();
    private cdr = inject(ChangeDetectorRef);

    @ViewChild('studentCell') studentCell!: TemplateRef<any>;
    @ViewChild('statusCell') statusCell!: TemplateRef<any>;

    tableColumns: UiTableColumn[] = [];

    override initFilterForm(): FormGroup {
        return this.fb.group({
            search: [''],
            classroomId: [null],
            academicYearId: [null],
            status: [null]
        });
    }

    override ngOnInit(): void {
        super.ngOnInit();

        // Set active academic year by default
        this.academicYears$.pipe(takeUntil(this.destroy$)).subscribe(years => {
            const activeYear = years.find((y: any) => y.isActive);
            if (activeYear) {
                // Ensure we don't trigger unnecessary re-fetches if it's already set
                if (this.filterForm.value.academicYearId !== activeYear.id || this.filterForm.value.status !== 'REGISTERED') {
                    this.filterForm.patchValue({ 
                        academicYearId: activeYear.id,
                        status: 'REGISTERED' 
                    });
                }
            }
        });

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

    override getExportConfig() {
        return {
            title: 'Liste des Inscriptions',
            columns: [
                { header: 'Matricule', key: 'student.matricule', format: (item: any) => item.student?.matricule || '-' },
                { header: 'Prénom', key: 'student.firstName', format: (item: any) => item.student?.firstName || '-' },
                { header: 'Nom', key: 'student.lastName', format: (item: any) => item.student?.lastName || '-' },
                { header: 'Classe', key: 'classroom.name', format: (item: any) => item.classroom?.name || '-' },
                { header: 'Passage', key: 'isRepeater', format: (item: any) => item.isRepeater ? 'Redoublant' : 'Passant' },
                { header: 'Statut', key: 'status', format: (item: any) => this.getStatusLabel(item.status) }
            ]
        };
    }

    onExpel(item: any) {
        this.selectedItem.set(item);
        (this.modalMode as any).set('expel');
        this.openModal();
    }

    onTransfer(item: any) {
        this.openModal(item, 'transfer' as any);
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

    override onDetails(item: any) {
        this.selectedItem.set(item);
        this.closeMenu();
        this.isReportModalOpen.set(true);
    }

    async onPrintCertificate(enrollment: any) {
        this.isLoading.set(true);
        try {
            const estId = this.structureState.currentEstablishmentId();
            let establishment: any = null;
            if (estId) {
                const ests = await firstValueFrom(this.establishmentService.getAll());
                establishment = (ests.data as any)?.establishments?.items?.find((e: any) => e.id === estId);
            }

            const printData = {
                student: enrollment.student,
                enrollment: enrollment,
                establishment: establishment
            };
            localStorage.setItem('certificate_print_data', JSON.stringify(printData));
            window.open('/print/certificate', '_blank');
        } catch (err) {
            console.error('Print Error:', err);
            this.toastService.error("Erreur lors de la préparation de l'impression");
        } finally {
            this.isLoading.set(false);
        }
    }


    onSelectPrintType(enrollment: any) {
        this.openModal(enrollment, 'print_badge_type' as any);
    }

    async confirmPrintBadge(badgeType: 'QR' | 'RFID') {
        const enrollment = this.selectedItem();
        if (!enrollment) return;

        this.isLoading.set(true);
        try {
            const estId = this.structureState.currentEstablishmentId();
            let establishment: any = null;
            if (estId) {
                const ests = await firstValueFrom(this.establishmentService.getAll());
                establishment = (ests.data as any)?.establishments?.items?.find((e: any) => e.id === estId);
            }

            const printData = {
                student: enrollment.student,
                enrollment: enrollment,
                establishment: establishment,
                badgeType: badgeType
            };
            localStorage.setItem('idcard_print_data', JSON.stringify(printData));
            this.closeModal();
            window.open('/print/idcard', '_blank');
        } catch (err) {
            console.error('Print Error:', err);
            this.toastService.error("Erreur lors de la préparation de l'impression");
        } finally {
            this.isLoading.set(false);
        }
    }

    async confirmTransfer() {
        if (!this.selectedItem() || this.transferForm.invalid) return;
        
        const enrollment = this.selectedItem();

        this.isLoading.set(true);
        this.service.save({ 
            id: enrollment.id, 
            status: 'LEFT' 
        }).subscribe({
            next: async () => {
                this.toastService.success('Départ enregistré avec succès');
                const targetInfo = this.transferForm.value;
                await this.printTransferApproval(enrollment, targetInfo);
                this.closeModal();
                this.refresh();
            },
            error: () => {
                this.isLoading.set(false);
                this.toastService.error('Erreur lors de l\'opération');
            }
        });
    }

    async printTransferApproval(enrollment: any, target: any) {
        try {
            const [jsPDFModule] = await Promise.all([import('jspdf')]);
            const JsPDF = (jsPDFModule as any).default || jsPDFModule;

            const estId = this.structureState.currentEstablishmentId();
            let establishment: any = null;
            if (estId) {
                const ests = await firstValueFrom(this.establishmentService.getAll());
                establishment = (ests.data as any)?.establishments?.items?.find((e: any) => e.id === estId);
            }

            const doc = new JsPDF();
            await this.generateTransferPDF(doc, enrollment, establishment, target);
            doc.save(`transfert_${enrollment.student.matricule}.pdf`);
        } catch (err) {
            console.error('Print Error:', err);
            this.toastService.error('Erreur lors de l\'impression du transfert');
        }
    }

    private async generateTransferPDF(doc: any, enrollment: any, est: any, target: any) {
        const student = enrollment.student;

        // Beautiful Header styling
        doc.setFillColor(30, 41, 59);
        doc.rect(0, 0, 210, 40, 'F'); // Dark background for the whole header

        // Fetch Logo if exists
        if (est?.logo) {
            try {
                let logoUrl = est.logo;
                if (!logoUrl.startsWith('http') && !logoUrl.startsWith('data:')) {
                    const baseUrl = environment.apiUrl.replace('/api', '');
                    const cleanPath = logoUrl.startsWith('/') ? logoUrl.substring(1) : logoUrl;
                    logoUrl = cleanPath.startsWith('media/') ? `${baseUrl}/${cleanPath}` : `${baseUrl}/media/${cleanPath}`;
                }
                
                const imgData = await this.getBase64ImageFromUrl(logoUrl);
                if (imgData) {
                    doc.addImage(imgData, 'PNG', 15, 8, 24, 24); // Left-aligned logo in header
                }
            } catch (e) {
                console.error("Could not load logo for PDF", e);
            }
        }

        // Header Text
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.text(est?.name?.toUpperCase() || 'ÉTABLISSEMENT SCOLAIRE', 105, 20, { align: 'center' });
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`${est?.address || ''} - ${est?.city || ''}`, 105, 28, { align: 'center' });
        doc.text(`Tél: ${est?.phone || ''} | Email: ${est?.email || ''}`, 105, 34, { align: 'center' });
        
        // Document Title
        doc.setFontSize(24);
        doc.setTextColor(79, 70, 229);
        doc.setFont('helvetica', 'bold');
        doc.text('CERTIFICAT DE TRANSFERT', 105, 60, { align: 'center' });
        
        // Add a nice line under the title
        doc.setDrawColor(79, 70, 229);
        doc.setLineWidth(1);
        doc.line(65, 65, 145, 65);

        // Body Content
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        
        const bodyY = 85;
        const lineSpacing = 8;
        
        doc.text(`Je soussigné(e), le Chef de l'établissement `, 20, bodyY);
        doc.setFont('helvetica', 'bold');
        doc.text(`${est?.name || 'l\'école'}`, doc.getTextWidth(`Je soussigné(e), le Chef de l'établissement `) + 21, bodyY);
        doc.setFont('helvetica', 'normal');
        doc.text(`, certifie par la présente que l'élève :`, 20, bodyY + lineSpacing);
        
        // Student Info Box
        doc.setFillColor(248, 250, 252); // Very light slate
        doc.setDrawColor(203, 213, 225);
        doc.roundedRect(20, bodyY + 15, 170, 35, 3, 3, 'FD'); // Fill and Border
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(`${student.lastName?.toUpperCase()} ${student.firstName}`, 25, bodyY + 25);
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        doc.text(`Matricule : `, 25, bodyY + 35);
        doc.setFont('helvetica', 'bold');
        doc.text(`${student.matricule}`, 45, bodyY + 35);
        
        doc.setFont('helvetica', 'normal');
        doc.text(`Classe précédente : `, 25, bodyY + 42);
        doc.setFont('helvetica', 'bold');
        doc.text(`${enrollment.classroom?.name}`, 58, bodyY + 42);

        // Target School Section
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Est officiellement autorisé(e) à poursuivre sa scolarité et à être transféré(e) vers :`, 20, bodyY + 65);
        
        if (target.targetSchoolName) {
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(79, 70, 229);
            doc.text(target.targetSchoolName?.toUpperCase(), 20, bodyY + 75);
        } else {
            doc.setDrawColor(148, 163, 184); // Slate-400
            doc.setLineWidth(0.5);
            if (typeof doc.setLineDash === 'function') doc.setLineDash([2, 2]);
            doc.line(20, bodyY + 75, 150, bodyY + 75);
            if (typeof doc.setLineDash === 'function') doc.setLineDash([]);
        }
        
        if (target.targetSchoolAddress) {
            doc.setFontSize(11);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(71, 85, 105);
            doc.text(`Adresse : ${target.targetSchoolAddress}`, 20, bodyY + 82);
        } else {
            doc.setFontSize(11);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(71, 85, 105);
            doc.text(`Adresse : `, 20, bodyY + 82);
            doc.setDrawColor(148, 163, 184);
            doc.setLineWidth(0.5);
            if (typeof doc.setLineDash === 'function') doc.setLineDash([2, 2]);
            doc.line(40, bodyY + 82, 150, bodyY + 82);
            if (typeof doc.setLineDash === 'function') doc.setLineDash([]);
        }

        // Closure Statement
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(30, 41, 59);
        doc.text(`Nous attestons que le dossier scolaire et administratif de l'élève a été dûment clôturé`, 20, bodyY + 105);
        doc.text(`au sein de notre établissement, en règle avec tous ses engagements.`, 20, bodyY + 113);

        // Footer & Signatures
        doc.text(`Fait à ${est?.city || 'Yaoundé'}, le ${new Date().toLocaleDateString('fr-FR')}`, 190, bodyY + 135, { align: 'right' });
        
        doc.setFont('helvetica', 'bold');
        doc.text('Le Directeur de l\'Établissement', 190, bodyY + 145, { align: 'right' });
        
        doc.setDrawColor(203, 213, 225);
        // We do a simple trick for dashes if setLineDash is available
        if (typeof doc.setLineDash === 'function') {
            doc.setLineDash([2, 2]);
        }
        doc.rect(140, bodyY + 155, 50, 25);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(148, 163, 184);
        doc.text('Cachet et Signature', 165, bodyY + 168, { align: 'center' });
        
        // Reset properties
        if (typeof doc.setLineDash === 'function') {
            doc.setLineDash([]);
        }
    }

    private getBase64ImageFromUrl(imageUrl: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (!ctx) return reject('No canvas context');
                ctx.drawImage(img, 0, 0);
                const dataURL = canvas.toDataURL('image/png');
                resolve(dataURL);
            };
            img.onerror = error => reject(error);
            img.src = imageUrl;
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
            academicYearId: null,
            status: null
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
