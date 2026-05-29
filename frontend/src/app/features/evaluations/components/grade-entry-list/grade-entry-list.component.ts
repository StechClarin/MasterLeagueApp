import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BaseListComponent } from '@core/abstracts/base-list.component';
import { EvaluationService } from '../../services/evaluation.service';
import { EvaluationSessionFieldsFragment } from '../../graphql/evaluations.generated';
import { UiListPageComponent } from '@shared/components/ui-list-page/ui-list-page.component';
import { AppRoutes } from '@core/routing/routes.enum';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

// Structure Services for Filters
import { AcademicPeriodService } from '../../../structure/services/academic_period.service';
import { LevelService } from '../../../structure/services/level.service';
import { ClassRoomService } from '../../../structure/services/classroom.service';
import { SubjectService as StructureSubjectService } from '../../../structure/services/subject.service';

// UI Kit components
import { UiFilterPanelComponent } from '@shared/components/ui-filter-panel/ui-filter-panel.component';
import { UiSelectComponent } from '@shared/components/ui-select/ui-select.component';
import { UiToolbarComponent } from '@shared/components/ui-toolbar/ui-toolbar.component';
import { UiPaginationComponent } from '@shared/components/ui-pagination/ui-pagination.component';

@Component({
  selector: 'app-grade-entry-list',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    UiListPageComponent,
    UiFilterPanelComponent,
    UiSelectComponent,
    UiToolbarComponent,
    UiPaginationComponent
  ],
  template: `
    <app-ui-list-page 
      title="Saisie des Notes" 
      [isLoading]="isLoading()"
      [isEmpty]="totalCount() === 0">
      
      <!-- Header Search & Actions -->
      <ng-container header-actions>
         <app-ui-toolbar [searchControl]="searchControl" placeholder="Rechercher une épreuve...">
         </app-ui-toolbar>
      </ng-container>

      <!-- Advanced Filters Panel -->
      <ng-container filters>
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div class="flex items-center gap-2">
                <button (click)="toggleFilters()"
                    class="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 hover:border-slate-300 focus:ring-2 focus:ring-slate-100 transition-all shadow-sm flex items-center justify-center font-bold text-sm group">
                    <svg class="w-5 h-5 mr-2 text-slate-400 group-hover:text-indigo-600" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    Filtres Avancés
                    <svg class="w-4 h-4 ml-2 text-slate-400 transform transition-transform duration-200"
                        [class.rotate-180]="isFiltersOpen()" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>

            <div class="flex items-center gap-3">
                <button (click)="refresh()"
                    class="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 hover:border-slate-300 focus:ring-2 focus:ring-indigo-100 transition-all shadow-sm flex items-center justify-center font-bold text-sm group"
                    title="Actualiser">
                    <svg class="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-transform group-hover:rotate-45 duration-300" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15">
                        </path>
                    </svg>
                </button>
            </div>
        </div>

        <app-ui-filter-panel [isOpen]="isFiltersOpen()" [form]="filterForm" (close)="toggleFilters()"
            (reset)="resetFilters()">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <app-ui-select label="Période" [formControl]="$any(filterForm.get('period'))"
                    [options]="(periods$ | async) || []" bindLabel="name" bindValue="id"></app-ui-select>

                <app-ui-select label="Niveau" [formControl]="$any(filterForm.get('level'))"
                    [options]="(levels$ | async) || []" bindLabel="name" bindValue="id"></app-ui-select>

                <app-ui-select label="Classe" [formControl]="$any(filterForm.get('classroom'))"
                    [options]="(classrooms$ | async) || []" bindLabel="name" bindValue="id"></app-ui-select>

                <app-ui-select label="Matière" [formControl]="$any(filterForm.get('subject'))"
                    [options]="(subjects$ | async) || []" bindLabel="name" bindValue="id"></app-ui-select>

                <app-ui-select label="Statut" [formControl]="$any(filterForm.get('status'))" [options]="[
                    { value: null, label: 'Tous' },
                    { value: 'DRAFT', label: 'Brouillon' },
                    { value: 'IN_PROGRESS', label: 'Lancé' },
                    { value: 'COMPLETED', label: 'Clôturé' },
                    { value: 'CANCELLED', label: 'Annulé' }
                ]" bindLabel="label" bindValue="value"></app-ui-select>
            </div>
        </app-ui-filter-panel>
      </ng-container>

      <!-- Main Sessions Grid -->
      <div table class="p-6 bg-transparent border-none shadow-none">
        <!-- HEADER DESCRIPTION WITH ACCENT -->
        <div class="relative mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
            <div class="absolute -left-6 top-0 bottom-0 w-1.5 bg-gradient-to-b from-indigo-600 to-violet-600 rounded-full"></div>
            <h4 class="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Portail d'Évaluation</h4>
            <p class="text-slate-600 max-w-2xl text-lg font-medium leading-relaxed">
                Accédez aux sessions d'examen pour saisir les résultats. 
                Une interface <span class="text-indigo-600 font-extrabold">professionnelle</span> optimisée pour la gestion académique.
            </p>
        </div>

        <!-- EXAM CARDS GRID -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <div *ngFor="let session of (items$ | async)" 
               (click)="goToEntry(session.id)"
               class="group relative bg-gradient-to-br from-white to-slate-50/50 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 hover:to-white transition-all duration-300 cursor-pointer border border-slate-200/60 hover:border-indigo-200 overflow-hidden">
            
            <!-- Glow background decoration -->
            <div class="absolute -right-16 -top-16 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:scale-150 transition-all duration-500"></div>

            <div class="h-full flex flex-col relative z-10">
                <!-- Status Badge -->
                <div class="flex justify-between items-start mb-6">
                    <div class="w-12 h-12 bg-gradient-to-tr from-indigo-50 to-purple-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm group-hover:from-indigo-600 group-hover:to-violet-600 group-hover:text-white transition-all duration-300 border border-indigo-100/30">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                    </div>
                    <span [class]="getStatusClass(session.status)" 
                          class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border">
                        {{ session.status }}
                    </span>
                </div>

                <!-- Main Content -->
                <div class="flex-1">
                    <div class="flex items-center gap-2 mb-3">
                         <span class="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100/50">
                             {{ session.evaluationType.name }}
                             <span *ngIf="session.evaluationType.code" class="ml-1 opacity-60">
                                 ({{ session.evaluationType.code }})
                             </span>
                         </span>
                         <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                             • {{ getScopeLabel(session.scope) }}
                         </span>
                    </div>

                    <h3 class="text-lg font-extrabold text-slate-800 mb-4 group-hover:text-indigo-600 transition-colors leading-tight">
                        {{ session.title }}
                    </h3>
                    
                    <div class="grid grid-cols-2 gap-3 mb-6">
                        <div class="bg-white rounded-xl p-3 border border-slate-200/60 shadow-xs">
                             <span class="block text-[8px] font-bold uppercase text-slate-400 tracking-widest mb-1">Période</span>
                             <span class="text-[10px] font-extrabold text-slate-700 truncate block">
                                {{ session.academicPeriod.name || 'Session Active' }}
                             </span>
                             <span class="block text-[8px] font-bold uppercase text-slate-400 tracking-widest mt-2 mb-1">Année Académique</span>
                             <span class="text-[10px] font-extrabold text-slate-500 truncate block">
                                {{ session.academicPeriod.academicYear.name || '--' }}
                             </span>
                        </div>
                        <div class="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-xl p-3 border border-indigo-500/10 shadow-xs">
                             <span class="block text-[8px] font-bold uppercase text-indigo-500 tracking-widest mb-1.5">Cibles</span>
                             <span class="text-[10px] font-extrabold text-indigo-600 block">
                                {{ getLevelsCount(session) }} Niveaux • {{ getClassroomsCount(session) }} Classes
                             </span>
                        </div>
                    </div>
                </div>

                <!-- Footer Stats -->
                <div class="pt-5 border-t border-slate-100 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="flex flex-col">
                            <span class="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Épreuves</span>
                            <span class="text-base font-black text-slate-800">
                                {{ session.subjects.length || 0 }}
                            </span>
                        </div>
                    </div>
                    
                    <div class="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 flex items-center justify-center transition-all duration-300">
                        <svg class="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"></path>
                        </svg>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <ng-container pagination>
          <app-ui-pagination [currentPage]="currentPage()" [pageSize]="pageSize()" [totalCount]="totalCount()"
              [numPages]="numPages()" (prev)="prevPage()" (next)="nextPage()" (goTo)="goToPage($event)">
          </app-ui-pagination>
      </ng-container>

      <div empty-actions class="py-20 flex flex-col items-center">
         <div class="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 text-slate-300">
            <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
         </div>
         <p class="text-slate-400 font-bold text-center max-w-sm">
            Aucune session d'évaluation ne correspond aux critères de recherche.
         </p>
      </div>

    </app-ui-list-page>
  `
})
export class GradeEntryListComponent extends BaseListComponent<EvaluationSessionFieldsFragment> implements OnInit, OnDestroy {
  private router = inject(Router);
  public service = inject(EvaluationService);

