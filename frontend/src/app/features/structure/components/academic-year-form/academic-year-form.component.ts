import { Component, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BaseFormComponent } from '@core/abstracts/base-form.component';
import { AcademicYearService } from '../../services/academic_year.service';
import { AcademicYearType } from '@app/graphql/generated';
import { UiInputComponent } from '@shared/components/ui-input/ui-input.component';
import { UiFormComponent } from '@shared/components/ui-form/ui-form.component';

@Component({
    selector: 'app-academic-year-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, UiInputComponent, UiFormComponent],
    templateUrl: './academic-year-form.component.html'
})
export class AcademicYearFormComponent extends BaseFormComponent implements OnChanges {
    private fb = inject(FormBuilder);
    private service = inject(AcademicYearService);

    @Input() academicYear: AcademicYearType | null = null;

    override form = this.fb.nonNullable.group({
        name: ['', [Validators.required]],
        start_date: ['', [Validators.required]],
        end_date: ['', [Validators.required]],
        isActive: [false],
        isArchived: [false]
    });

    ngOnChanges(changes: SimpleChanges) {
        if (changes['academicYear']) {
            if (this.academicYear) {
                this.form.patchValue({
                    name: this.academicYear.name,
                    start_date: this.academicYear.start_date, // Ensure date format matches YYYY-MM-DD
                    end_date: this.academicYear.end_date,
                    isActive: this.academicYear.isActive,
                    isArchived: this.academicYear.isArchived
                });
            } else {
                this.form.reset();
                this.form.patchValue({ isActive: false, isArchived: false });
            }
        }
    }

    save() {
        const payload: any = { ...this.form.value };
        if (this.academicYear && this.academicYear.id) {
            payload.id = this.academicYear.id;
        }
        return this.service.save(payload);
    }
}
