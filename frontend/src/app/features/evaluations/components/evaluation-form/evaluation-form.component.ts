import { Component, inject, Input, OnChanges, SimpleChanges, signal, ChangeDetectorRef } from '@angular/core';
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
import { UiSelectComponent } from '@shared/components/ui-select/ui-select.component';
import { UiMultiSelectComponent } from '@shared/components/ui-multi-select/ui-multi-select.component';
import { UiToggleComponent } from '@shared/components/ui-toggle/ui-toggle.component';
import { UiTabsComponent, Tab } from '@shared/components/ui-tabs/ui-tabs.component';
import { UiMediaInputComponent } from '@shared/components/ui-media-input/ui-media-input.component';
import { UiFormHeaderComponent } from '@shared/components/ui-form-header/ui-form-header.component';
import { UiFormActionsComponent } from '@shared/components/ui-form-actions/ui-form-actions.component';
import { UiFormErrorsComponent } from '@shared/components/ui-form-errors/ui-form-errors.component';
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
        UiSelectComponent,
        UiMultiSelectComponent,
        UiToggleComponent,
        UiTabsComponent,
        UiMediaInputComponent,
        UiFormHeaderComponent,
        UiFormActionsComponent,
        UiFormErrorsComponent
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
    @Input() isClone: boolean = false;

    get formTitle(): string {
        if (this.isReadOnly) return 'Détails de la Session d\'Évaluation';
        if (this.isClone) return 'Cloner la Session d\'Évaluation';
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
    rooms$ = (this.roomService.list() as Observable<any[]>).pipe(
        tap(items => this.allRoomsCache = items),
        shareReplay(1)
    );
    classrooms$ = (this.classroomService.list() as Observable<any[]>).pipe(
        map(items => items.map(c => ({
            ...c,
            cycleName: c.level?.cycle?.name || 'Autre'
        }))),
        shareReplay(1), 
        tap(classes => this.allClassroomsCache = classes)
    );

    // Cached lookups for synchronous template access
    allLevelsCache: any[] = [];
    allClassroomsCache: any[] = [];
    allRoomsCache: any[] = [];
    allSubjectsCache: any[] = [];

    override ngOnInit() {
        super.ngOnInit();
        // Trigger subscriptions to populate caches
        this.levels$.pipe(take(1)).subscribe();
        this.classrooms$.pipe(take(1)).subscribe();
        this.rooms$.pipe(take(1)).subscribe();
        this.subjectsSource$.pipe(take(1)).subscribe();
    }

    supervisors$ = (this.personnelService.list() as Observable<any[]>).pipe(
        map((items: any[]) => items.map((p: any) => ({
            id: p.id,
            fullName: p.user ? `${p.user.firstName || ''} ${p.user.lastName || ''}`.trim() : p.jobTitle
        })))
    );

    tabs: Tab[] = [
        { 
            id: 'general', 
            label: '1. Session',
            icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>`
        },
        { 
            id: 'subjects', 
            label: '2. Épreuves',
            icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>`
        },
        { 
            id: 'planning', 
            label: '3. Planification',
            icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`
        },
        { 
            id: 'supervision', 
            label: '4. Surveillance',
            icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>`
        }
    ];
    activeTabId = signal<string>('general');

    // Modal state for Subject File Upload
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
            classrooms: [[] as string[], [Validators.required]],
            max_score: [20.0, [Validators.required, Validators.min(1)]],
            subjectFiles: [{}] as any, 
            plannings: this.fb.array([])
        });

        this.addPlanningToSubject(subjectGroup as FormGroup);
        this.subjects.push(subjectGroup);
    }

    addPlanningToSubject(subjectGroup: FormGroup) {
        const plannings = subjectGroup.get('plannings') as FormArray;
        const currentClassrooms = subjectGroup.get('classrooms')?.value || [];
        const planningGroup = this.fb.group({
            id: [null as string | null],
            date: ['', [Validators.required]],
            start_time: ['', [Validators.required]],
            duration_minutes: [null as number | null, [Validators.required]],
            classrooms_ids: [currentClassrooms, [Validators.required]],
            rooms_ids: [[] as string[], [Validators.required]]
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

    addSupervision(date: string = '', roomId: string = '') {
        const supervisionGroup = this.fb.group({
            id: [null as string | null],
            date: [date, [Validators.required]],
            room: [roomId, [Validators.required]],
            supervisors: [[] as string[]] // Supervisors made optional for V1 saving
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
            this.addSubject();
        }
    }

    private patchForm(item: EvaluationSessionFieldsFragment) {
        this.form.patchValue({
            id: this.isClone ? null : item.id,
            title: this.isClone ? `${item.title} (Copie)` : item.title,
            scope: item.scope,
            academic_period: item.academicPeriod?.id || '',
            evaluation_type: item.evaluationType?.id || '',
        });

        this.subjects.clear();
        const groupedSubjects = new Map<string, any>();

        (item as any).subjects?.forEach((s: any) => {
            const subjectId = s.subject?.id;
            if (!subjectId) return;

            if (!groupedSubjects.has(subjectId)) {
                groupedSubjects.set(subjectId, {
                    id: this.isClone ? null : s.id,
                    subject: subjectId,
                    classrooms: [],
                    max_score: s.maxScore,
                    subjectFiles: {},
                    plannings: []
                });
            }

            const group = groupedSubjects.get(subjectId);

            s.classrooms?.forEach((c: any) => {
                if (!group.classrooms.includes(c.id)) {
                    group.classrooms.push(c.id);
                }
                if (s.subjectFile && !this.isClone) {
                    group.subjectFiles[c.id] = s.subjectFile;
                }
            });

            group.plannings.push(...(s.plannings || []));
        });

        Array.from(groupedSubjects.values()).forEach((sGroup: any) => {
            const deduplicatedPlannings = new Map<string, any>();

            sGroup.plannings.forEach((p: any) => {
                const classroomsSig = (p.classrooms?.map((c: any) => c.id) || []).sort().join('-');
                const roomsSig = (p.rooms?.map((r: any) => r.id) || []).sort().join('-');
                const startTimePrefix = p.startTime ? p.startTime.substring(0, 5) : '';
                const signature = `${p.date}_${startTimePrefix}_${p.durationMinutes}_${classroomsSig}_${roomsSig}`;

                const pClassroomIds = p.classrooms?.map((c: any) => c.id) || [];

                if (!deduplicatedPlannings.has(signature)) {
                    deduplicatedPlannings.set(signature, {
                        ...p,
                        mappedClassrooms: [...pClassroomIds]
                    });
                } else {
                    const existingP = deduplicatedPlannings.get(signature);
                    pClassroomIds.forEach((cid: string) => {
                        if (!existingP.mappedClassrooms.includes(cid)) {
                            existingP.mappedClassrooms.push(cid);
                        }
                    });
                }
            });

            const finalPlannings = Array.from(deduplicatedPlannings.values());

            const subjectGroup = this.fb.group({
                id: [this.isClone ? null : sGroup.id],
                subject: [sGroup.subject, [Validators.required]],
                classrooms: [sGroup.classrooms, [Validators.required]],
                max_score: [sGroup.max_score],
                subjectFiles: Object.keys(sGroup.subjectFiles).length > 0 ? [sGroup.subjectFiles] : [{}],
                plannings: this.fb.array(
                    finalPlannings.map((p: any) => this.fb.group({
                        id: [this.isClone ? null : (p.id || null)],
                        date: [p.date || '', [Validators.required]],
                        start_time: [p.startTime ? p.startTime.substring(0, 5) : '', [Validators.required]],
                        duration_minutes: [p.durationMinutes || null, [Validators.required]],
                        classrooms_ids: [p.classrooms?.map((c: any) => c.id) || [], [Validators.required]],
                        rooms_ids: [p.rooms?.map((r: any) => r.id) || [], [Validators.required]]
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
                id: [this.isClone ? null : sup.id],
                date: [sup.date, [Validators.required]],
                room: [sup.room?.id, [Validators.required]],
                supervisors: [this.isClone ? [] : (sup.supervisors?.map((s: any) => s.id) || [])]
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

        const processedSubjects: any[] = [];
        let finalSubjectIndex = 0;

        data.subjects.forEach((subject: any) => {
            const filesObj = subject.subjectFiles || {};
            const keysWithFiles = Object.keys(filesObj).filter(k => filesObj[k] instanceof File);

            if (keysWithFiles.length > 0) {
                let splitCount = 0;
                subject.classrooms.forEach((classroomId: string) => {
                    const fileForClassroom = filesObj[classroomId];
                    const relevantPlannings = (subject.plannings || []).filter((p: any) =>
                        p.classrooms_ids && (p.classrooms_ids.includes(classroomId) || p.classrooms_ids.length === 0)
                    ).map((p: any) => ({ ...p }));

                    const splitSubject = {
                        ...subject,
                        classrooms: [classroomId],
                        plannings: relevantPlannings
                    };
                    delete splitSubject.subjectFiles;

                    if (splitCount > 0) {
                        splitSubject.id = null;
                        splitSubject.plannings.forEach((p: any) => p.id = null);
                    }
                    splitCount++;

                    processedSubjects.push(splitSubject);

                    if (fileForClassroom instanceof File) {
                        filesToUpload.push({ subjectIndex: finalSubjectIndex, file: fileForClassroom });
                    }
                    finalSubjectIndex++;
                });
            } else {
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

    onAddSubjectFile(subjectIndex: number) {
        const subjectGroup = this.subjects.at(subjectIndex);
        const classrooms = subjectGroup.get('classrooms')?.value as string[];

        if (!classrooms || classrooms.length === 0) {
            this.toast.warning('Veuillez sélectionner au moins une classe pour cette matière avant d\'ajouter un sujet.');
            return;
        }

        if (classrooms.length > 1) {
            this.currentSubjectFileIndex.set(subjectIndex);
            this.isSubjectFileModalOpen.set(true);
        } else {
            this.triggerFileInput(subjectIndex);
        }
    }

    triggerFileInput(subjectIndex: number, classroomId: string = '') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf, .jpg, .jpeg, .png, .doc, .docx, .xls, .xlsx, .csv';
        input.onchange = (event: any) => {
            if (event.target.files && event.target.files.length > 0) {
                this.onFileSelected(event, subjectIndex, classroomId);
                this.cdr.detectChanges();
            }
        };
        input.click();
    }

    closeSubjectFileModal() {
        this.isSubjectFileModalOpen.set(false);
        this.currentSubjectFileIndex.set(null);
    }

    onFileSelected(event: any, subjectIndex: number, classroomId: string = '') {
        const file = event.target.files[0];
        if (file) {
            const subjectGroup = this.subjects.at(subjectIndex);
            const currentFiles = subjectGroup.get('subjectFiles')?.value || {};
            const targetClassroom = classroomId || (subjectGroup.get('classrooms')?.value as string[])[0] || 'default';

            subjectGroup.patchValue({ subjectFiles: { ...currentFiles, [targetClassroom]: file } });
        }
    }

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
            .map(([classroomId, val]: [string, any]) => {
                const fileName = val instanceof File ? val.name : (typeof val === 'string' ? val.split('/').pop() : 'Fichier existant');
                if (classroomId === 'default' || Object.keys(filesObj).length === 1) {
                    return fileName;
                }
                const classroomName = this.getClassroomName(classroomId);
                return `${classroomName}: ${fileName}`;
            }) as string[];
    }

    getFilenameForClassroom(subjectIndex: number, classroomId: string): string | null {
        const filesObj = this.subjects.at(subjectIndex)?.get('subjectFiles')?.value;
        if (!filesObj || !filesObj[classroomId]) return null;

        const val = filesObj[classroomId];
        return val instanceof File ? val.name : (typeof val === 'string' ? val.split('/').pop() || val : 'Fichier existant');
    }

    getClassroomsForSubject(subjectIndex: number, currentPlanningIndex: number = -1): any[] {
        const group = this.subjects.at(subjectIndex);
        if (!group) return [];
        const selectedIds = group.get('classrooms')?.value as string[] || [];
        
        let classrooms = this.allClassroomsCache.filter(c => selectedIds.includes(c.id));

        if (currentPlanningIndex !== -1) {
            const plannings = group.get('plannings') as FormArray;
            const alreadyPlannedIds = new Set<string>();
            plannings.controls.forEach((p, idx) => {
                if (idx !== currentPlanningIndex) {
                    const ids = p.get('classrooms_ids')?.value as string[] || [];
                    ids.forEach(id => alreadyPlannedIds.add(id));
                }
            });
            classrooms = classrooms.filter(c => !alreadyPlannedIds.has(c.id));
        }

        return classrooms;
    }

    getClassroomName(id: string) {
        const match = this.allClassroomsCache.find(i => i.id === id);
        return match?.name || 'Classe inconnue';
    }

    getSubjectName(id: string) {
        if (!id) return 'Nouvelle Matière';
        const match = this.allSubjectsCache.find(i => i.id === id);
        return match?.name || 'Matière inconnue';
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

    getRoomsNeedingSupervisionForDate(date: string): any[] {
        const roomsIds = new Set<string>();
        this.subjects.controls.forEach(sGroup => {
            const plannings = sGroup.get('plannings') as FormArray;
            plannings.controls.forEach(pGroup => {
                if (pGroup.get('date')?.value === date) {
                    const rms = pGroup.get('rooms_ids')?.value as string[] || [];
                    rms.forEach(id => roomsIds.add(id));
                }
            });
        });

        return this.allRoomsCache.filter(r => roomsIds.has(r.id));
    }

    getSupervisionControl(date: string, roomId: string): FormGroup | null {
        return this.supervisions.controls.find(c =>
            c.get('date')?.value === date && c.get('room')?.value === roomId
        ) as FormGroup || null;
    }

    ensureSupervisionExists(date: string, roomId: string) {
        if (!this.getSupervisionControl(date, roomId)) {
            this.addSupervision(date, roomId);
        }
    }

    getSupervisorsForDisplay(date: string, roomId: string): string {
        const ctrl = this.getSupervisionControl(date, roomId);
        if (!ctrl) return 'Aucun';
        const ids = ctrl.get('supervisors')?.value as string[] || [];
        if (ids.length === 0) return 'Aucun';
        return `${ids.length} surveillant(s)`;
    }
}
