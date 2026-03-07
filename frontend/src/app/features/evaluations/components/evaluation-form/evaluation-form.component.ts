import { Component, inject, Input, OnChanges, SimpleChanges, signal, computed, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { BaseFormComponent } from '@core/abstracts/base-form.component';
import { EvaluationService } from '../../services/evaluation.service';
import { EvaluationTypeService } from '../../services/evaluation_type.service';
import { AcademicPeriodService } from '../../../structure/services/academic_period.service';
import { LevelService } from '../../../structure/services/level.service';
import { ClassRoomService } from '../../../structure/services/classroom.service';
import { SubjectService } from '../../../structure/services/subject.service';
import { RoomService } from '../../../structure/services/room.service';
import { EvaluationSessionFieldsFragment } from '../../graphql/evaluations.generated';

import { UiInputComponent } from '@shared/components/ui-input/ui-input.component';
import { UiFormComponent } from '@shared/components/ui-form/ui-form.component';
import { UiSelectComponent } from '@shared/components/ui-select/ui-select.component';
import { UiMultiSelectComponent } from '@shared/components/ui-multi-select/ui-multi-select.component';
import { UiToggleComponent } from '@shared/components/ui-toggle/ui-toggle.component';
import { UiTabsComponent, Tab } from '@shared/components/ui-tabs/ui-tabs.component';
import { UiMediaInputComponent } from '@shared/components/ui-media-input/ui-media-input.component';
import { PersonnelService } from '../../../hr/services/personnel.service';
import { of, Observable } from 'rxjs';
import { map, shareReplay, take, tap, switchMap } from 'rxjs/operators';
import { ToastService } from '@core/services/toast.service';

@Component({
    selector: 'app-evaluation-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        UiInputComponent,
        UiFormComponent,
        UiSelectComponent,
        UiMultiSelectComponent,
        UiToggleComponent,
        UiTabsComponent,
        UiMediaInputComponent
    ],
    templateUrl: './evaluation-form.component.html'
})
export class EvaluationFormComponent extends BaseFormComponent implements OnChanges {
    private fb = inject(FormBuilder);
    protected service = inject(EvaluationService);
    private evalTypeService = inject(EvaluationTypeService);
    private periodService = inject(AcademicPeriodService);
    private levelService = inject(LevelService);
    private classroomService = inject(ClassRoomService);
    private subjectService = inject(SubjectService);
    private roomService = inject(RoomService);
    private personnelService = inject(PersonnelService);
    protected toast = inject(ToastService);
    private cdr = inject(ChangeDetectorRef);

    @Input() item: EvaluationSessionFieldsFragment | null = null;
    @Input() isReadOnly: boolean = false;

    get formTitle(): string {
        if (this.isReadOnly) return 'Détails de la Session d\'Évaluation';
        return this.item ? 'Modifier la Session d\'Évaluation' : 'Nouvelle Session d\'Évaluation';
    }

    get formDescription(): string {
        return 'Configurez la session, les épreuves, les horaires de passage et la surveillance de l\'évaluation.';
    }

    // Data Sources with caching
    evaluationTypes$ = this.evalTypeService.list().pipe(shareReplay(1));
    periods$ = this.periodService.list().pipe(shareReplay(1));
    levels$ = this.levelService.list().pipe(shareReplay(1), tap(levels => this.allLevelsCache = levels));
    subjectsSource$ = this.subjectService.list().pipe(shareReplay(1), tap(subs => this.allSubjectsCache = subs));
    rooms$ = this.roomService.list().pipe(shareReplay(1));
    classrooms$ = this.classroomService.list().pipe(shareReplay(1), tap(classes => this.allClassroomsCache = classes));

    // Cached lookups for synchronous template access
    allLevelsCache: any[] = [];
    allClassroomsCache: any[] = [];
    allSubjectsCache: any[] = [];

    override ngOnInit() {
        super.ngOnInit();
        // Trigger subscriptions to populate caches
        this.levels$.pipe(take(1)).subscribe();
        this.classrooms$.pipe(take(1)).subscribe();
        this.subjectsSource$.pipe(take(1)).subscribe();
    }

    supervisors$ = (this.personnelService.list() as Observable<any[]>).pipe(
        map((items: any[]) => items.map((p: any) => ({
            id: p.id,
            fullName: p.user ? `${p.user.firstName || ''} ${p.user.lastName || ''}`.trim() : p.jobTitle
        })))
    );

