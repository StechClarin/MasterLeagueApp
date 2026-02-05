import { Component, inject, signal, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BaseModalListComponent } from '@core/abstracts/base-modal-list.component';
import { PlanningService } from '../../services/planning.service';
import { PlanningFormComponent } from '../planning-form/planning-form.component';
import { PlanningResourceGridComponent } from '../planning-resource-grid/planning-resource-grid.component';
import { UiListPageComponent } from '@shared/components/ui-list-page/ui-list-page.component';
import { UiTableComponent } from '@shared/components/ui-table/ui-table.component';
import { UiModalComponent } from '@shared/components/ui-modal/ui-modal.component';
import { UiConfirmModalComponent } from '@shared/components/ui-confirm-modal/ui-confirm-modal.component';
import { UiToolbarComponent } from '@shared/components/ui-toolbar/ui-toolbar.component';

@Component({
  selector: 'app-planning-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    UiListPageComponent,
    UiTableComponent,
    UiModalComponent,
    PlanningFormComponent,
    PlanningResourceGridComponent,
    UiConfirmModalComponent,
    UiToolbarComponent
  ],
  templateUrl: './planning-list.component.html'
})
export class PlanningListComponent extends BaseModalListComponent<any> {
  service = inject(PlanningService);
  query = this.service.getQuery();
  responseKey = 'plannings';

  searchControl = new FormControl('');

  @ViewChild('actionsCell') actionsCell!: TemplateRef<any>;

  columns = [
    { key: 'nom', header: 'Nom' },
    { key: 'dateStart', header: 'Début', type: 'date' },
    { key: 'dateEnd', header: 'Fin', type: 'date' },
    { key: 'isTemplate', header: 'Modèle', type: 'boolean' },
    { key: 'actions', header: 'Actions', template: null } // Template set in ngAfterViewInit
  ] as any[];

  data = signal<any[]>([]);

  // View State
  viewMode = signal<'list' | 'calendar'>('list');
  selectedPlanning = signal<any>(null);

  override initFilterForm() {
    this.filterForm = this.fb.group({
      search: ['']
    });
    return this.filterForm;
  }

  override ngOnInit() {
    super.ngOnInit();
    this.items$.subscribe(items => {
      this.data.set(items);
    });

    this.searchControl.valueChanges.subscribe(val => {
      this.filterForm.patchValue({ search: val });
    });

    // Auto-select first planning if none selected when switching to calendar (optional enhancement)
  }

  ngAfterViewInit() {
    setTimeout(() => {
      // Assign template to columns dynamically to avoid circular ref issues in init
      const newCols = [...this.columns];
      const actionsCol = newCols.find(c => c.key === 'actions');
      if (actionsCol) actionsCol.template = this.actionsCell;
      this.columns = newCols;
    });
  }

  isEmpty() {
    return this.totalCount() === 0;
  }

  onModalSuccess() {
    this.onSave();
  }

  // Tab Navigation
  switchView(mode: 'list' | 'calendar') {
    this.viewMode.set(mode);
  }

  openCalendar(item: any) {
    this.selectedPlanning.set(item);
    this.switchView('calendar');
  }

  closeCalendar() {
    this.switchView('list');
    this.selectedPlanning.set(null);
  }
}
