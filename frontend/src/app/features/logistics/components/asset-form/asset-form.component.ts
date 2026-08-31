import { Component, inject, Input, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { BaseFormComponent } from '@core/abstracts/base-form.component';
import { AssetService } from '../../services/asset.service';

// Shared UI Imports
import { UiInputComponent } from '@shared/components/ui-input/ui-input.component';
import { UiFormComponent } from '@shared/components/ui-form/ui-form.component';
import { UiSelectComponent } from '@shared/components/ui-select/ui-select.component';
import { UiTabsComponent, Tab } from '@shared/components/ui-tabs/ui-tabs.component';
import { AssetType } from '@app/graphql/types';

@Component({
  selector: 'app-asset-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UiInputComponent, UiFormComponent, UiSelectComponent, UiTabsComponent],
  templateUrl: './asset-form.component.html'
})
export class AssetFormComponent extends BaseFormComponent implements OnChanges {
  private fb = inject(FormBuilder);
  public service = inject(AssetService);

  @Input() asset: AssetType | null = null;
  @Input() isReadOnly = false;

  tabs: Tab[] = [
    { id: 'general', label: 'Infos Générales' },
    { id: 'maintenance', label: 'Maintenance & Seuil d\'alerte' }
  ];
  currentTab = signal<string>('general');

  categoryOptions = [
    { label: 'Matériel Informatique', value: 'INFORMATIQUE' },
    { label: 'Mobilier', value: 'MOBILIER' },
    { label: 'Matériel Audiovisuel', value: 'AUDIOVISUEL' },
    { label: 'Équipement Sportif', value: 'SPORT' },
    { label: 'Autre', value: 'AUTRE' }
  ];

  override fieldLabels = {
    name: "Nom de l'équipement",
    serial_number: "Numéro de série / Code-barres",
    category: "Catégorie",
    purchase_date: "Date d'achat",
    deployment_date: "Date de déploiement",
    maintenance_frequency: "Fréquence de maintenance (jours)",
    notification_threshold_days: "Seuil d'alerte (jours)",
    cost: "Coût d'acquisition"
  };

  override form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    serial_number: ['', []],
    category: ['AUTRE', [Validators.required]],
    purchase_date: ['', []],
    deployment_date: ['', []],
    maintenance_frequency: [0, [Validators.min(0)]],
    notification_threshold_days: [3, [Validators.required, Validators.min(0)]],
    cost: [0.0, [Validators.required, Validators.min(0)]]
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['asset']) {
      if (this.asset) {
        this.form.patchValue({
          name: this.asset.name || '',
          serial_number: this.asset.serialNumber || '',
          category: this.asset.category || 'AUTRE',
          purchase_date: this.asset.purchaseDate || '',
          deployment_date: this.asset.deploymentDate || '',
          maintenance_frequency: this.asset.maintenanceFrequency || 0,
          notification_threshold_days: this.asset.notificationThresholdDays || 3,
          cost: this.asset.cost || 0.0
        });
      } else {
        this.form.reset({ category: 'AUTRE', maintenance_frequency: 0, notification_threshold_days: 3, cost: 0.0 });
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
    if (this.asset?.id) {
      payload.id = this.asset.id;
    }
    return this.service.save(payload);
  }
}
