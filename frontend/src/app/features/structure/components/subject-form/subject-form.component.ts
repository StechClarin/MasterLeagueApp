import { Component, inject, Input, OnChanges, OnInit, SimpleChanges, signal, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BaseFormComponent } from '@core/abstracts/base-form.component';
import { SubjectService } from '../../services/subject.service';
import { SubjectType, LevelType, LevelSubjectType } from '../../../../graphql/generated';
import { UiInputComponent } from '@shared/components/ui-input/ui-input.component';
import { UiFormComponent } from '@shared/components/ui-form/ui-form.component';
import { UiTabsComponent, Tab } from '@shared/components/ui-tabs/ui-tabs.component';
import { StructureStateService } from '@core/services/structure-state.service';
import { LevelService } from '../../services/level.service';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs/operators';

@Component({
    selector: 'app-subject-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, UiInputComponent, UiFormComponent, UiTabsComponent],
    templateUrl: './subject-form.component.html'
})
export class SubjectFormComponent extends BaseFormComponent implements OnChanges, OnInit {
    private fb = inject(FormBuilder);
    private service = inject(SubjectService);
    private levelService = inject(LevelService);
    private structureState = inject(StructureStateService);
    private cdr = inject(ChangeDetectorRef);

    @Input() subject: SubjectType | null = null;
    @Input() isReadOnly = false;

    // Tabs configuration
    tabs: Tab[] = [
        { id: 'general', label: 'Général' },
        { id: 'levels', label: 'Niveaux & Quotas' }
    ];
    activeTab = signal('general');

    // Data
    allLevels: LevelType[] = [];

    override form = this.fb.group({
        name: ['', [Validators.required]],
        code: ['', [Validators.required]],
        isOptional: [false],
        levelSubjects: this.fb.array([]) // FormArray for Level assignments
    });

    get levelSubjectsArray() {
        return this.form.get('levelSubjects') as FormArray;
    }

    constructor() {
        super();

        // ReadOnly Effect
        effect(() => {
            if (this.isReadOnly) {
                this.form.disable();
            } else {
                this.form.enable();
            }
        });

        // Reactive Loading with SwitchMap to avoid leaks
        toObservable(this.structureState.currentEstablishmentId)
            .pipe(
                takeUntilDestroyed(),
                switchMap(estId => this.levelService.getAll(estId))
            )
            .subscribe((res: any) => {
                this.allLevels = (res.data?.levels?.items as LevelType[]) || [];
                // Re-initialize controls when establishment (and thus level list) changes
                this.initLevelControls();
                this.cdr.markForCheck();
            });
    }

    override ngOnInit() {
        // Init handled by constructor subscription
    }

    // Initialize controls for ALL levels (ViewModel pattern)
    initLevelControls() {
        this.levelSubjectsArray.clear();

        // Map existing assignments for easy lookup
        const existingAssignments = new Map<string, LevelSubjectType>();
        if (this.subject && this.subject.levelSubjects) {
            this.subject.levelSubjects.forEach((ls: any) => {
                if (ls.level) existingAssignments.set(ls.level.id, ls);
            });
        }

        this.allLevels.forEach(level => {
            const assignment = existingAssignments.get(level.id);
            const isSelected = !!assignment;

            const group = this.fb.group({
                levelId: [level.id],
                levelName: [level.name],
                isSelected: [isSelected],
                coefficient: [{ value: assignment?.coefficient || 1, disabled: !isSelected }, [Validators.min(0)]],
                hourlyQuota: [{ value: assignment?.hourlyQuota || 0, disabled: !isSelected }, [Validators.min(0)]]
            });

            // Enable/Disable inputs based on selection
            group.get('isSelected')?.valueChanges
                .pipe(takeUntilDestroyed()) // Ensure cleanup of these subscriptions too!
                .subscribe(checked => {
                    const coeff = group.get('coefficient');
                    const quota = group.get('hourlyQuota');
                    if (checked) {
                        coeff?.enable();
                        quota?.enable();
                    } else {
                        coeff?.disable();
                        quota?.disable();
                    }
                });

            this.levelSubjectsArray.push(group);
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['subject']) {
            this.activeTab.set('general');

            if (this.subject) {
                const patch = {
                    name: this.subject.name || '',
                    code: this.subject.code || '',
                    isOptional: !!this.subject.isOptional
                };
                this.form.patchValue(patch);
                // Re-init levels if data already loaded
                if (this.allLevels.length > 0) {
                    this.initLevelControls();
                }
            } else {
                this.form.reset({ isOptional: false });
                if (this.allLevels.length > 0) {
                    this.initLevelControls(); // Reset checkboxes
                }
            }
        }

        if (changes['isReadOnly']) {
            if (this.isReadOnly) this.form.disable();
            else this.form.enable();
        }
    }

    save() {
        const formValue = this.form.getRawValue();

        // Filter selected levels and unnecessary fields
        const selectedLevels = formValue.levelSubjects
            .filter((ls: any) => ls.isSelected)
            .map((ls: any) => ({
                level: ls.levelId,
                coefficient: ls.coefficient,
                hourly_quota: ls.hourlyQuota
            }));

        const payload: any = {
            name: formValue.name,
            code: formValue.code,
            is_optional: formValue.isOptional,
            level_subjects: selectedLevels
        };

        if (this.subject && this.subject.id) {
            payload.id = this.subject.id;
        }
        return this.service.save(payload);
    }
}
