import { Component, OnInit, inject, ViewChild, TemplateRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { Observable } from 'rxjs'; // removed Subject, Store imports as we skip store for now
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { BaseModalListComponent } from '@core/abstracts/base-modal-list.component';
import { Personne } from '../../models/personne.model';
import { PersonneFormComponent } from '../personne-form/personne-form.component';
import { PersonneService } from '../../services/personne.service';

import { UiModalComponent } from '@shared/components/ui-modal/ui-modal.component';
import { UiPaginationComponent } from '@shared/components/ui-pagination/ui-pagination.component';
import { UiListPageComponent } from '@shared/components/ui-list-page/ui-list-page.component';
import { UiToolbarComponent } from '@shared/components/ui-toolbar/ui-toolbar.component';
import { UiConfirmModalComponent } from '@shared/components/ui-confirm-modal/ui-confirm-modal.component';
import { UiTableComponent, UiTableColumn } from '@shared/components/ui-table/ui-table.component';
import { UiDropdownComponent } from '@shared/components/ui-dropdown/ui-dropdown.component';

@Component({
    selector: 'app-personne-list',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        PersonneFormComponent,
        UiModalComponent,
        UiPaginationComponent,
        UiListPageComponent,
        UiToolbarComponent,
        UiConfirmModalComponent,
        UiTableComponent,
        UiDropdownComponent
    ],
    template: `
    <app-ui-list-page 
      title="Personnes" 
      description="Gérez les informations des personnes et leurs contacts."
      [isLoading]="isLoading()"
      [isEmpty]="!isLoading() && (!items$ || (items$ | async)?.length === 0)">

      <!-- Header Actions -->
      <ng-container header-actions>
        <app-ui-toolbar [searchControl]="searchControl" placeholder="Rechercher par nom...">
          <button (click)="openModal()"
            class="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 active:bg-indigo-800 focus:ring-4 focus:ring-indigo-500/30 transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center font-medium text-sm transform hover:-translate-y-0.5">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Nouvelle Personne
          </button>
        </app-ui-toolbar>
      </ng-container>

      <!-- Table -->
      <ng-container table>
          <app-ui-table 
            [data]="(items$ | async) || []" 
            [columns]="tableColumns"
            [actionsTemplate]="actionsCell">
          </app-ui-table>

          <!-- Templates for Custom Columns -->
          <ng-template #actionsCell let-personne>
            <app-ui-dropdown [isOpen]="activeMenuId() === personne.id" direction="horizontal"
              (isOpenChange)="$event ? toggleMenu(personne.id) : closeMenu()">

              <!-- Trigger -->
              <button trigger
                class="bg-indigo-600 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:bg-indigo-700 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/30"
                [ngClass]="{'ring-4 ring-indigo-500/30': activeMenuId() === personne.id}">
                <span class="sr-only">Options</span>
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16">
                  </path>
                </svg>
              </button>

              <!-- Menu Content -->
              <div menu class="flex items-center gap-1">
                <button (click)="onEdit(personne)"
                  class="p-2 rounded-full text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors relative group/btn"
                  title="Modifier">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z">
                    </path>
                  </svg>
                </button>

                <!-- No Details view implemented yet in modal but we can assume 'onEdit' covers it for now or implement separate -->
                <!-- <button (click)="onDetails(personne)" ... -->

                <div class="w-px h-6 bg-gray-200 mx-1"></div>

                <button (click)="onDelete(personne)"
                  class="p-2 rounded-full text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors relative group/btn"
                  title="Supprimer">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16">
                    </path>
                  </svg>
                </button>
              </div>
            </app-ui-dropdown>
          </ng-template>
      </ng-container>

      <!-- Pagination -->
      <ng-container pagination>
        <app-ui-pagination [currentPage]="currentPage()" [pageSize]="pageSize()" [totalCount]="totalCount()"
          [numPages]="numPages()" (prev)="prevPage()" (next)="nextPage()" (goTo)="goToPage($event)"></app-ui-pagination>
      </ng-container>

      <!-- Modals -->
      <ng-container modals>
          <app-ui-modal [isOpen]="isModalOpen()" (close)="closeModal()">
            <ng-container [ngSwitch]="modalMode()">
        
              <!-- Mode Suppression -->
              <app-ui-confirm-modal *ngSwitchCase="'delete'"
                title="Confirmer la suppression"
                [message]="'Êtes-vous sûr de vouloir supprimer ' + selectedItem()?.nom + ' ' + selectedItem()?.prenom + ' ? Cette action est irréversible.'"
                confirmLabel="Supprimer"
                cancelLabel="Annuler"
                type="danger"
                (confirm)="confirmDelete()"
                (cancel)="closeModal()">
              </app-ui-confirm-modal>
        
              <!-- Mode Création / Édition -->
              <!-- IMPORTANT: passing [personne] instead of [user] matching the component input -->
              <app-personne-form *ngSwitchDefault [personne]="selectedItem()" (cancel)="closeModal()"
                (success)="onSave()"></app-personne-form>
        
            </ng-container>
          </app-ui-modal>
      </ng-container>

    </app-ui-list-page>
  `
})
export class PersonneListComponent extends BaseModalListComponent<Personne> implements OnInit, AfterViewInit {

    query = inject(PersonneService).getQuery();
    responseKey = 'personnes';
    public service = inject(PersonneService);

    searchControl = new FormControl('');

    @ViewChild('actionsCell') actionsCell!: TemplateRef<any>;

    tableColumns: UiTableColumn[] = [];

    private cdr = inject(ChangeDetectorRef);

    initFilterForm(): FormGroup {
        return this.fb.group({
            nom: [''] // matched to PersonneQuery 'nom' argument
        });
    }

    override ngOnInit(): void {
        super.ngOnInit();

        this.searchControl.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged()
        ).subscribe(value => {
            this.filterForm.patchValue({ nom: value }); // Mapping search to 'nom' filter
            // Refresh list
            this.currentPage.set(1);
            this.refresh();
        });
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.tableColumns = [
                { header: 'Nom', key: 'nom' },
                { header: 'Prénom', key: 'prenom' },
                { header: 'Age', key: 'age' },
                { header: 'Nationalité', key: 'nationalite' },
                { header: 'Genre', key: 'genre' }, // We could use a template/format for Gender
                { header: 'Actions', template: this.actionsCell }
            ];
            this.cdr.detectChanges();
        });
    }

    override getExportConfig() {
        return {
            title: 'Liste des Personnes',
            columns: [
                { header: 'Nom', key: 'nom' },
                { header: 'Prénom', key: 'prenom' },
                { header: 'Age', key: 'age' },
                { header: 'Nationalité', key: 'nationalite' },
                { header: 'Genre', key: 'genre' }
            ]
        };
    }
}
