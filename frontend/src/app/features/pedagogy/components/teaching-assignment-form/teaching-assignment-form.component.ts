import { Component, EventEmitter, Output, Input, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, AbstractControl, ValidationErrors } from '@angular/forms';
import { BaseModalFormComponent } from '../../../../core/abstracts/base-modal-form.component';

export function dateRangeValidator(group: AbstractControl): ValidationErrors | null {
    const start = group.get('start_date')?.value;
    const end = group.get('end_date')?.value;

    if (start && end && start > end) {
        return { dateRange: true };
    }
    return null;
}
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

    /** Mode édition si une donnée existante a été injectée (fiable même si le composant est réutilisé). */
    get isEditMode(): boolean {
        return !!this.data;
    }

    service = inject(TeachingAssignmentService);
    private yearService = inject(AcademicYearService);
    private classService = inject(ClassRoomService);
    private subjectService = inject(SubjectService);
    private levelService = inject(LevelService);
    private personnelService = inject(PersonnelService);

    // Dropdown Data Observables
    years$ = this.yearService.listActive().pipe(
        map(items => {
            if (items.length > 0 && !this.form.get('academic_year_id')?.value) {
                this.form.get('academic_year_id')?.setValue(items[0]?.id);
            }
            return items;
        })
    );
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
        if (!data) return;

        // L'API GraphQL/REST expose la relation enseignant sous le nom 'personnel'
        // (et non 'teacher'). On garde 'teacher' en secours pour d'éventuels caches.
        const teacherId = data.personnel?.id ?? data.teacher?.id ?? null;

        const classroom = data.classroom || {};
        const subject = data.subject || {};

        // En mode édition, on déduit le niveau de la classe existante
        // (sinon repli sur le niveau associé à la matière via levelSubjects)
        const levelSubjects = Array.isArray(subject.levelSubjects) ? subject.levelSubjects : [];
        const levelId =
            classroom.level?.id ??
            levelSubjects.map((ls: any) => ls?.level?.id).find(Boolean) ??
            data.levelId ??
            null;

        this.form.patchValue({
            id: data.id ?? null,
            academic_year_id: data.academicYear?.id ?? data.academic_year_id ?? null,
            level_id: levelId,
            classroom_id: classroom.id ?? data.classroom_id ?? null,
            subject_id: subject.id ?? data.subject_id ?? null,
            teacher_id: teacherId,
            start_date: data.startDate ?? data.start_date ?? null,
            end_date: data.endDate ?? data.end_date ?? null,
            hours_scheduled: data.hoursScheduled ?? data.hours_scheduled ?? 0
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
        }, { validators: [dateRangeValidator] });
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
