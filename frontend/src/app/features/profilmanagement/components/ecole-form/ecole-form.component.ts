import { Component, inject, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';

import { UiInputComponent } from '@shared/components/ui-input/ui-input.component';
import { UiFormComponent } from '@shared/components/ui-form/ui-form.component';
import { BaseFormComponent } from '@core/abstracts/base-form.component';
import { EcoleService } from '../../services/ecole.service';
import { Ecole } from '../../models/ecole.model';

@Component({
    selector: 'app-ecole-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        UiInputComponent,
        UiFormComponent
    ],
    template: `
    <app-ui-form
      [title]="ecole ? 'Modifier l\\'École' : 'Nouvelle École'"
      [formGroup]="form"
      [isLoading]="isSubmitting"
      [errorMessage]="errorMessage"
      [submitLabel]="ecole ? 'Modifier' : 'Créer'"
      (submitForm)="onSubmit()"
      (cancel)="onCancel()">

      <div class="space-y-4">
        <app-ui-input label="Nom de l'école" formControlName="nom" [required]="true" placeholder="Ex: Lycée Jean Jaurès"></app-ui-input>
        <app-ui-input label="Adresse" formControlName="adresse" type="textarea" placeholder="Adresse complète..."></app-ui-input>
      </div>

    </app-ui-form>
  `
})
export class EcoleFormComponent extends BaseFormComponent implements OnInit, OnChanges {
    private fb = inject(FormBuilder);
    private ecoleService = inject(EcoleService);

    @Input() ecole: Ecole | null = null;

    // @ts-ignore
    override form: FormGroup = this.fb.group({
        nom: ['', Validators.required],
        adresse: ['']
    });

    ngOnInit() {
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['ecole']) {
            if (this.ecole) {
                this.form.patchValue({
                    nom: this.ecole.nom,
                    adresse: this.ecole.adresse
                });
            } else {
                this.form.reset();
            }
        }
    }

    onSubmit() {
        super.submit();
    }

    save(): Observable<any> {
        const payload: any = {
            ...this.form.value
        };

        if (this.ecole && this.ecole.id) {
            payload.id = this.ecole.id;
        }

        return this.ecoleService.save(payload);
    }
}
