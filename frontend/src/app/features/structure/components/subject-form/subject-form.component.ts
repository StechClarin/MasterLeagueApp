import { Component, inject, Input, OnChanges, OnInit, SimpleChanges, signal, effect, ChangeDetectorRef, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BaseFormComponent } from '@core/abstracts/base-form.component';
import { SubjectService } from '../../services/subject.service';
import { OptionService } from '../../services/option.service';
import { SubjectType, LevelType, LevelSubjectType } from '@app/graphql/types';
import { UiInputComponent } from '@shared/components/ui-input/ui-input.component';
import { UiTabsComponent, Tab } from '@shared/components/ui-tabs/ui-tabs.component';
import { UiFormHeaderComponent } from '@shared/components/ui-form-header/ui-form-header.component';
import { UiFormActionsComponent } from '@shared/components/ui-form-actions/ui-form-actions.component';
import { UiFormErrorsComponent } from '@shared/components/ui-form-errors/ui-form-errors.component';
import { StructureStateService } from '@core/services/structure-state.service';
import { LevelService } from '../../services/level.service';
import { SubjectGroupService } from '../../services/subject-group.service';
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
    private optionService = inject(OptionService);
    private structureState = inject(StructureStateService);
    private cdr = inject(ChangeDetectorRef);
    private destroyRef = inject(DestroyRef);
    private groupService = inject(SubjectGroupService);

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
    levelOptions = signal<any[]>([]);
    isLoadingLevels = signal(false);

    allGroups = signal<any[]>([]);
    isLoadingGroups = signal(false);

    override form = this.fb.group({
        name: ['', [Validators.required]],
        code: ['', [Validators.required]],
        isOptional: [false],
        levelSubjects: this.fb.array([]) // FormArray for dynamic assignments
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
        this.loadGroups();
    }

    private loadGroups() {
        this.isLoadingGroups.set(true);
        this.groupService.getAll().subscribe({
            next: (res: any) => {
                this.allGroups.set(res.items);
                this.isLoadingGroups.set(false);
            },
            error: (err) => {
                console.error("Erreur lors du chargement des groupes:", err);
                this.isLoadingGroups.set(false);
            }
        });
    }

    private loadLevels() {
        const estId = this.structureState.currentEstablishmentId();

        this.isLoadingLevels.set(true);
        this.levelService.getAll(estId).subscribe({
            next: (res: any) => {
                const levels = (res.data?.levels?.items as LevelType[]) || [];
                this.allLevels.set(levels);
                this.levelOptions.set(levels.map(l => ({ value: l.id, label: l.name })));
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

    // Initialize controls from existing assignments
    initLevelControls() {
        this.levelSubjectsArray.clear();
        
        if (this.subject && this.subject.levelSubjects) {
            this.subject.levelSubjects.forEach((ls: any) => {
                this.addAssignment(ls);
            });
        } else if (this.allLevels().length > 0 && !this.subject) {
            // Optionnel: Ajouter une ligne vide par défaut ou laisser vide
        }
    }

    addAssignment(data: any = null) {
        const group = this.fb.group({
            levelId: [data?.level?.id || '', [Validators.required]],
            optionId: [data?.option?.id || null],
            groupId: [data?.group?.id || null],
            coefficient: [data?.coefficient || 1, [Validators.required, Validators.min(0)]],
            hourlyQuota: [data?.hourlyQuota || 0, [Validators.required, Validators.min(0)]],
            credits: [data?.credits || 0, [Validators.required, Validators.min(0)]],
            // UI Helpers
            availableOptions: [ [] as any[] ]
        });

        // If levelId exists, load its options
        if (group.get('levelId')?.value) {
            this.updateAvailableOptions(group);
        }

        // Watch level changes to update options
        group.get('levelId')?.valueChanges.subscribe(() => {
            group.patchValue({ optionId: null });
            this.updateAvailableOptions(group);
        });

        this.levelSubjectsArray.push(group);
        this.cdr.markForCheck();
    }

    removeAssignment(index: number) {
        this.levelSubjectsArray.removeAt(index);
        this.cdr.markForCheck();
    }

    private updateAvailableOptions(group: any) {
        const levelId = group.get('levelId')?.value;
        const level = this.allLevels().find(l => l.id === levelId);
        
        if (level?.cycle?.hasOptions) {
            // Load options for this level's establishment
            const estId = this.structureState.currentEstablishmentId() ?? undefined;
             this.optionService.getAll(undefined, "", undefined, estId).subscribe((res: any) => {
                const options = (res.data.options?.items || []).map((o: any) => ({
                    value: o.id,
                    label: o.name
                }));
                group.patchValue({ availableOptions: options });
                this.cdr.markForCheck();
            });
        } else {
            group.patchValue({ availableOptions: [] });
            this.cdr.markForCheck();
        }
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

        const assignments = formValue.levelSubjects.map((ls: any) => ({
            level: ls.levelId,
            option: ls.optionId,
            group: ls.groupId,
            coefficient: ls.coefficient,
            hourly_quota: ls.hourlyQuota,
            credits: ls.credits
        }));

        const payload: any = {
            name: formValue.name,
            code: formValue.code,
            is_optional: formValue.isOptional,
            level_subjects: assignments
        };

        if (this.subject && this.subject.id) {
            payload.id = this.subject.id;
        }
        return this.service.save(payload);
    }
}
