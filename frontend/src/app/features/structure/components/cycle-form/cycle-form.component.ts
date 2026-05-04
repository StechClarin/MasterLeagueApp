import { Component, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BaseFormComponent } from '@core/abstracts/base-form.component';
import { CycleService } from '../../services/cycle.service';
import { CycleType } from '@app/graphql/types';
import { UiInputComponent } from '@shared/components/ui-input/ui-input.component';
import { UiFormComponent } from '@shared/components/ui-form/ui-form.component';
import { UiSelectComponent } from '@shared/components/ui-select/ui-select.component';
import { UiToggleComponent } from '@shared/components/ui-toggle/ui-toggle.component';

@Component({
    selector: 'app-cycle-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, UiInputComponent, UiFormComponent, UiSelectComponent, UiToggleComponent],
    templateUrl: './cycle-form.component.html'
})
export class CycleFormComponent extends BaseFormComponent implements OnChanges {
    private fb = inject(FormBuilder);
    private service = inject(CycleService);

    @Input() cycle: CycleType | null = null;

    override form = this.fb.nonNullable.group({
        name: ['', [Validators.required]],
        code: ['', [Validators.required]],
        description: [''],
        hasOptions: [false],
        order: [0, [Validators.required]]
    });

    ngOnChanges(changes: SimpleChanges) {
        if (changes['cycle']) {
            if (this.cycle) {
                this.form.patchValue({
                    name: this.cycle.name || '',
                    code: this.cycle.code || '',
                    description: this.cycle.description || '',
                    hasOptions: this.cycle.hasOptions || false,
                    order: this.cycle.order || 0
                });
            } else {
                this.form.reset({ order: 0, hasOptions: false, code: '', description: '' });
            }
        }
    }

    save() {
        const rawValue = this.form.getRawValue();
        const payload: any = { 
            ...rawValue,
            code: rawValue.code?.toUpperCase() // Force uppercase for industrial consistency
        };
        if (this.cycle && this.cycle.id) {
            payload.id = this.cycle.id;
        }
        return this.service.save(payload);
    }
}