    tabs: Tab[] = [
        { id: 'general', label: '1. Session' },
        { id: 'subjects', label: '2. Épreuves' },
        { id: 'planning', label: '3. Planification' },
        { id: 'supervision', label: '4. Surveillance' }
    ];
    activeTabId = signal<string>('general');

    // Modal state for Subjec File Upload
    isSubjectFileModalOpen = signal<boolean>(false);
    currentSubjectFileIndex = signal<number | null>(null);

    onTabChange(tabId: string) {
        this.activeTabId.set(tabId);
    }

    override form = this.fb.group({
        id: [null as string | null],
        title: ['', [Validators.required]],
        scope: ['CLASS', [Validators.required]],
        academic_period: ['', [Validators.required]],
        evaluation_type: ['', [Validators.required]],
        selectedLevels: [[] as string[]], // Global selection for Tab 2
        selectedClassrooms: [[] as string[]], // Global selection for Tab 2
        subjects: this.fb.array([]),
        supervisions: this.fb.array([])
    });

    get supervisions() {
        return this.form.get('supervisions') as FormArray;
    }

    get subjects() {
        return this.form.get('subjects') as FormArray;
    }

    addSubject() {
        const subjectGroup = this.fb.group({
            id: [null as string | null],
            subject: ['', [Validators.required]],
            levels: [[] as string[], [Validators.required]],
            max_score: [20.0, [Validators.required, Validators.min(1)]],
            subjectFiles: [{}] as any, // Dictionary of { [levelId]: File }
            plannings: this.fb.array([])
        });

        this.addPlanningToSubject(subjectGroup as FormGroup);
        this.subjects.push(subjectGroup);
    }

    addPlanningToSubject(subjectGroup: FormGroup) {
        const plannings = subjectGroup.get('plannings') as FormArray;
        const currentLevels = subjectGroup.get('levels')?.value || [];
        const planningGroup = this.fb.group({
            id: [null as string | null],
            date: ['', [Validators.required]],
            start_time: ['', [Validators.required]],
            duration_minutes: [null as number | null, [Validators.required]],
            levels_ids: [currentLevels, [Validators.required]],
            classrooms_ids: [[] as string[], [Validators.required]]
        });
        plannings.push(planningGroup);
    }

    removePlanningFromSubject(subjectIndex: number, planningIndex: number) {
        const plannings = this.getPlannings(subjectIndex);
        if (plannings.length > 1) {
            plannings.removeAt(planningIndex);
        }
    }

    getPlannings(subjectIndex: number): FormArray {
        return this.subjects.at(subjectIndex).get('plannings') as FormArray;
    }

    removeSubject(index: number) {
        this.subjects.removeAt(index);
    }

    addSupervision(date: string = '', classroomId: string = '') {
        const supervisionGroup = this.fb.group({
            id: [null as string | null],
            date: [date, [Validators.required]],
            classroom: [classroomId, [Validators.required]],
            supervisors: [[] as string[], [Validators.required]]
        });
        this.supervisions.push(supervisionGroup);
    }

    removeSupervision(index: number) {
        this.supervisions.removeAt(index);
    }



    ngOnChanges(changes: SimpleChanges) {
        if (changes['isReadOnly']) {
            this.isReadOnly ? this.form.disable() : this.form.enable();
        }

        if (changes['item'] && this.item) {
            this.patchForm(this.item);
        } else if (changes['item'] && !this.item) {
            this.form.reset();
            this.subjects.clear();
            this.addSubject(); // Start with one empty subject
        }
    }

