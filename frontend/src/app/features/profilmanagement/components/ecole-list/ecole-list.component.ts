import { Component, inject, OnInit, ViewChild, TemplateRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';

import { UiListPageComponent } from '@shared/components/ui-list-page/ui-list-page.component';
import { UiTableComponent, UiTableColumn } from '@shared/components/ui-table/ui-table.component';
import { UiModalComponent } from '@shared/components/ui-modal/ui-modal.component';
import { UiConfirmModalComponent } from '@shared/components/ui-confirm-modal/ui-confirm-modal.component';
import { UiPaginationComponent } from '@shared/components/ui-pagination/ui-pagination.component';

import { BaseModalListComponent } from '@core/abstracts/base-modal-list.component';
import { EcoleService } from '../../services/ecole.service';
import { EcoleFormComponent } from '../ecole-form/ecole-form.component';
import { Ecole } from '../../models/ecole.model';

@Component({
  selector: 'app-ecole-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    UiListPageComponent,
    UiTableComponent,
    UiModalComponent,
    UiConfirmModalComponent,
    UiPaginationComponent,
    EcoleFormComponent
  ],
  template: `
    <app-ui-list-page
      title="Gestion des Écoles"
      [isLoading]="isLoading()"
      [isEmpty]="!isLoading() && (!items$ || (items$ | async)?.length === 0)"
      (refresh)="refresh()"
      (addItem)="openModal()">
      
      <div filters class="p-4 bg-white rounded-lg shadow-sm border border-gray-100 mb-4">
        <input type="text" placeholder="Rechercher par nom..." 
               class="w-full p-2 border rounded"
               (input)="onSearch($event)">
      </div>

      <ng-container table>
        <app-ui-table
          [data]="(items$ | async) || []"
          [columns]="tableColumns"
          [actionsTemplate]="actionsCell">
        </app-ui-table>
      </ng-container>

      <ng-template #dateCell let-item>
        {{ item.createdAt | date:'dd/MM/yyyy HH:mm' }}
      </ng-template>

      <ng-template #actionsCell let-item>
        <div class="flex gap-2 justify-end">
             <button (click)="onEdit(item)" class="text-indigo-600 hover:text-indigo-900">Modifier</button>
             <button (click)="onDelete(item)" class="text-red-600 hover:text-red-900">Supprimer</button>
        </div>
      </ng-template>

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

      <ng-container modals>
        <app-ui-modal [isOpen]="isModalOpen()" (close)="closeModal()">
            <ng-container [ngSwitch]="modalMode()">
                
                <app-ui-confirm-modal *ngSwitchCase="'delete'"
                    title="Supprimer l'école"
                    [message]="'Êtes-vous sûr de vouloir supprimer ' + selectedItem()?.nom + ' ?'"
                    (confirm)="confirmDelete()"
                    (cancel)="closeModal()">
                </app-ui-confirm-modal>

                <app-ecole-form *ngSwitchDefault
                    [ecole]="selectedItem()"
                    (save)="onSave()"
                    (cancel)="closeModal()">
                </app-ecole-form>

            </ng-container>
        </app-ui-modal>
      </ng-container>

    </app-ui-list-page>
  `
})
export class EcoleListComponent extends BaseModalListComponent<Ecole> implements OnInit, AfterViewInit {
  override service = inject(EcoleService);
  private cdr = inject(ChangeDetectorRef);

  query = this.service.getQuery();
  responseKey = 'ecoles';

  @ViewChild('dateCell') dateCell!: TemplateRef<any>;

  tableColumns: UiTableColumn[] = [];

  constructor() {
    super();
  }

  initFilterForm(): FormGroup {
    return this.fb.group({
      nom: ['']
    });
  }

  override ngOnInit(): void {
    super.ngOnInit();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.tableColumns = [
        { header: 'Nom', key: 'nom' },
        { header: 'Adresse', key: 'adresse' },
        { header: 'Date création', template: this.dateCell }
      ];
      this.cdr.detectChanges();
    });
  }

  onSearch(event: any) {
    const value = event.target.value;
    this.filterForm.patchValue({ nom: value });
    this.refresh();
  }
}
