import { Component, inject, ViewChild, TemplateRef, AfterViewInit, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { BaseModalListComponent } from '@core/abstracts/base-modal-list.component';
import { ToastService } from '@core/services/toast.service';
import { FeeService } from '../../services/fee.service';
import { FeeFormComponent } from '../fee-form/fee-form.component';
import { GetFeeDefinitionsDocument } from '../../graphql/finance.generated';

import { UiListPageComponent } from '@shared/components/ui-list-page/ui-list-page.component';
import { UiTableComponent, UiTableColumn } from '@shared/components/ui-table/ui-table.component';
import { UiPaginationComponent } from '@shared/components/ui-pagination/ui-pagination.component';
import { UiModalComponent } from '@shared/components/ui-modal/ui-modal.component';
import { UiConfirmModalComponent } from '@shared/components/ui-confirm-modal/ui-confirm-modal.component';
import { UiToolbarComponent } from '@shared/components/ui-toolbar/ui-toolbar.component';
import { UiDropdownComponent } from '@shared/components/ui-dropdown/ui-dropdown.component';

@Component({
  selector: 'app-fee-list',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    FeeFormComponent,
    UiListPageComponent,
    UiTableComponent,
    UiPaginationComponent,
    UiModalComponent,
    UiConfirmModalComponent,
    UiToolbarComponent,
    UiDropdownComponent
  ],
  template: `
    <app-ui-list-page 
      title="Configuration des Tarifs" 
      description="Gérez les frais de scolarité et autres tarifs de l'établissement."
      [isLoading]="isLoading()" 
      [isEmpty]="(items$ | async)?.length === 0">
      
      <ng-container header-actions>
        <app-ui-toolbar [searchControl]="searchControl" placeholder="Rechercher un tarif...">
          <button (click)="openModal(null, 'create')"
            class="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 active:bg-indigo-800 transition-all shadow-lg flex items-center justify-center font-medium text-sm">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Nouveau Tarif
          </button>
        </app-ui-toolbar>
      </ng-container>

      <ng-container table>
        <app-ui-table 
          [columns]="tableColumns" 
          [data]="items$ | async"
          [actionsTemplate]="actionsTmpl">
        </app-ui-table>

    <ng-template #actionsTmpl let-item>
      <app-ui-dropdown [isOpen]="activeMenuId() === item.id" direction="horizontal"
        (isOpenChange)="$event ? toggleMenu(item.id) : closeMenu()">

        <!-- Trigger -->
        <button trigger
          class="bg-indigo-600 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:bg-indigo-700 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/30"
          [ngClass]="{'ring-4 ring-indigo-500/30': activeMenuId() === item.id}">
          <span class="sr-only">Options</span>
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16">
            </path>
          </svg>
        </button>

        <!-- Menu Content (Horizontal Icons) -->
        <div menu class="flex items-center gap-1">
          <button (click)="onEdit(item)"
            class="p-2 rounded-full text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors relative group/btn"
            title="Modifier">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z">
              </path>
            </svg>
          </button>
          
          <button (click)="onBackfill(item)"
            class="p-2 rounded-full text-indigo-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors relative group/btn"
            title="Rétro-appliquer">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </button>

          <div class="w-px h-6 bg-gray-200 mx-1"></div>
          
          <button (click)="onDelete(item)"
            class="p-2 rounded-full text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors relative group/btn"
            title="Supprimer">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </button>
        </div>
      </app-ui-dropdown>
    </ng-template>
      </ng-container>

      <ng-container pagination>
        <app-ui-pagination
          [currentPage]="currentPage()"
          [pageSize]="pageSize()"
          [totalCount]="totalCount()"
          [numPages]="numPages()"
          (prev)="prevPage()"
          (next)="nextPage()"
          (goTo)="goToPage($event)">
        </app-ui-pagination>
      </ng-container>
    </app-ui-list-page>

    <app-ui-modal [isOpen]="isModalOpen() && modalMode() !== 'delete'" (close)="closeModal()" [title]="'Tarif'">
      <app-fee-form
        *ngIf="isModalOpen() && modalMode() !== 'delete'"
        [item]="selectedItem()"
        (cancel)="closeModal()"
        (success)="onSave()">
      </app-fee-form>
    </app-ui-modal>
      
    <!-- Delete Mode (outside app-ui-modal to prevent transform/overflow clipping) -->
    <app-ui-confirm-modal
      *ngIf="isModalOpen() && modalMode() === 'delete'"
      [title]="'Supprimer le tarif'"
      [message]="'Êtes-vous sûr de vouloir supprimer ce tarif ?'"
      (confirm)="confirmDelete()"
      (cancel)="closeModal()">
    </app-ui-confirm-modal>
  `
})
export class FeeListComponent extends BaseModalListComponent<any> implements OnInit, AfterViewInit, OnDestroy {
  service = inject(FeeService);
  responseKey = 'feeDefinitions';
  query = GetFeeDefinitionsDocument;

  searchControl = new FormControl('');
  private destroy$ = new Subject<void>();
  private cdr = inject(ChangeDetectorRef);
  private toast = inject(ToastService);
  tableColumns: UiTableColumn[] = [];

  override ngOnInit() {
    super.ngOnInit();
    
    // Sync Search
    this.searchControl.valueChanges.pipe(
        takeUntil(this.destroy$)
    ).subscribe(val => {
        this.filterForm.patchValue({ search: val || '' });
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
        { header: 'Libellé', key: 'name' },
        { header: 'Catégorie', key: 'category' },
        { header: 'Montant', format: (item) => `${item.amount?.toLocaleString()} FCFA` },
        { header: 'Niveau', format: (item) => item.level?.name || '-' },
        { header: 'Ciblage', format: (item) => {
            if (item.students?.length) return `Élèves (${item.students.length})`;
            if (item.classroom) return `Classe: ${item.classroom.name}`;
            if (item.option) return `Filière: ${item.option.name}`;
            return 'Global';
        }},
        { header: 'Année', format: (item) => item.academicYear?.name || '-' }
      ];
      this.cdr.detectChanges();
    });
  }

  onBackfill(item: any) {
    this.service.backfill(item.id).subscribe({
      next: (res: any) => {
        this.toast.success(res.message || 'Rétro-application terminée avec succès.');
        this.refresh();
      },
      error: (err) => {
        this.toast.error("Erreur lors de la rétro-application : " + (err.error?.detail || err.message));
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initFilterForm() {
    return this.fb.group({
      search: [''],
      levelId: [null]
    });
  }
}