    private patchForm(item: EvaluationSessionFieldsFragment) {
        const globalLevels = new Set<string>();
        const globalClassrooms = new Set<string>();

        (item as any).subjects?.forEach((s: any) => {
            s.levels?.forEach((l: any) => globalLevels.add(l.id));
            s.plannings?.forEach((p: any) => {
                p.classrooms?.forEach((c: any) => globalClassrooms.add(c.id));
            });
        });

        (item as any).supervisions?.forEach((sup: any) => {
            if (sup.classroom) globalClassrooms.add(sup.classroom.id);
        });

        this.form.patchValue({
            id: item.id,
            title: item.title,
            scope: item.scope,
            academic_period: item.academicPeriod?.id || '',
            evaluation_type: item.evaluationType?.id || '',
            selectedLevels: Array.from(globalLevels),
            selectedClassrooms: Array.from(globalClassrooms)
        });

        this.subjects.clear();
        const groupedSubjects = new Map<string, any>();

        (item as any).subjects?.forEach((s: any) => {
            const subjectId = s.subject?.id;
            if (!subjectId) return;

            if (!groupedSubjects.has(subjectId)) {
                groupedSubjects.set(subjectId, {
                    id: s.id,
                    subject: subjectId,
                    levels: [],
                    max_score: s.maxScore,
                    subjectFiles: {},
                    plannings: []
                });
            }

            const group = groupedSubjects.get(subjectId);

            s.levels?.forEach((l: any) => {
                if (!group.levels.includes(l.id)) {
                    group.levels.push(l.id);
                }
                if (s.subjectFile) {
                    group.subjectFiles[l.id] = s.subjectFile;
                }
            });

            group.plannings.push(...(s.plannings || []));
        });

        Array.from(groupedSubjects.values()).forEach((sGroup: any) => {
            const deduplicatedPlannings = new Map<string, any>();

            sGroup.plannings.forEach((p: any) => {
                const classroomsSig = (p.classrooms?.map((c: any) => c.id) || []).sort().join('-');
                const startTimePrefix = p.startTime ? p.startTime.substring(0, 5) : '';
                const signature = `${p.date}_${startTimePrefix}_${p.durationMinutes}_${classroomsSig}`;

                const pLevelsIds = p.levels?.map((l: any) => l.id) || [];

                if (!deduplicatedPlannings.has(signature)) {
                    deduplicatedPlannings.set(signature, {
                        ...p,
                        mappedLevels: [...pLevelsIds]
                    });
                } else {
                    const existingP = deduplicatedPlannings.get(signature);
                    pLevelsIds.forEach((lid: string) => {
                        if (!existingP.mappedLevels.includes(lid)) {
                            existingP.mappedLevels.push(lid);
                        }
                    });
                }
            });

            const finalPlannings = Array.from(deduplicatedPlannings.values());

            const subjectGroup = this.fb.group({
                id: [sGroup.id],
                subject: [sGroup.subject, [Validators.required]],
                levels: [sGroup.levels, [Validators.required]],
                max_score: [sGroup.max_score],
                subjectFiles: Object.keys(sGroup.subjectFiles).length > 0 ? [sGroup.subjectFiles] : [{}],
                plannings: this.fb.array(
                    finalPlannings.map((p: any) => this.fb.group({
                        id: [p.id || null],
                        date: [p.date || '', [Validators.required]],
                        start_time: [p.startTime ? p.startTime.substring(0, 5) : '', [Validators.required]],
                        duration_minutes: [p.durationMinutes || null, [Validators.required]],
                        levels_ids: [p.mappedLevels, [Validators.required]],
                        classrooms_ids: [p.classrooms?.map((c: any) => c.id) || [], [Validators.required]]
                    }))
                )
            });

            if (subjectGroup.get('plannings')?.value.length === 0) {
                this.addPlanningToSubject(subjectGroup as FormGroup);
            }

            this.subjects.push(subjectGroup);
        });

        this.supervisions.clear();
        (item as any).supervisions?.forEach((sup: any) => {
            const supervisionGroup = this.fb.group({
                id: [sup.id],
                date: [sup.date, [Validators.required]],
                classroom: [sup.classroom?.id, [Validators.required]],
                supervisors: [sup.supervisors?.map((s: any) => s.id) || [], [Validators.required]]
            });
            this.supervisions.push(supervisionGroup);
        });
    }

