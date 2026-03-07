import { Component, EventEmitter, Output, Input, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { BaseModalFormComponent } from '../../../../core/abstracts/base-modal-form.component';
import { TeachingAssignmentService } from '../../services/teaching-assignment.service';
import { TeachingAssignmentType } from '@app/graphql/types';

// Dependent Services for Dropdowns
import { AcademicYearService } from '../../../structure/services/academic_year.service';
import { ClassRoomService } from '../../../structure/services/classroom.service';
import { SubjectService } from '../../../structure/services/subject.service';
import { LevelService } from '../../../structure/services/level.service';
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
    private levelService = inject(LevelService);
    private personnelService = inject(PersonnelService);

    // Dropdown Data Observables
    years$ = this.yearService.list();
    levels$ = this.levelService.getAll().pipe(map(res => res.data.levels?.items || []));

    // Reactive Dropdowns based on Level
    classes$ = signal<any[]>([]);
    subjects$ = signal<any[]>([]);

    // FETCH ONLY PERSONNEL WITH 'ENSEIGNANT' ROLE
    teachers$ = this.personnelService.listByRole('ENSEIGNANT').pipe(
        map((items: any[]) => items.map(t => ({
            ...t,
            fullName: `${t.user?.firstName || ''} ${t.user?.lastName || ''}`.trim() || 'Inconnu'
        })))
    );

    override ngOnInit() {
        super.ngOnInit();
        this.setupFilters();

        if (this.data) {
            this.isEditMode.set(true);
            this.patchCustomValues(this.data);
        }
    }

    setupFilters() {
        // Observer level_id to filter classes and subjects
        this.form.get('level_id')?.valueChanges.subscribe(levelId => {
            if (levelId) {
                // Filter Classes
                this.classService.list().pipe(
                    map(all => (all || []).filter((c: any) => c && c.level?.id === levelId))
                ).subscribe(filtered => this.classes$.set(filtered));

                // Filter Subjects via Backend (calling updated query)
                this.subjectService.list().pipe(
                    map(all => (all || []).filter((s: any) => s && s.levelSubjects?.some((ls: any) => ls && ls.level?.id === levelId)))
                ).subscribe(filtered => this.subjects$.set(filtered));
            } else {
                this.classes$.set([]);
                this.subjects$.set([]);
            }

            // Reset children if not in initialization phase or if level actually changed
            // This avoids clearing the values when patching
            const currentClass = this.form.get('classroom_id')?.value;
            const currentSubj = this.form.get('subject_id')?.value;

            // If the current selected class doesn't belong to the new level, clear it
            // (Wait, simpler: just clear if user interacts)
        });
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
        // En mode édition, on déduit le niveau de la classe existante
        const levelId = data.classroom?.level?.id || data.subject?.levelSubjects?.[0]?.level?.id;

        this.form.patchValue({
            id: data.id,
            academic_year_id: data.academicYear?.id,
            level_id: levelId,
            classroom_id: data.classroom?.id,
            subject_id: data.subject?.id,
            teacher_id: data.teacher?.id,
            start_date: data.startDate,
            end_date: data.endDate,
            hours_scheduled: data.hoursScheduled
        }, { emitEvent: true }); // Emit to trigger setupFilters subscribers
    }

    initForm() {
        return this.fb.group({
            id: [null],
            academic_year_id: [null, [Validators.required]],
            level_id: [null, [Validators.required]],
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
