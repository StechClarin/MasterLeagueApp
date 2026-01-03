import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { BaseModalFormComponent } from '@app/core/abstracts/base-modal-form.component';
import { UiInputComponent } from '@app/shared/components/ui-input/ui-input.component';
import { ContractTypeService } from '../../services/contract-type.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-contract-type-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        UiInputComponent
    ],
    templateUrl: './contract-type-form.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractTypeFormComponent extends BaseModalFormComponent {
    private service = inject(ContractTypeService);
    form!: FormGroup;

    initForm(): FormGroup {
        return this.fb.group({
            code: ['', [Validators.required, Validators.maxLength(10)]],
            designation: ['', [Validators.required, Validators.maxLength(100)]],
            description: ['']
        });
    }

    save(): Observable<any> {
        return this.service.save(this.form.value);
    }
}