    save() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return of(null);
        }

        const data = this.form.getRawValue();
        const filesToUpload: { subjectIndex: number, file: File }[] = [];

        // We will reconstruct the subjects array logic to split subjects if they have specific files
        const processedSubjects: any[] = [];
        let finalSubjectIndex = 0;

        data.subjects.forEach((subject: any) => {
            const filesObj = subject.subjectFiles || {};
            const keysWithFiles = Object.keys(filesObj).filter(k => filesObj[k] instanceof File);

            if (keysWithFiles.length > 0) {
                // If files specific per level are present, split the subject into multiple rows for Django
                let splitCount = 0;
                subject.levels.forEach((levelId: string) => {
                    const fileForLevel = filesObj[levelId];
                    // IMPORTANT: Each split subject keeps ONLY its relevant plannings
                    const relevantPlannings = (subject.plannings || []).filter((p: any) =>
                        p.levels && (p.levels.includes(levelId) || p.levels.length === 0)
                    ).map((p: any) => ({ ...p })); // Clone the plannings to avoid references

                    const splitSubject = {
                        ...subject,
                        levels: [levelId],
                        plannings: relevantPlannings
                    };
                    delete splitSubject.subjectFiles;

                    // Nullify the ID for cloned rows to prevent Django from overwriting the single original ID 3 times
                    if (splitCount > 0) {
                        splitSubject.id = null;
                        splitSubject.plannings.forEach((p: any) => p.id = null);
                    }
                    splitCount++;

                    processedSubjects.push(splitSubject);

                    if (fileForLevel instanceof File) {
                        filesToUpload.push({ subjectIndex: finalSubjectIndex, file: fileForLevel });
                    }
                    finalSubjectIndex++;
                });
            } else {
                // No files, keep original layout
                delete subject.subjectFiles;
                processedSubjects.push(subject);
                finalSubjectIndex++;
            }
        });

        data.subjects = processedSubjects;

        let hasFiles = false;
        const formData = new FormData();

        Object.keys(data).forEach(key => {
            const payloadData = data as any;
            const value = payloadData[key];
            if (value !== null && value !== undefined) {
                if (typeof value === 'object' && !(value instanceof Date)) {
                    formData.append(key, JSON.stringify(value));
                } else {
                    formData.append(key, value as string | Blob);
                }
            }
        });

        filesToUpload.forEach(item => {
            formData.append(`subject_file_${item.subjectIndex}`, item.file);
            hasFiles = true;
        });

        const payload = hasFiles ? formData : data;

        return this.service.save(payload).pipe(
            switchMap((res: any) => {
                return of(res);
            })
        );
    }

    private appendNestedToFormData(formData: FormData, data: any, prefix = '') {
        Object.keys(data).forEach(key => {
            const name = prefix ? `${prefix}[${key}]` : key;
            const value = data[key];

            if (value instanceof File) {
                formData.append(name, value);
            } else if (Array.isArray(value)) {
                value.forEach((val, index) => {
                    if (typeof val === 'object' && !(val instanceof File)) {
                        this.appendNestedToFormData(formData, val, `${name}[${index}]`);
                    } else {
                        formData.append(`${name}[]`, val);
                    }
                });
            } else if (typeof value === 'object' && value !== null) {
                this.appendNestedToFormData(formData, value, name);
            } else if (value !== null && value !== undefined) {
                formData.append(name, value);
            }
        });
    }

    onAddSubjectFile(subjectIndex: number) {
        const subjectGroup = this.subjects.at(subjectIndex);
        const levels = subjectGroup.get('levels')?.value as string[];

        if (!levels || levels.length === 0) {
            this.toast.warning('Veuillez sélectionner au moins un niveau pour cette matière avant d\'ajouter un sujet.');
            return;
        }

        if (levels.length > 1) {
            // Open confirmation modal for multiple levels
            this.currentSubjectFileIndex.set(subjectIndex);
            this.isSubjectFileModalOpen.set(true);
        } else {
            // Only 1 level, trigger file input directly
            this.triggerFileInput(subjectIndex);
        }
    }

    triggerFileInput(subjectIndex: number, levelId: string = '') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf, .jpg, .jpeg, .png, .doc, .docx, .xls, .xlsx, .csv';
        input.onchange = (event: any) => {
            if (event.target.files && event.target.files.length > 0) {
                this.onFileSelected(event, subjectIndex, levelId);
                this.cdr.detectChanges();
            }
        };
        input.click();
    }

    closeSubjectFileModal() {
        this.isSubjectFileModalOpen.set(false);
        this.currentSubjectFileIndex.set(null);
    }

    onFileSelected(event: any, subjectIndex: number, levelId: string = '') {
        const file = event.target.files[0];
        if (file) {
            const subjectGroup = this.subjects.at(subjectIndex);
            const currentFiles = subjectGroup.get('subjectFiles')?.value || {};

            // If it's a single file trigger (levelId is empty initially), we map it to the first level in the array
            const targetLevel = levelId || (subjectGroup.get('levels')?.value as string[])[0] || 'default';

            subjectGroup.patchValue({ subjectFiles: { ...currentFiles, [targetLevel]: file } });
        }
    }

    // Checks if the subject group has any files attached
    hasFilesAttached(subjectIndex: number): boolean {
        const filesObj = this.subjects.at(subjectIndex)?.get('subjectFiles')?.value;
        if (!filesObj) return false;
        return Object.values(filesObj).some(val => val !== null && val !== undefined);
    }

    getAttachedFileNames(subjectIndex: number): string[] {
        const filesObj = this.subjects.at(subjectIndex)?.get('subjectFiles')?.value;
        if (!filesObj) return [];

        return Object.entries(filesObj)
            .filter(([_, val]) => val !== null && val !== undefined)
            .map(([levelId, val]: [string, any]) => {
                const fileName = val instanceof File ? val.name : (typeof val === 'string' ? val.split('/').pop() : 'Fichier existant');
                if (levelId === 'default' || Object.keys(filesObj).length === 1) {
                    return fileName;
                }
                const levelName = this.getLevelName(levelId);
                return `${levelName}: ${fileName}`;
            }) as string[];
    }

    getFilenameForLevel(subjectIndex: number, levelId: string): string | null {
        const filesObj = this.subjects.at(subjectIndex)?.get('subjectFiles')?.value;
        if (!filesObj || !filesObj[levelId]) return null;

        const val = filesObj[levelId];
        return val instanceof File ? val.name : (typeof val === 'string' ? val.split('/').pop() || val : 'Fichier existant');
    }

    getLevelsForSubject(subjectIndex: number): { id: string, name: string }[] {
        const group = this.subjects.at(subjectIndex);
        if (!group) return [];
        const levels = group.get('levels')?.value as string[] || [];

        return levels.map(lId => {
            const match = this.allLevelsCache.find(l => l.id === lId);
            return { id: lId, name: match?.shortName || match?.code || match?.name || lId };
        });
    }

    getClassroomsForSubject(subjectIndex: number): any[] {
        const group = this.subjects.at(subjectIndex);
        if (!group) return [];
        const selectedLevels = group.get('levels')?.value as string[] || [];
        return this.allClassroomsCache.filter(c => selectedLevels.includes(c.level?.id));
    }

    getClassroomsForPlanning(subjectIndex: number, planningIndex: number): any[] {
        // As requested: classrooms act as rooms, so we show all classrooms of the establishment
        return this.allClassroomsCache;
    }

    getSubjectName(id: string) {
        if (!id) return 'Nouvelle Matière';
        const match = this.allSubjectsCache.find(i => i.id === id);
        return match?.name || 'Matière inconnue';
    }

    getLevelName(id: string) {
        const match = this.allLevelsCache.find(i => i.id === id);
        return match?.name || match?.shortName || 'Niveau inconnu';
    }

    // --- SUPERVISION HELPERS ---

    getUniqueDatesFromPlanning(): string[] {
        const dates = new Set<string>();
        this.subjects.controls.forEach(sGroup => {
            const plannings = sGroup.get('plannings') as FormArray;
            plannings.controls.forEach(pGroup => {
                const d = pGroup.get('date')?.value;
                if (d) dates.add(d);
            });
        });
        return Array.from(dates).sort();
    }

    getClassesNeedingSupervisionForDate(date: string): any[] {
        const classroomsIds = new Set<string>();
        this.subjects.controls.forEach(sGroup => {
            const plannings = sGroup.get('plannings') as FormArray;
            plannings.controls.forEach(pGroup => {
                if (pGroup.get('date')?.value === date) {
                    const cls = pGroup.get('classrooms_ids')?.value as string[] || [];
                    cls.forEach(id => classroomsIds.add(id));
                }
            });
        });

        return this.allClassroomsCache.filter(c => classroomsIds.has(c.id));
    }

    getSupervisionControl(date: string, classroomId: string): FormGroup | null {
        return this.supervisions.controls.find(c =>
            c.get('date')?.value === date && c.get('classroom')?.value === classroomId
        ) as FormGroup || null;
    }

    ensureSupervisionExists(date: string, classroomId: string) {
        if (!this.getSupervisionControl(date, classroomId)) {
            this.addSupervision(date, classroomId);
        }
    }

    getSupervisorsForDisplay(date: string, classroomId: string): string {
        const ctrl = this.getSupervisionControl(date, classroomId);
        if (!ctrl) return 'Aucun';
        const ids = ctrl.get('supervisors')?.value as string[] || [];
        if (ids.length === 0) return 'Aucun';

        // This is a bit heavy for a template call, but okay for a small form
        // In a real app we'd use a pipe or a pre-calculated map
        return `${ids.length} surveillant(s)`;
    }
}