  private periodService = inject(AcademicPeriodService);
  private levelService = inject(LevelService);
  private classroomService = inject(ClassRoomService);
  private subjectService = inject(StructureSubjectService);

  query = this.service.getQuery();
  responseKey = 'evaluationSessions';

  searchControl = new FormControl('');
  isFiltersOpen = signal(false);
  private destroy$ = new Subject<void>();

  periods$ = this.periodService.list();
  levels$ = this.levelService.list();
  classrooms$ = this.classroomService.list();
  subjects$ = this.subjectService.list();

  override ngOnInit(): void {
    this.filterForm = this.initFilterForm();
    super.ngOnInit();
    
    // Force subscription to break the UI-deadlock (isLoading <-> items$ subscription)
    if (this.items$) {
      this.items$.pipe(takeUntil(this.destroy$)).subscribe();
    }

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

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initFilterForm() {
    return this.fb.group({
      period: [''],
      level: [''],
      classroom: [''],
      subject: [''],
      evaluationType: [''],
      status: ['']
    });
  }

  protected override getFilterVariables(): any {
    const values: any = { ...this.filterForm.value };
    values.search = this.searchControl.value || '';

    if (values.period) values['periodId'] = values.period as string;
    if (values.level) values['levelId'] = values.level as string;
    if (values.classroom) values['classroomId'] = values.classroom as string;
    if (values.subject) values['subjectId'] = values.subject as string;
    if (values.evaluationType) values['evaluationTypeId'] = values.evaluationType as string;

    delete values['period'];
    delete values['level'];
    delete values['classroom'];
    delete values['subject'];
    delete values['evaluationType'];

    return values;
  }

  toggleFilters() {
    this.isFiltersOpen.update(v => !v);
  }

  resetFilters() {
    this.searchControl.setValue('');
    this.filterForm.reset({
      status: ''
    });
  }

  goToEntry(id: string) {
    this.router.navigate([AppRoutes.NOTES_AND_BULLETINS, id]);
  }

  getStatusClass(status: string) {
    switch (status) {
      case 'DRAFT': return 'bg-slate-50 text-slate-600 border-slate-200/60';
      case 'COMPLETED': return 'bg-emerald-50 text-emerald-700 border-emerald-200/50';
      case 'CANCELLED': return 'bg-red-50 text-red-700 border-red-200/50';
      default: return 'bg-indigo-50 text-indigo-700 border-indigo-200/50';
    }
  }

  getScopeLabel(scope: string) {
    switch (scope) {
      case 'ESTABLISHMENT': return 'Établissement';
      case 'LEVEL': return 'Niveaux';
      case 'CLASS': return 'Classes';
      default: return scope;
    }
  }

  getLevelsCount(session: any) {
    const levels = new Set();
    session.subjects?.forEach((s: any) => {
      s.levels?.forEach((l: any) => levels.add(l.id));
    });
    return levels.size;
  }

  getClassroomsCount(session: any) {
    const classrooms = new Set();
    session.subjects?.forEach((s: any) => {
      s.plannings?.forEach((p: any) => {
        p.classrooms?.forEach((c: any) => classrooms.add(c.id));
      });
    });
    return classrooms.size;
  }
}
