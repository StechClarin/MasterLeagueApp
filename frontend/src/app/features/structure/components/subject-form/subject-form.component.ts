import { Component, inject, Input, OnChanges, OnInit, SimpleChanges, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BaseFormComponent } from '@core/abstracts/base-form.component';
import { SubjectService } from '../../services/subject.service';
import { SubjectType, LevelType, GetAllLevelsGQL, LevelSubjectType } from '../../../../graphql/generated';
import { UiInputComponent } from '@shared/components/ui-input/ui-input.component';
import { UiFormComponent } from '@shared/components/ui-form/ui-form.component';
import { UiTabsComponent, Tab } from '@shared/components/ui-tabs/ui-tabs.component'; // Verify export

@Component({
    selector: 'app-subject-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, UiInputComponent, UiFormComponent, UiTabsComponent],
    templateUrl: './subject-form.component.html'
})
export class SubjectFormComponent extends BaseFormComponent implements OnChanges, OnInit {
    private fb = inject(FormBuilder);
    private service = inject(SubjectService);
    private levelsGQL = inject(GetAllLevelsGQL);

    @Input() subject: SubjectType | null = null;
    @Input() isReadOnly = false; // Add readonly mode support

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
        // Effect to handle readonly state
        effect(() => {
            if (this.isReadOnly) {
                this.form.disable();
            } else {
                this.form.enable();
            }
        });
    }

    override ngOnInit() {
        this.fetchLevels();
    }

    // ...

    fetchLevels() {
        this.levelsGQL.watch({ page: 1, pageSize: 100 }).valueChanges.subscribe(res => {
            this.allLevels = res.data.levels?.items as LevelType[] || [];
            this.initLevelControls();
        });
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
            group.get('isSelected')?.valueChanges.subscribe(checked => {
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
            this.activeTab.set('general'); // FIX: Reset tab to first one

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

        // Handle readOnly changes explicitly if needed, or rely on effect/template
        if (changes['isReadOnly']) {
            if (this.isReadOnly) this.form.disable();
            else this.form.enable();
        }
    }

    save() {
        const formValue = this.form.getRawValue(); // Get raw value to include disabled/hidden fields if needed, but here we process manually

        // Filter selected levels and unnecessary fields
        const selectedLevels = formValue.levelSubjects
            .filter((ls: any) => ls.isSelected)
            .map((ls: any) => ({
                level: ls.levelId, // Auto-matches ID or object depending on serializer. Usually ID for FK.
                coefficient: ls.coefficient,
                hourly_quota: ls.hourlyQuota
            }));

        const payload: any = {
            name: formValue.name,
            code: formValue.code,
            is_optional: formValue.isOptional,
            level_subjects: selectedLevels // Field name must match Serializer
        };

        if (this.subject && this.subject.id) {
            payload.id = this.subject.id;
        }
        return this.service.save(payload);
    }
}
