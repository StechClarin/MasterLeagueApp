import { Component, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BaseFormComponent } from '@core/abstracts/base-form.component';
import { CycleService } from '../../services/cycle.service';
import { CycleType } from '@app/graphql/types';
import { UiInputComponent } from '@shared/components/ui-input/ui-input.component';
import { UiFormComponent } from '@shared/components/ui-form/ui-form.component';
import { UiSelectComponent } from '@shared/components/ui-select/ui-select.component';

@Component({
    selector: 'app-cycle-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, UiInputComponent, UiFormComponent, UiSelectComponent],
    templateUrl: './cycle-form.component.html'
})
export class CycleFormComponent extends BaseFormComponent implements OnChanges {
    private fb = inject(FormBuilder);
    private service = inject(CycleService);

    @Input() cycle: CycleType | null = null;

    override form = this.fb.nonNullable.group({
        name: ['', [Validators.required]],
        hasOptions: [false, [Validators.required]],
        order: [0, [Validators.required]]
    });

    ngOnChanges(changes: SimpleChanges) {
        if (changes['cycle']) {
            if (this.cycle) {
                const patch = {
                    ...this.cycle,
                    name: this.cycle.name || '',
                    hasOptions: this.cycle.hasOptions || false,
                    order: this.cycle.order || 0
                };
                this.form.patchValue(patch as any);
            } else {
                this.form.reset({ order: 0, hasOptions: false });
            }
        }
    }

    save() {
        const payload: any = { ...this.form.value };
        if (this.cycle && this.cycle.id) {
            payload.id = this.cycle.id;
        }
        return this.service.save(payload);
    }
}
