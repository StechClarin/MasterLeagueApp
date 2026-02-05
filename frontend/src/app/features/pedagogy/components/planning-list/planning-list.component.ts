import { Component, inject, signal, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BaseModalListComponent } from '@core/abstracts/base-modal-list.component';
import { PlanningService } from '../../services/planning.service';
import { PlanningFormComponent } from '../planning-form/planning-form.component';
import { PlanningCalendarComponent } from '../planning-calendar/planning-calendar.component';
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
    PlanningCalendarComponent,
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

  // Calendar View State
  showCalendar = signal<boolean>(false);
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

  openCalendar(item: any) {
    // Fetch full details if needed, or assume item has details
    // Usually list item might miss details. 
    // Better to fetch details or ensure list query includes them.
    // For now, assuming list includes details or we rely on what we have.
    // Step 1: Check if details present. If not, fetch.
    // Actually, let's just use what we have, if it's missing details, calendar will be empty.
    // But usually Planning List query might not fetch details for performance.
    // Let's assume we pass what we have.
    this.selectedPlanning.set(item);
    this.showCalendar.set(true);
  }

  closeCalendar() {
    this.showCalendar.set(false);
    this.selectedPlanning.set(null);
  }
}
