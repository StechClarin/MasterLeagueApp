import { Component, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { BaseFormComponent } from '@core/abstracts/base-form.component';
import { StockItemService } from '../../services/stock-item.service';

// Shared UI Imports
import { UiInputComponent } from '@shared/components/ui-input/ui-input.component';
import { UiFormComponent } from '@shared/components/ui-form/ui-form.component';
import { StockItemType } from '@app/graphql/types';

@Component({
  selector: 'app-stock-item-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UiInputComponent, UiFormComponent],
  templateUrl: './stock-item-form.component.html'
})
export class StockItemFormComponent extends BaseFormComponent implements OnChanges {
  private fb = inject(FormBuilder);
  public service = inject(StockItemService);

  @Input() stockItem: StockItemType | null = null;
  @Input() isReadOnly = false;

  override fieldLabels = {
    name: "Nom de l'article",
    quantity: "Quantité en stock",
    min_threshold: "Seuil minimum d'alerte",
    cost: "Coût unitaire"
  };

  override form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    quantity: [0, [Validators.required, Validators.min(0)]],
    min_threshold: [5, [Validators.required, Validators.min(0)]],
    cost: [0.0, [Validators.required, Validators.min(0)]]
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['stockItem']) {
      if (this.stockItem) {
        this.form.patchValue({
          name: this.stockItem.name || '',
          quantity: this.stockItem.quantity || 0,
          min_threshold: this.stockItem.minThreshold || 5,
          cost: this.stockItem.cost || 0.0
        });
      } else {
        this.form.reset({ quantity: 0, min_threshold: 5, cost: 0.0 });
      }
    }

    if (changes['isReadOnly']) {
      if (this.isReadOnly) {
        this.form.disable();
      } else {
        this.form.enable();
      }
    }
  }

  save() {
    const payload: any = this.form.getRawValue();
    if (this.stockItem?.id) {
      payload.id = this.stockItem.id;
    }
    return this.service.save(payload);
  }
}
