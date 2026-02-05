import { Component, EventEmitter, Output, Input, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { BaseModalFormComponent } from '../../../../core/abstracts/base-modal-form.component';
import { TeachingAssignmentService } from '../../services/teaching-assignment.service';
import { TeachingAssignmentType } from '@app/graphql/generated';

// Dependent Services for Dropdowns
import { AcademicYearService } from '../../../structure/services/academic_year.service';
import { ClassRoomService } from '../../../structure/services/classroom.service';
import { SubjectService } from '../../../structure/services/subject.service';
import { PersonnelService } from '../../../hr/services/personnel.service';
// import { TeacherService } from '../../../hr/services/teacher.service'; // Removed

import { UiInputComponent } from '@shared/components/ui-input/ui-input.component';
import { UiSelectComponent } from '@shared/components/ui-select/ui-select.component';
import { UiFormComponent } from '@shared/components/ui-form/ui-form.component';

import { map } from 'rxjs/operators';

@Component({
    selector: 'app-teaching-assignment-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        UiInputComponent,
        UiSelectComponent,
        UiFormComponent
    ],
    templateUrl: './teaching-assignment-form.component.html'
})
export class TeachingAssignmentFormComponent extends BaseModalFormComponent implements OnInit {
    // Inherit Abstract properties
    form!: FormGroup;
    isEditMode = signal(false);

    service = inject(TeachingAssignmentService);
    private yearService = inject(AcademicYearService);
    private classService = inject(ClassRoomService);
    private subjectService = inject(SubjectService);
    // private teacherService = inject(TeacherService);
    private personnelService = inject(PersonnelService);

    // Dropdown Data Observables
    years$ = this.yearService.list();
    classes$ = this.classService.list();
    subjects$ = this.subjectService.list();

    // FETCH ONLY PERSONNEL WITH 'ENSEIGNANT' ROLE
    teachers$ = this.personnelService.listByRole('ENSEIGNANT').pipe(
        map((items: any[]) => items.map(t => ({
            ...t,
            fullName: `${t.user?.firstName || ''} ${t.user?.lastName || ''}`.trim() || 'Inconnu'
        })))
    );

    override ngOnInit() {
        super.ngOnInit();
        if (this.data) {
            this.isEditMode.set(true);
            this.patchCustomValues(this.data);
        }
    }

    // BaseModalFormComponent calls patchValue(data).
    // We override patchValue to handle nested objects?
    // OR we call patchCustomValues manually.
    // BaseModal calls patchValue(this._data).
    override patchValue(data: any) {
        if (!this.form) return;
        this.patchCustomValues(data);
    }

    patchCustomValues(data: any) {
        this.form.patchValue({
            id: data.id,
            academic_year_id: data.academicYear?.id,
            classroom_id: data.classroom?.id,
            subject_id: data.subject?.id,
            teacher_id: data.teacher?.id,
            start_date: data.startDate,
            end_date: data.endDate,
            hours_scheduled: data.hoursScheduled
        });
    }

    initForm() {
        return this.fb.group({
            id: [null],
            academic_year_id: [null, [Validators.required]],
            classroom_id: [null, [Validators.required]],
            subject_id: [null, [Validators.required]],
            teacher_id: [null, [Validators.required]],
            start_date: [null],
            end_date: [null],
            hours_scheduled: [0, [Validators.min(0)]]
        });
    }

    save() {
        const val = this.form.value;
        // Map teacher_id (from form control) to personnel_id (for backend service mapping)
        // OR the backend service expects 'personnel_id' -> 'personnel'
        // Let's send { personnel_id: val.teacher_id, ... }

        const payload = {
            ...val,
            personnel_id: val.teacher_id,
            // We keep teacher_id in case, but semantic is personnel_id is the primary key for the relation
        };
        return this.service.save(payload);
    }
}
