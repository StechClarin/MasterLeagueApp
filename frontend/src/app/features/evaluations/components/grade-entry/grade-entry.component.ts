import { Component, inject, OnInit, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormControl } from '@angular/forms';
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

                const control = this.fb.control<number | null>(grade?.value ?? null);
                const absentControl = this.fb.nonNullable.control(grade?.isAbsent ?? false);

                // Listen for changes to update average
                control.valueChanges.subscribe(() => this.updateCalculations(student.id));
                absentControl.valueChanges.subscribe(() => this.updateCalculations(student.id));

                return {
                    evaluationSubjectId: subj.id,
                    gradeId: grade?.id,
                    value: control,
                    isAbsent: absentControl,
                    levelCoefficients: (subj as any).levelCoefficients || [],
                    maxScore: Number(subj.maxScore || 20),
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

    back() {
        this.router.navigate([AppRoutes.NOTES]);
    }

    // PDF GENERATION
    async printStudentBulletin(row: StudentGradeRow) {
        try {
            const [jsPDFModule, autoTableModule] = await Promise.all([
                import('jspdf'),
                import('jspdf-autotable')
            ]);
            const JsPDF = (jsPDFModule as any).default || jsPDFModule;
            const doc = new JsPDF();
            const autoTable = (autoTableModule as any).default || autoTableModule;

            this.generateSingleBulletin(doc, autoTable, row);
            doc.save(`bulletin_${row.matricule}_${row.lastName}.pdf`);
            this.toast.success(`Bulletin généré pour ${row.lastName}`);
        } catch (err) {
            console.error('PDF Error:', err);
            this.toast.error('Erreur lors de la génération du bulletin');
        }
    }

    async printAllBulletins() {
        const rows = this.filteredGradeRows();
        if (rows.length === 0) {
            this.toast.warning('Aucun étudiant à imprimer.');
            return;
        }

        try {
            const [jsPDFModule, autoTableModule] = await Promise.all([
                import('jspdf'),
                import('jspdf-autotable')
            ]);
            const JsPDF = (jsPDFModule as any).default || jsPDFModule;
            const doc = new JsPDF();
            const autoTable = (autoTableModule as any).default || autoTableModule;

            rows.forEach((row, index) => {
                if (index > 0) doc.addPage();
                this.generateSingleBulletin(doc, autoTable, row);
            });

            const className = this.availableClassrooms().find(c => c.id === this.selectedClassroomId())?.name || 'classe';
            doc.save(`bulletins_${className}.pdf`);
            this.toast.success(`Impression de ${rows.length} bulletins terminée.`);
        } catch (err) {
            console.error('PDF Error:', err);
            this.toast.error('Erreur lors de la génération groupée');
        }
    }

    private generateSingleBulletin(doc: any, autoTable: any, row: StudentGradeRow) {
        const session = this.session();
        const est = session?.establishment;
        const period = session?.academicPeriod;

        // Header
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(79, 70, 229); // Indigo 600
        doc.text(est?.name || 'Établissement Scolaire', 105, 20, { align: 'center' });

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.setFont('helvetica', 'normal');
        doc.text(session?.title || 'Bulletin de Notes', 105, 28, { align: 'center' });
        doc.text(`Année Académique: ${period?.academicYear?.name || 'N/A'} - ${period?.name || ''}`, 105, 34, { align: 'center' });

        // Student Info
        doc.setDrawColor(226, 232, 240);
        doc.line(20, 40, 190, 40);

        doc.setFontSize(12);
        doc.setTextColor(30);
        doc.setFont('helvetica', 'bold');
        doc.text(`${row.lastName} ${row.firstName}`, 20, 50);
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`Matricule: ${row.matricule}`, 20, 56);
        
        const className = this.availableClassrooms().find(c => c.id === row.classroomId)?.name || 'N/A';
        doc.text(`Classe: ${className}`, 20, 62);

        // Grades Table
        const headers = [['Matière', 'Note', 'Max', 'Coef', 'Pondérée', 'Appréciation']];
        const body = row.grades.map(g => {
            const subj = this.subjects().find(s => s.id === g.evaluationSubjectId);
            const coeff = this.getDynamicCoefficient(subj);
            const val = g.isAbsent.value ? 'ABS' : (g.value.value ?? '--');
            const weighted = !g.isAbsent.value && g.value.value !== null ? (g.value.value * coeff).toFixed(2) : '--';
            
            return [
                subj?.subject?.name || 'N/A',
                val,
                g.maxScore,
                coeff,
                weighted,
                this.getAppreciation(g.value.value ?? 0)
            ];
        });

        const tableConfig = {
            startY: 70,
            head: headers,
            body: body,
            theme: 'grid',
            headStyles: { fillColor: [79, 70, 229], halign: 'center' },
            styles: { fontSize: 9, cellPadding: 3 },
            columnStyles: {
                0: { cellWidth: 60 },
                1: { halign: 'center' },
                2: { halign: 'center' },
                3: { halign: 'center' },
                4: { halign: 'center' },
                5: { halign: 'center' }
            }
        };

        if (typeof (doc as any).autoTable === 'function') {
            (doc as any).autoTable(tableConfig);
        } else {
            autoTable(doc, tableConfig);
        }

        // Summary
        const finalY = (doc as any).lastAutoTable?.finalY || 150;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        if (row.average >= 10) {
            doc.setTextColor(5, 150, 105); // Emerald 600
        } else {
            doc.setTextColor(220, 38, 38); // Red 600
        }
        doc.text(`MOYENNE: ${row.average.toFixed(2)} / 20`, 190, finalY + 10, { align: 'right' });

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Appréciation Globale: ${row.appreciation}`, 190, finalY + 17, { align: 'right' });

        // Signature area
        doc.setFontSize(9);
        doc.setTextColor(150);
        doc.text('Le Chef d\'Établissement', 150, finalY + 40);
    }
}
