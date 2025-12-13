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
  templateUrl: './personne-list.component.html'
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
      search: [''] // matched to PersonneQuery 'search' argument
    });
  }

  override ngOnInit(): void {
    super.ngOnInit();

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      this.filterForm.patchValue({ search: value }); // Mapping search filter
      // Refresh list
      this.currentPage.set(1);
      this.refresh();
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.tableColumns = [
        { header: 'Nom', key: 'nom', className: 'font-bold text-gray-900' },
        { header: 'Prénom', key: 'prenom' },
        { header: 'Age', key: 'age' },
        { header: 'Nationalité', key: 'nationalite' },
        { header: 'Genre', key: 'genre' } // We could use a template/format for Gender
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
