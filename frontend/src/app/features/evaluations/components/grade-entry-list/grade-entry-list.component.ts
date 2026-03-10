import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BaseListComponent } from '@core/abstracts/base-list.component';
import { EvaluationService } from '../../services/evaluation.service';
import { EvaluationSessionFieldsFragment } from '../../graphql/evaluations.generated';
import { UiListPageComponent } from '@shared/components/ui-list-page/ui-list-page.component';
import { AppRoutes } from '@core/routing/routes.enum';

@Component({
  selector: 'app-grade-entry-list',
  standalone: true,
  imports: [CommonModule, UiListPageComponent],
  template: `
    <app-ui-list-page 
      title="Saisie des Notes" 
      [isLoading]="isLoading()"
      [isEmpty]="totalCount() === 0">
      
      <div header-actions>
         <!-- Actions si besoin -->
      </div>

      <div table class="p-6 bg-transparent border-none shadow-none">
        <!-- HEADER DESCRIPTION WITH ACCENT -->
        <div class="relative mb-12">
            <div class="absolute -left-6 top-0 bottom-0 w-1 bg-indigo-600 rounded-full"></div>
            <h4 class="text-sm font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Portail d'Évaluation</h4>
            <p class="text-gray-600 max-w-2xl text-lg font-medium leading-relaxed">
                Accédez aux sessions d'examen pour saisir les résultats. 
                Une interface <span class="text-indigo-600 font-bold">professionnelle</span> optimisée pour la gestion académique.
            </p>
        </div>

        <!-- EXAM CARDS GRID -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <div *ngFor="let session of (items$ | async)" 
               (click)="goToEntry(session.id)"
               class="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 cursor-pointer border border-slate-100 hover:border-indigo-100">
            
            <div class="h-full flex flex-col">
                <!-- Status Badge -->
                <div class="flex justify-between items-start mb-6">
                    <div class="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-500 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
                        <i class="pascal-icon-edit text-xl"></i>
                    </div>
                    <span [class]="getStatusClass(session.status)" 
                          class="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border">
                        {{ session.status }}
                    </span>
                </div>

                <!-- Main Content -->
                <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                         <span class="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                             {{ session.evaluationType.name }}
                             <span *ngIf="session.evaluationType.code" class="ml-1 opacity-60">
                                 ({{ session.evaluationType.code }})
                             </span>
                         </span>
                         <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                             • {{ getScopeLabel(session.scope) }}
                         </span>
                    </div>

                    <h3 class="text-xl font-bold text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors leading-tight">
                        {{ session.title }}
                    </h3>
                    
                    <div class="grid grid-cols-2 gap-3 mb-6">
                        <div class="bg-slate-50 rounded-lg p-2 border border-slate-100">
                             <span class="block text-[8px] font-bold uppercase text-slate-400 tracking-widest mb-1">Période</span>
                             <span class="text-[10px] font-black text-slate-700 truncate block">
                                {{ session.academicPeriod.name || 'Session Active' }}
                             </span>
                        </div>
                        <div class="bg-indigo-50/30 rounded-lg p-2 border border-indigo-100/50">
                             <span class="block text-[8px] font-bold uppercase text-indigo-400 tracking-widest mb-1">Cibles</span>
                             <span class="text-[10px] font-black text-indigo-600 block">
                                {{ getLevelsCount(session) }} Niveaux • {{ getClassroomsCount(session) }} Classes
                             </span>
                        </div>
                    </div>
                </div>

                <!-- Footer Stats -->
                <div class="pt-6 border-t border-slate-50 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="flex flex-col">
                            <span class="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Épreuves</span>
                            <span class="text-base font-black text-slate-900">
                                {{ session.subjects.length || 0 }}
                            </span>
                        </div>
                    </div>
                    
                    <div class="text-slate-300 group-hover:text-indigo-600 transition-colors">
                        <i class="pascal-icon-arrow-right text-lg group-hover:translate-x-1 transition-transform"></i>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>

      <div empty-actions class="py-20 flex flex-col items-center">
         <div class="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 text-slate-200">
            <i class="pascal-icon-info text-3xl"></i>
         </div>
         <p class="text-slate-400 font-bold text-center max-w-sm">
            Aucune session d'évaluation n'est disponible.
         </p>
      </div>

    </app-ui-list-page>
  `
})
export class GradeEntryListComponent extends BaseListComponent<EvaluationSessionFieldsFragment> implements OnInit {
  private router = inject(Router);
  public service = inject(EvaluationService);

  query = this.service.getQuery();
  responseKey = 'evaluationSessions';

  override ngOnInit(): void {
    super.ngOnInit();
    // Force subscription to break the UI-deadlock (isLoading <-> items$ subscription)
    if (this.items$) {
      this.items$.subscribe();
    }
  }

  initFilterForm() {
    return this.fb.group({
      status: ['IN_PROGRESS'], // Default to current exams
      search: ['']
    });
  }

  goToEntry(id: string) {
    this.router.navigate([AppRoutes.NOTES_AND_BULLETINS, id]);
  }

  getStatusClass(status: string) {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-600';
      case 'COMPLETED': return 'bg-emerald-100 text-emerald-700';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      default: return 'bg-blue-100 text-blue-700';
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
