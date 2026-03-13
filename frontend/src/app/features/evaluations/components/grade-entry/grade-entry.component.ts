import { Component, inject, OnInit, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GradeService } from '../../services/grade.service';
import { GetEvaluationSessionGQL, GradeFieldsFragment, EvaluationSubjectFieldsFragment } from '../../graphql/evaluations.generated';
import { StudentService } from '../../../students/services/student.service';
import { UiInputComponent } from '@shared/components/ui-input/ui-input.component';
import { UiListPageComponent } from '@shared/components/ui-list-page/ui-list-page.component';
import { firstValueFrom } from 'rxjs';
import { ToastService } from '@core/services/toast.service';
import { AppRoutes } from '@core/routing/routes.enum';
import { ClassRoomService } from '../../../structure/services/classroom.service';

interface SubjectGradeEntry {
    evaluationSubjectId: string;
    gradeId?: string;
    value: FormControl<number | null>;
    isAbsent: FormControl<boolean>;
    levelCoefficients: { levelId: number, coefficient: number }[];
    maxScore: number;
    comment: string;
}

interface StudentGradeRow {
    studentId: string;
    matricule: string;
    firstName: string;
    lastName: string;
    classroomId: string;
    levelId: string;
    grades: SubjectGradeEntry[];
    average: number;
    appreciation: string;
}

export type ClassStats = {
    min: number;
    max: number;
    avg: number;
};

