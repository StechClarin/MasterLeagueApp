import { Component, inject, ViewChild, TemplateRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { BaseModalListComponent } from '@core/abstracts/base-modal-list.component';
import { StockItemService } from '../../services/stock-item.service';
import { StockItemFormComponent } from '../stock-item-form/stock-item-form.component';

// Shared UI Imports
import { UiModalComponent } from '@shared/components/ui-modal/ui-modal.component';
import { UiPaginationComponent } from '@shared/components/ui-pagination/ui-pagination.component';
import { UiListPageComponent } from '@shared/components/ui-list-page/ui-list-page.component';
import { UiToolbarComponent } from '@shared/components/ui-toolbar/ui-toolbar.component';
import { UiConfirmModalComponent } from '@shared/components/ui-confirm-modal/ui-confirm-modal.component';
import { UiTableComponent, UiTableColumn } from '@shared/components/ui-table/ui-table.component';
import { UiDropdownComponent } from '@shared/components/ui-dropdown/ui-dropdown.component';
import { UiButtonComponent } from '@shared/components/ui-button/ui-button.component';

@Component({
  selector: 'app-stock-item-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    StockItemFormComponent,
    UiModalComponent,
    UiPaginationComponent,
    UiListPageComponent,
    UiToolbarComponent,
    UiConfirmModalComponent,
    UiTableComponent,
    UiDropdownComponent,
    UiButtonComponent
  ],
  templateUrl: './stock-item-list.component.html'
})
export class StockItemListComponent extends BaseModalListComponent<any> implements AfterViewInit {
  public service = inject(StockItemService);
  query = this.service.getQuery();
  responseKey = 'stockItems';

  searchControl = new FormControl('');
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('nameCell') nameCell!: TemplateRef<any>;
  @ViewChild('quantityCell') quantityCell!: TemplateRef<any>;
  @ViewChild('thresholdCell') thresholdCell!: TemplateRef<any>;
  @ViewChild('costCell') costCell!: TemplateRef<any>;
  @ViewChild('statusCell') statusCell!: TemplateRef<any>;

  tableColumns: UiTableColumn[] = [];

  ngAfterViewInit() {
    setTimeout(() => {
      this.tableColumns = [
        { header: 'Nom de l\'article', template: this.nameCell },
        { header: 'Quantité en stock', template: this.quantityCell },
        { header: 'Seuil minimum', template: this.thresholdCell },
        { header: 'Coût unitaire', template: this.costCell },
        { header: 'État', template: this.statusCell }
      ];
      this.cdr.detectChanges();
    });
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.searchControl.valueChanges.subscribe(() => {
      this.currentPage.set(1);
      this.refresh();
    });
  }

  initFilterForm(): FormGroup {
    return this.fb.group({});
  }

  protected override getFilterVariables(): any {
    return {
      ...this.filterForm.value,
      search: this.searchControl.value || ''
    };
  }

  isAlert(item: any): boolean {
    return item.quantity < item.minThreshold;
  }
}
