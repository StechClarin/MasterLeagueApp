import { Component, inject, Input, OnChanges, OnInit, SimpleChanges, signal, effect, ChangeDetectorRef, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BaseFormComponent } from '@core/abstracts/base-form.component';
import { SubjectService } from '../../services/subject.service';
import { SubjectType, LevelType, LevelSubjectType } from '@app/graphql/types';
import { UiInputComponent } from '@shared/components/ui-input/ui-input.component';
import { UiTabsComponent, Tab } from '@shared/components/ui-tabs/ui-tabs.component';
import { UiFormHeaderComponent } from '@shared/components/ui-form-header/ui-form-header.component';
import { UiFormActionsComponent } from '@shared/components/ui-form-actions/ui-form-actions.component';
import { UiFormErrorsComponent } from '@shared/components/ui-form-errors/ui-form-errors.component';
import { StructureStateService } from '@core/services/structure-state.service';
import { LevelService } from '../../services/level.service';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs/operators';

@Component({
    selector: 'app-subject-form',
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule, 
        UiInputComponent, UiTabsComponent,
        UiFormHeaderComponent, UiFormActionsComponent, UiFormErrorsComponent
    ],
    templateUrl: './subject-form.component.html',
    styles: [`
        :host {
            display: block;
            width: 100%;
        }
    `]
})
export class SubjectFormComponent extends BaseFormComponent implements OnChanges, OnInit {
    private fb = inject(FormBuilder);
    private service = inject(SubjectService);
    private levelService = inject(LevelService);
    private structureState = inject(StructureStateService);
    private cdr = inject(ChangeDetectorRef);
    private destroyRef = inject(DestroyRef);

    @Input() subject: SubjectType | null = null;
    @Input() isReadOnly = false;

    // Tabs configuration
    tabs: Tab[] = [
        { 
            id: 'general', 
            label: 'Général',
            icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>`
        },
        { 
            id: 'levels', 
            label: 'Niveaux & Quotas',
            icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>`
        }
    ];
    activeTab = signal('general');

    // Data
    allLevels = signal<LevelType[]>([]);
    isLoadingLevels = signal(false);

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
    }

    override ngOnInit() {
        super.ngOnInit();
        this.loadLevels();
    }

    private loadLevels() {
        const estId = this.structureState.currentEstablishmentId();

        this.isLoadingLevels.set(true);
        this.levelService.getAll(estId).subscribe({
            next: (res: any) => {
                const levels = (res.data?.levels?.items as LevelType[]) || [];
                this.allLevels.set(levels);
                this.initLevelControls();
                this.isLoadingLevels.set(false);
                this.cdr.markForCheck();
            },
            error: (err) => {
                this.isLoadingLevels.set(false);
                this.logger.logAction(this.componentName, 'Error loading levels', err);
                this.toastService.error('Erreur lors du chargement des niveaux');
            }
        });
    }

    // Initialize controls for ALL levels (ViewModel pattern)
    initLevelControls() {
        const levels = this.allLevels();
        if (levels.length === 0) return;

        this.levelSubjectsArray.clear();

        // Map existing assignments for easy lookup
        const existingAssignments = new Map<string, LevelSubjectType>();
        if (this.subject && this.subject.levelSubjects) {
            this.subject.levelSubjects.forEach((ls: any) => {
                if (ls.level) existingAssignments.set(ls.level.id, ls);
            });
        }

        levels.forEach(level => {
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
                .pipe(takeUntilDestroyed(this.destroyRef)) // Ensure cleanup of these subscriptions too!
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
                this.initLevelControls();
            } else {
                this.form.reset({ isOptional: false });
                this.initLevelControls(); // Reset checkboxes
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