@Component({
    selector: 'app-grade-entry',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        UiInputComponent,
        UiListPageComponent
    ],
    templateUrl: './grade-entry.component.html'
})
export class GradeEntryComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private fb = inject(FormBuilder);
    private gradeService = inject(GradeService);
    private getSessionGQL = inject(GetEvaluationSessionGQL);
    private studentService = inject(StudentService);
    private classroomService = inject(ClassRoomService);
    private toast = inject(ToastService);

    evaluationId = signal<string | null>(null);
    session = signal<any>(null);
    subjects = signal<EvaluationSubjectFieldsFragment[]>([]);
    isLoading = signal(false);
    isSaving = signal(false);

    gradeRows = signal<StudentGradeRow[]>([]);
    periodGrades = signal<GradeFieldsFragment[]>([]); // For bulletin aggregation
    searchQuery = signal<string>('');
    selectedClassroomId = signal<string | null>(null);

    // Metadata map for Classroom -> Level
    classroomToLevelMap = signal<Map<string, string>>(new Map());

    // NEW: All classrooms belonging to the levels involved in this session
    availableClassrooms = computed<any[]>(() => {
        const mapping = this.classroomToLevelMap();
        // We might want to list them alphabetically or by level
        const classrooms: any[] = [];
        mapping.forEach((levelId, classroomId) => {
            // We need names here, so we might need a separate signal for classroom details
            // For now, let's assume we have them in a state
        });
        return this._availClassrooms();
    });

    private _availClassrooms = signal<any[]>([]);

    visibleSubjects = computed<EvaluationSubjectFieldsFragment[]>(() => {
        const allSubjects = this.subjects();
        const classroomId = this.selectedClassroomId();

        // Show all subjects of the session as headers by default
        if (!classroomId) return allSubjects;

        const levelId = this.classroomToLevelMap().get(classroomId);
        if (!levelId) return allSubjects;

        // Filter subjects that target this level (Onglet 2)
        return allSubjects.filter(s =>
            s.levels?.some((l: any) => l.id === levelId)
        );
    });

    filteredGradeRows = computed(() => {
        const query = this.searchQuery().toLowerCase().trim();
        const classroomId = this.selectedClassroomId();

        // CRITICAL: Don't list students until a classroom is selected
        if (!classroomId) return [];

        let rows = this.gradeRows();
        rows = rows.filter(r => r.classroomId === classroomId);

        if (query) {
            rows = rows.filter(row =>
                row.lastName.toLowerCase().includes(query) ||
                row.firstName.toLowerCase().includes(query) ||
                row.matricule.toLowerCase().includes(query)
            );
        }

        return rows;
    });

    isEmpty = computed(() => this.filteredGradeRows().length === 0);

    // DASHBOARD STATS
    stats = computed(() => {
        const rows = this.gradeRows();
        const total = rows.length;
        if (total === 0) return { total: 0, graded: 0, rate: 0, average: 0 };

        const graded = rows.filter(r =>
            r.average > 0 || r.grades.some(g => g.isAbsent.value)
        ).length;

        const rate = Math.round((graded / total) * 100);

        const averagesWithGrades = rows.filter(r => r.average > 0).map(r => r.average);
        const globalAverage = averagesWithGrades.length > 0
            ? averagesWithGrades.reduce((a, b) => a + b, 0) / averagesWithGrades.length
            : 0;

        return { total, graded, rate, average: globalAverage };
    });

    async ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.evaluationId.set(id);
            await this.loadData(id);
        }
    }

    async loadData(evalId: string) {
        this.isLoading.set(true);
        try {
            // 1. Get Session Details (including subjects)
            const sessionRes = await firstValueFrom(this.getSessionGQL.fetch({ id: evalId }, { fetchPolicy: 'network-only' }));
            const sessionData = sessionRes.data.evaluationSession;
            if (!sessionData) throw new Error('Session non trouvée');

            this.session.set(sessionData);
            this.subjects.set(sessionData.subjects || []);

            // 2. Fetch all classrooms for ALL levels involved in session subjects (Onglet 2)
            const levelIds = new Set<string>();
            sessionData.subjects?.forEach((s: any) => {
                s.levels?.forEach((l: any) => levelIds.add(l.id));
            });

            const classroomMetadata: { id: string, levelId: string }[] = [];
            const mapping = new Map<string, string>();
            const allClassrooms: any[] = [];

            // Parallel fetch for each level's classrooms
            await Promise.all(Array.from(levelIds).map(async (lid) => {
                try {
                    const res = await firstValueFrom(this.classroomService.listByLevel(lid));
                    res.forEach((c: any) => {
                        if (!mapping.has(c.id)) {
                            mapping.set(c.id, lid);
                            classroomMetadata.push({ id: c.id, levelId: lid });
                            allClassrooms.push(c);
                        }
                    });
                } catch (err) {
                    console.error(`Failed to load classrooms for level ${lid}`, err);
                }
            }));

            this.classroomToLevelMap.set(mapping);
            this._availClassrooms.set(allClassrooms);

            // 3. Fetch Students & Existing Grades
            const [students, existingGrades] = await Promise.all([
                this.loadStudents(classroomMetadata),
                firstValueFrom(this.gradeService.list(parseInt(evalId)))
            ]);

            this.buildGrid(students, existingGrades as any[]);
        } catch (e) {
            console.error('Error loading grade entry data', e);
            this.toast.error('Erreur lors du chargement des données.');
        } finally {
            this.isLoading.set(false);
        }
    }

    async loadStudents(classroomMetadata: { id: string, levelId: string }[]) {
        if (classroomMetadata.length === 0) return [];

        const studentPromises = classroomMetadata.map(async meta => {
            try {
                const list = await firstValueFrom(this.studentService.list(meta.id));
                return list.map((s: any) => ({
                    ...s,
                    classroomId: meta.id,
                    levelId: meta.levelId
                }));
            } catch (e) {
                console.error(`Failed to load students for classroom ${meta.id}`, e);
                return [];
            }
        });

        const studentArrays = await Promise.all(studentPromises);
        const allStudents = studentArrays.flat();

        // Unique by ID (keep classroom info)
        const uniqueStudents = Array.from(new Map(allStudents.map((s: any) => [s.id, s])).values());

        return uniqueStudents;
    }

    buildGrid(students: any[], existingGrades: GradeFieldsFragment[]) {
        const subjects = this.subjects();

        const rows: StudentGradeRow[] = students.map(student => {
            const studentGrades: SubjectGradeEntry[] = subjects.map(subj => {
                const grade = existingGrades.find(g =>
                    String(g.student.id) === String(student.id) &&
                    String(g.evaluationSubject?.id) === String(subj.id)
                );

                const maxVal = Math.min(Number(subj.maxScore || 20), 20);
                const control = this.fb.control<number | null>(grade?.value ?? null, [
                    Validators.min(0),
                    Validators.max(maxVal)
                ]);
                const absentControl = this.fb.nonNullable.control(grade?.isAbsent ?? false);

                // Listen for changes to update average and clamp values
                control.valueChanges.subscribe(val => {
                    if (val !== null && val > maxVal) {
                        control.setValue(maxVal, { emitEvent: false });
                    }
                    this.updateCalculations(student.id);
                });
                absentControl.valueChanges.subscribe(() => this.updateCalculations(student.id));

                return {
                    evaluationSubjectId: subj.id,
                    gradeId: grade?.id,
                    value: control,
                    isAbsent: absentControl,
                    levelCoefficients: (subj as any).levelCoefficients || [],
                    maxScore: maxVal,
                    comment: grade?.comment || ''
                };
            });

            return {
                studentId: student.id,
                matricule: student.matricule || 'N/A',
                firstName: student.firstName,
                lastName: student.lastName,
                classroomId: student.classroomId,
                levelId: student.levelId,
                grades: studentGrades,
                average: 0,
                appreciation: ''
            };
        });

        this.gradeRows.set(rows);
        // Initial calc
        rows.forEach(r => this.updateCalculations(r.studentId));
    }

    updateCalculations(studentId: string) {
        const rows = this.gradeRows();
        const row = rows.find(r => r.studentId === studentId);
        if (!row) return;

        let totalPoints = 0;
        let totalCoeff = 0;
        const studentLevelId = row.levelId;

        row.grades.forEach(g => {
            // Find coefficient for the level this student belongs to
            let coeff = 1;
            if (studentLevelId) {
                const lc = g.levelCoefficients.find(c => c.levelId.toString() === studentLevelId);
                coeff = lc ? Number(lc.coefficient) : 1;
            } else {
                // Fallback to first available coefficient or 1
                coeff = g.levelCoefficients.length > 0 ? Number(g.levelCoefficients[0].coefficient) : 1;
            }

            if (!g.isAbsent.value && g.value.value !== null) {
                totalPoints += (g.value.value * coeff);
                totalCoeff += coeff;
            } else if (g.isAbsent.value) {
                totalCoeff += coeff;
            }
        });

        row.average = totalCoeff > 0 ? totalPoints / totalCoeff : 0;
        row.appreciation = this.getAppreciation(row.average);

        // Trigger signal update to refresh dashboard
        this.gradeRows.update(rows => [...rows]);
    }

    // Helper to get dynamic coefficient for a subject based on selected classroom's level
    getDynamicCoefficient(subject: any): number {
        const classroomId = this.selectedClassroomId();
        const lcs = subject.levelCoefficients || [];

        let levelId = '';
        if (classroomId) {
            levelId = this.classroomToLevelMap().get(classroomId) || '';
        }

        if (levelId) {
            const lc = lcs.find((c: any) => c.levelId.toString() === levelId);
            return lc ? Number(lc.coefficient) : 1;
        }

        return lcs.length > 0 ? Number(lcs[0].coefficient) : 1;
    }

    getAppreciation(avg: number): string {
        if (avg >= 18) return 'Excellent';
        if (avg >= 16) return 'Très Bien';
        if (avg >= 14) return 'Bien';
        if (avg >= 12) return 'Assez Bien';
        if (avg >= 10) return 'Passable';
        if (avg >= 8) return 'Insuffisant';
        return 'Médiocre';
    }

    async save() {
        if (!this.evaluationId()) return;

        this.isSaving.set(true);
        try {
            const payload: any[] = [];
            this.gradeRows().forEach(row => {
                row.grades.forEach(g => {
                    payload.push({
                        student: row.studentId,
                        evaluation_subject: g.evaluationSubjectId,
                        value: g.value.value,
                        is_absent: g.isAbsent.value,
                        comment: g.comment // Ensure comments are also saved
                    });
                });
            });

            await firstValueFrom(this.gradeService.bulkSave(this.evaluationId()!, payload));
            this.toast.success('Toutes les notes ont été enregistrées avec succès.');
        } catch (e) {
            console.error('Error saving grades', e);
            this.toast.error('Erreur lors de la sauvegarde des notes.');
        } finally {
            this.isSaving.set(false);
        }
    }

    @HostListener('keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(event.key)) return;

        const activeElement = document.activeElement as HTMLInputElement;
        if (!activeElement || activeElement.tagName !== 'INPUT') return;

        const row = activeElement.getAttribute('data-row');
        const col = activeElement.getAttribute('data-col');
        if (row === null || col === null) return;

        let nextRow = parseInt(row);
        let nextCol = parseInt(col);

        switch (event.key) {
            case 'ArrowUp': nextRow--; break;
            case 'ArrowDown': nextRow++; break;
            case 'ArrowLeft': nextCol--; break;
            case 'ArrowRight': nextCol++; break;
            case 'Enter': nextRow++; break;
        }

        const nextInput = document.querySelector(`input[data-row="${nextRow}"][data-col="${nextCol}"]`) as HTMLInputElement;
        if (nextInput) {
            event.preventDefault();
            nextInput.focus();
            nextInput.select();
        }
    }

    getGradeForSubject(row: StudentGradeRow, subjectId: string) {
        return row.grades.find(g => g.evaluationSubjectId === subjectId);
    }

    backToSessions() {
        this.router.navigate([AppRoutes.NOTES_AND_BULLETINS]);
    }

    // PDF GENERATION
    async printStudentBulletin(row: StudentGradeRow) {
        this.isLoading.set(true);
        try {
            await this.fetchAllPeriodGrades();
            const classStats = this.calculateClassStats();
            
            const [jsPDFModule, autoTableModule] = await Promise.all([
                import('jspdf'),
                import('jspdf-autotable')
            ]);
            const JsPDF = (jsPDFModule as any).default || jsPDFModule;
            const doc = new JsPDF();
            const autoTable = (autoTableModule as any).default || autoTableModule;

            const periodName = this.session()?.academicPeriod?.name || 'periode';
            this.generateSingleBulletin(doc, autoTable, row, classStats);
            doc.save(`bulletin_${row.matricule}_${periodName}.pdf`);
            this.toast.success(`Bulletin généré pour ${row.lastName}`);
        } catch (err) {
            console.error('PDF Error:', err);
            this.toast.error('Erreur lors de la génération du bulletin');
        } finally {
            this.isLoading.set(false);
        }
    }

    async printAllBulletins() {
        const rows = this.filteredGradeRows();
        if (rows.length === 0) {
            this.toast.warning('Aucun étudiant à imprimer.');
            return;
        }

        this.isLoading.set(true);
        try {
            await this.fetchAllPeriodGrades();
            const classStats = this.calculateClassStats();

            const [jsPDFModule, autoTableModule] = await Promise.all([
                import('jspdf'),
                import('jspdf-autotable')
            ]);
            const JsPDF = (jsPDFModule as any).default || jsPDFModule;
            const doc = new JsPDF();
            const autoTable = (autoTableModule as any).default || autoTableModule;

            rows.forEach((row, index) => {
                if (index > 0) doc.addPage();
                this.generateSingleBulletin(doc, autoTable, row, classStats);
            });

            const className = this.availableClassrooms().find(c => c.id === this.selectedClassroomId())?.name || 'classe';
            const periodName = this.session()?.academicPeriod?.name || 'periode';
            doc.save(`bulletins_${className}_${periodName}.pdf`);
            this.toast.success(`Impression de ${rows.length} bulletins terminée.`);
        } catch (err) {
            console.error('PDF Error:', err);
            this.toast.error('Erreur lors de la génération groupée');
        } finally {
            this.isLoading.set(false);
        }
    }

    private calculateClassStats(): ClassStats {
        const allGrades = this.periodGrades();
        if (!allGrades || allGrades.length === 0) return { min: 0, max: 0, avg: 0 };

        const studentGroups = new Map<string, GradeFieldsFragment[]>();
        allGrades.forEach(g => {
            const sid = String(g.student.id);
            if (!studentGroups.has(sid)) studentGroups.set(sid, []);
            studentGroups.get(sid)!.push(g);
        });

        const averages: number[] = [];
        for (const [sid, grades] of studentGroups.entries()) {
            const studentAvg = this.calculateStudentAverageFromGrades(grades);
            if (studentAvg !== null) averages.push(studentAvg);
        }

        if (averages.length === 0) return { min: 0, max: 0, avg: 0 };

        return {
            min: Math.min(...averages),
            max: Math.max(...averages),
            avg: averages.reduce((a, b) => a + b, 0) / averages.length
        };
    }

    private calculateStudentAverageFromGrades(grades: GradeFieldsFragment[]): number | null {
        const subjectGroups = new Map<string, GradeFieldsFragment[]>();
        grades.forEach(g => {
            const name = g.evaluationSubject?.subject?.name || 'Subject';
            if (!subjectGroups.has(name)) subjectGroups.set(name, []);
            subjectGroups.get(name)!.push(g);
        });

        let totalWeightedPoints = 0;
        let totalCoeff = 0;

        for (const [subjectName, subjGrades] of subjectGroups.entries()) {
            const ccGrades = subjGrades.filter(g => g.evaluationSubject?.session?.evaluationType?.code === 'CC');
            const ccGradesWithValue = ccGrades.filter(g => g.value !== null && g.value !== undefined);
            const ccAvg = ccGradesWithValue.length > 0 ? ccGradesWithValue.reduce((a, b) => a + Number(b.value), 0) / ccGradesWithValue.length : null;
            const ccWeight = ccGrades.length > 0 ? Number(ccGrades[0].evaluationSubject?.session?.evaluationType?.weight || 1) : 1;

            const examGrade = subjGrades.find(g => g.evaluationSubject?.session?.evaluationType?.code === 'EXAM');
            const examVal = (examGrade?.value !== null && examGrade?.value !== undefined) ? Number(examGrade.value) : null;
            const examWeight = examGrade ? Number(examGrade.evaluationSubject?.session?.evaluationType?.weight || 2) : 2;

            const currentSubj = this.subjects().find(s => s.subject?.name === subjectName);
            const coeff = this.getDynamicCoefficient(currentSubj);

            let subjectWeightedTotal = 0;
            let divisor = 0;
            if (ccAvg !== null) { subjectWeightedTotal += ccAvg * ccWeight; divisor += ccWeight; }
            if (examVal !== null) { subjectWeightedTotal += examVal * examWeight; divisor += examWeight; }
            
            const finalSubjAvg = divisor > 0 ? subjectWeightedTotal / divisor : 0;
            totalWeightedPoints += finalSubjAvg * coeff;
            totalCoeff += coeff;
        }

        return totalCoeff > 0 ? totalWeightedPoints / totalCoeff : null;
    }

    private async fetchAllPeriodGrades() {
        const session = this.session();
        const classroomId = this.selectedClassroomId();
        if (!session || !classroomId) return;

        try {
            const periodId = parseInt(session.academicPeriod.id);
            const grades = await firstValueFrom(this.gradeService.listByPeriodAndClass(periodId, parseInt(classroomId)));
            this.periodGrades.set(grades as GradeFieldsFragment[]);
        } catch (err) {
            console.error('Failed to fetch period grades', err);
        }
    }

    private generateSingleBulletin(doc: any, autoTable: any, row: StudentGradeRow, classStats?: ClassStats) {
        const session = this.session();
        const est = session?.establishment;
        const period = session?.academicPeriod;

        // --- COLORS & TOKENS ---
        const slate800 = [30, 41, 59];
        const slate500 = [100, 116, 139];
        const indigo600 = [79, 70, 229];
        const bgGray = [248, 250, 252];
        const white = [255, 255, 255];

        // --- 1. DECORATIVE HEADER BAR ---
        doc.setFillColor(...slate800);
        doc.rect(0, 0, 210, 15, 'F');
        doc.setFillColor(...indigo600);
        doc.rect(0, 15, 210, 2, 'F');

        // --- 2. SCHOOL BRANDING ---
        // Logo Placeholder
        doc.setDrawColor(...indigo600);
        doc.setLineWidth(1);
        doc.rect(20, 25, 22, 22); 
        doc.setFontSize(8);
        doc.setTextColor(...indigo600);
        doc.text('LOGO', 31, 38, { align: 'center' });

        // School Name
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.setTextColor(...slate800);
        doc.text(est?.name?.toUpperCase() || 'IEA - INTERNATIONAL SCHOOL', 48, 34);
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(...slate500);
        doc.text('Excellence in Education - Future-Ready Leaders', 48, 40);

        // Contact Info (Right)
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(...slate500);
        const contactX = 190;
        doc.text(`T: (+237) 677 00 00 00`, contactX, 28, { align: 'right' });
        doc.text(`E: contact@${est?.name?.toLowerCase().replace(/\s/g, '-') || 'school'}.edu`, contactX, 33, { align: 'right' });
        doc.text(`W: www.${est?.name?.toLowerCase().replace(/\s/g, '-') || 'school'}.edu`, contactX, 38, { align: 'right' });
        doc.text(`A: BP 1234, North Campus, Yaoundé`, contactX, 43, { align: 'right' });

        // --- 3. STUDENT PROFILE CARD ---
        const cardY = 55;
        doc.setFillColor(...bgGray);
        doc.roundedRect(20, cardY, 170, 40, 2, 2, 'F');
        
        // Left Side: Student Main Info
        doc.setFontSize(8);
        doc.setTextColor(...slate500);
        doc.setFont('helvetica', 'bold');
        doc.text('STUDENT / ELEVE', 28, cardY + 10);
        
        doc.setFontSize(14);
        doc.setTextColor(...slate800);
        doc.text(`${row.lastName.toUpperCase()} ${row.firstName}`, 28, cardY + 18);
        
        doc.setFontSize(9);
        doc.setTextColor(...slate500);
        doc.setFont('helvetica', 'normal');
        doc.text(`Matricule: ${row.matricule}`, 28, cardY + 26);
        const className = this.availableClassrooms().find(c => c.id === row.classroomId)?.name || 'N/A';
        doc.text(`Classe: ${className}`, 28, cardY + 33);

        // Right Side: Period Info
        doc.setFontSize(8);
        doc.setTextColor(...slate500);
        doc.setFont('helvetica', 'bold');
        doc.text('ACADEMIC PERIOD', 182, cardY + 10, { align: 'right' });
        
        doc.setFontSize(11);
        doc.setTextColor(...indigo600);
        doc.text(period?.name?.toUpperCase() || 'TERM 1', 182, cardY + 18, { align: 'right' });
        
        doc.setFontSize(9);
        doc.setTextColor(...slate500);
        doc.setFont('helvetica', 'normal');
        doc.text(`${period?.academicYear?.name || '2025-2026'}`, 182, cardY + 26, { align: 'right' });
        doc.text(`Report date: ${new Date().toLocaleDateString()}`, 182, cardY + 33, { align: 'right' });

        // --- 4. GRADES TABLE ---
        const headers = [['SUBJECT / MATIÈRE', 'CC (AVG)', 'EXAM', 'SCORE /20', 'COEF', 'WEIGHTED', 'REMARK']];
        const studentIdToMatch = String(row.studentId);
        const allGrades = this.periodGrades().filter(g => String(g.student.id) === studentIdToMatch);
        
        const subjectGroups = new Map<string, GradeFieldsFragment[]>();
        allGrades.forEach(g => {
            const name = g.evaluationSubject?.subject?.name || 'Subject';
            if (!subjectGroups.has(name)) subjectGroups.set(name, []);
            subjectGroups.get(name)!.push(g);
        });

        const body = [];
        let totalPeriodPoints = 0;
        let totalPeriodCoeff = 0;

        for (const [subjectName, grades] of subjectGroups.entries()) {
            const ccGrades = grades.filter(g => g.evaluationSubject?.session?.evaluationType?.code === 'CC');
            const ccGradesWithValue = ccGrades.filter(g => g.value !== null && g.value !== undefined);
            const ccAvg = ccGradesWithValue.length > 0 ? ccGradesWithValue.reduce((a, b) => a + Number(b.value), 0) / ccGradesWithValue.length : null;
            const ccWeight = ccGrades.length > 0 ? Number(ccGrades[0].evaluationSubject?.session?.evaluationType?.weight || 1) : 1;

            const examGrade = grades.find(g => g.evaluationSubject?.session?.evaluationType?.code === 'EXAM');
            const examVal = (examGrade?.value !== null && examGrade?.value !== undefined) ? Number(examGrade.value) : null;
            const examWeight = examGrade ? Number(examGrade.evaluationSubject?.session?.evaluationType?.weight || 2) : 2;

            const currentSubj = this.subjects().find(s => s.subject?.name === subjectName);
            const coeff = this.getDynamicCoefficient(currentSubj);

            let subjectWeightedTotal = 0;
            let divisor = 0;
            if (ccAvg !== null) { subjectWeightedTotal += ccAvg * ccWeight; divisor += ccWeight; }
            if (examVal !== null) { subjectWeightedTotal += examVal * examWeight; divisor += examWeight; }
            
            const finalSubjAvg = divisor > 0 ? subjectWeightedTotal / divisor : 0;
            const finalWeighted = finalSubjAvg * coeff;

            totalPeriodPoints += finalWeighted;
            totalPeriodCoeff += coeff;

            body.push([
                subjectName.toUpperCase(),
                ccAvg !== null ? Number(ccAvg).toFixed(2) : '--',
                examVal !== null ? Number(examVal).toFixed(2) : '--',
                finalSubjAvg.toFixed(2),
                coeff,
                finalWeighted.toFixed(2),
                this.getAppreciation(finalSubjAvg)
            ]);
        }

        const rowAvg = totalPeriodCoeff > 0 ? totalPeriodPoints / totalPeriodCoeff : 0;

        autoTable(doc, {
            startY: 105,
            head: headers,
            body: body,
            theme: 'grid',
            headStyles: { 
                fillColor: slate800, 
                halign: 'center', 
                fontSize: 8, 
                fontStyle: 'bold',
                textColor: white,
                cellPadding: 4
            },
            bodyStyles: { 
                fontSize: 8, 
                cellPadding: 3, 
                textColor: slate800,
                lineColor: [230, 230, 230] 
            },
            alternateRowStyles: { fillColor: [252, 252, 255] },
            columnStyles: {
                0: { cellWidth: 55, fontStyle: 'bold' },
                1: { halign: 'center' },
                2: { halign: 'center' },
                3: { halign: 'center', fontStyle: 'bold', fillColor: [250, 250, 252] },
                4: { halign: 'center' },
                5: { halign: 'center', fontStyle: 'bold' },
                6: { halign: 'center', cellWidth: 35, fontSize: 7 }
            }
        });

        // --- 5. PERFORMANCE SUMMARY DASHBOARD ---
        const finalY = (doc as any).lastAutoTable?.finalY + 10;
        
        // Student Result Main Box
        doc.setFillColor(...bgGray);
        doc.roundedRect(130, finalY, 60, 30, 2, 2, 'F');
        doc.setDrawColor(...slate800);
        doc.setLineWidth(0.5);
        doc.line(135, finalY + 12, 185, finalY + 12);

        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...slate500);
        doc.text('STUDENT AVERAGE', 142, finalY + 8);

        doc.setFontSize(18);
        const avgColor = rowAvg >= 10 ? [5, 150, 105] : [220, 38, 38];
        doc.setTextColor(...avgColor);
        doc.text(`${rowAvg.toFixed(2)}`, 160, finalY + 24, { align: 'center' });
        doc.setFontSize(10);
        doc.text('/ 20', 178, finalY + 24);

        // Class Statistics Panel
        if (classStats) {
            const statsX = 20;
            doc.setFillColor(255, 255, 255);
            doc.rect(statsX, finalY, 100, 30);
            
            doc.setFontSize(8);
            doc.setTextColor(...slate500);
            doc.setFont('helvetica', 'bold');
            doc.text('CLASS PERFORMANCE', statsX + 5, finalY + 8);
            doc.setDrawColor(240, 240, 240);
            doc.line(statsX + 5, finalY + 12, statsX + 95, finalY + 12);

            // Labels
            doc.setFontSize(7);
            doc.text('MAXIMUM', statsX + 15, finalY + 18, { align: 'center' });
            doc.text('MINIMUM', statsX + 45, finalY + 18, { align: 'center' });
            doc.text('CLASS AVG', statsX + 80, finalY + 18, { align: 'center' });

            // Values
            doc.setFontSize(10);
            doc.setTextColor(...slate800);
            doc.text(`${classStats.max.toFixed(2)}`, statsX + 15, finalY + 26, { align: 'center' });
            doc.text(`${classStats.min.toFixed(2)}`, statsX + 45, finalY + 26, { align: 'center' });
            doc.setTextColor(...indigo600);
            doc.text(`${classStats.avg.toFixed(2)}`, statsX + 80, finalY + 26, { align: 'center' });
        }

        // --- 6. APPRECIATION & SIGNATURES ---
        const signY = finalY + 45;
        
        doc.setFontSize(9);
        doc.setTextColor(...slate500);
        doc.setFont('helvetica', 'italic');
        doc.text(`General Remarks: ${this.getAppreciation(rowAvg)}`, 20, signY);

        // Signature Sections
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...slate800);
        
        // Director
        doc.text('SCHOOL DIRECTOR / DIRECTION', 150, signY + 10);
        doc.setDrawColor(...slate500);
        doc.setLineWidth(0.2);
        doc.line(140, signY + 30, 190, signY + 30);

        // Parent
        doc.text('PARENT / GUARDIAN SIGNATURE', 30, signY + 10);
        doc.line(20, signY + 30, 80, signY + 30);

        // --- 7. FOOTER WATERMARK ---
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(180);
        doc.text(`Powering Educational Excellence with GigaCore OS`, 105, 285, { align: 'center' });
        doc.text(`${est?.name || 'School System'} | Unique ID: ${row.matricule}-${period?.id}-${row.studentId}`, 105, 289, { align: 'center' });

        // Subtle Branding Watermark
        doc.setFontSize(60);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(250, 250, 250); 
        doc.text('CONFIDENTIAL', 105, 170, { align: 'center', angle: 45 });
    }
}
