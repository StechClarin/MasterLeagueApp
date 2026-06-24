import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { GradeService } from './grade.service';
import { ToastService } from '@core/services/toast.service';
import { GradeFieldsFragment, EvaluationSubjectFieldsFragment } from '../graphql/evaluations.generated';
import { EnrollmentService } from '../../students/services/enrollment.service';

export interface StudentGradeRow {
    studentId: string;
    matricule: string;
    firstName: string;
    lastName: string;
    classroomId: string;
    levelId: string;
    grades: any[];
    average: number;
    appreciation: string;
}

export type ClassStats = {
    min: number;
    max: number;
    avg: number;
};

const getPrintLoadingHtml = (title: string) => `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-100/80 m-0 font-sans">
   <div class="flex flex-col items-center justify-center min-h-screen gap-3 p-4 text-center">
      <div class="p-4 bg-indigo-50 text-indigo-600 rounded-full animate-bounce">
         <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0v-2.94a2.25 2.25 0 012.25-2.25h6a2.25 2.25 0 012.25 2.25v2.94zM21 11.25v.15" />
         </svg>
      </div>
      <h2 class="text-xl font-bold text-slate-800">${title}</h2>
      <p class="text-sm text-slate-500 max-w-xs">La boîte de dialogue s'ouvre automatiquement. Le document s'affichera juste après.</p>
   </div>
</body>
</html>
`;

@Injectable({
  providedIn: 'root'
})
export class BulletinPdfService {
  private gradeService = inject(GradeService);
  private enrollmentService = inject(EnrollmentService);
  private toast = inject(ToastService);

  async printStudentBulletin(
    row: StudentGradeRow,
    allRows: StudentGradeRow[],
    session: any,
    subjects: EvaluationSubjectFieldsFragment[],
    classroomId: string,
    classroomToLevelMap: Map<string, string>,
    availableClassrooms: any[]
  ) {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(getPrintLoadingHtml('Préparation du bulletin...'));
    }

    try {
      this.toast.show("Préparation de l'impression... Veuillez patienter.", 'info');
      await new Promise(resolve => setTimeout(resolve, 800));

      const [establishmentGrades, enrollments] = await Promise.all([
          this.fetchAllEstablishmentGrades(session.academicPeriod.id),
          this.fetchAllEnrollments(session.academicPeriod.academicYear.id)
      ]);
      
      // Combine live UI grades for ALL students to ensure correct class averages and statistics
      const combinedGrades = this.getCombinedGrades(establishmentGrades, allRows, subjects, session, classroomId, classroomToLevelMap, enrollments);
      const averagesMap = this.calculateAllStudentAverages(combinedGrades, subjects, classroomToLevelMap, session.academicPeriod.academicYear.id);
      
      const targetEnrollment = enrollments.find(e => String(e.student?.id) === String(row.studentId));
      const targetCycleId = targetEnrollment?.classroom?.level?.cycle?.id || '';
      const targetCycleName = targetEnrollment?.classroom?.level?.cycle?.name || 'Cycle';

      const currentStudentAvg = averagesMap.get(row.studentId)?.average;

      // Class ranking & denominator (total enrolled in this class)
      const classAverages = Array.from(averagesMap.values())
          .filter(item => item.classroomId === classroomId)
          .map(item => item.average)
          .sort((a, b) => b - a);
      const classRank = currentStudentAvg !== undefined ? classAverages.indexOf(currentStudentAvg) + 1 : null;
      const classEnrolledCount = enrollments.filter(e => String(e.classroom?.id) === classroomId).length;

      // Cycle ranking & denominator (total enrolled in this cycle)
      const cycleAverages = Array.from(averagesMap.values())
          .filter(item => item.cycleId === targetCycleId)
          .map(item => item.average)
          .sort((a, b) => b - a);
      const cycleRank = currentStudentAvg !== undefined ? cycleAverages.indexOf(currentStudentAvg) + 1 : null;
      const cycleEnrolledCount = enrollments.filter(e => String(e.classroom?.level?.cycle?.id) === String(targetCycleId)).length;

      // Establishment ranking & denominator (total enrolled in the establishment)
      const estAverages = Array.from(averagesMap.values())
          .map(item => item.average)
          .sort((a, b) => b - a);
      const estRank = currentStudentAvg !== undefined ? estAverages.indexOf(currentStudentAvg) + 1 : null;
      const estEnrolledCount = enrollments.length;

      const classStats = {
          min: classAverages.length > 0 ? Math.min(...classAverages) : 0,
          max: classAverages.length > 0 ? Math.max(...classAverages) : 0,
          avg: classAverages.length > 0 ? classAverages.reduce((a, b) => a + b, 0) / classAverages.length : 0
      };

      // Filter combinedGrades to only keep target student's grades for table display
      const studentGrades = combinedGrades.filter(g => String(g.student?.id) === String(row.studentId));

      let hasCredits = false;
      for (const g of studentGrades) {
         const currentSubj = subjects.find(s => s.subject?.name === g.evaluationSubject?.subject?.name);
         const subjInfo = this.getDynamicSubjectInfo(currentSubj, classroomId, classroomToLevelMap);
         if (subjInfo.credits && subjInfo.credits > 0) {
             hasCredits = true;
             break;
         }
      }

      let logoBase64: string | null = null;
      const est = session?.establishment;
      if (est?.logo) {
        try {
          logoBase64 = await this.loadImage(est.logo);
        } catch (err) {
          console.warn('Failed to load logo image, falling back to default shield', err);
        }
      }

      const [jsPDFModule, autoTableModule] = await Promise.all([
          import('jspdf'),
          import('jspdf-autotable')
      ]);
      const JsPDF = (jsPDFModule as any).default || jsPDFModule;
      const autoTable = (autoTableModule as any).default || autoTableModule;

      const doc = new JsPDF('p', 'mm', 'a4');
      
      if (hasCredits) {
          this.generateUniversityBulletin(
              doc, autoTable, row, session, subjects, classroomId, classroomToLevelMap, availableClassrooms, studentGrades, logoBase64
          );
      } else {
          this.generateSingleBulletin(
            doc,
            autoTable,
            row,
            session,
            subjects,
            classroomId,
            classroomToLevelMap,
            availableClassrooms,
            studentGrades,
            logoBase64,
            classRank,
            classEnrolledCount,
            cycleRank,
            cycleEnrolledCount,
            estRank,
            estEnrolledCount,
            classStats
          );
      }
      
      doc.autoPrint();
      const blobUrl = doc.output('bloburl');
      
      if (printWindow) {
        printWindow.location.href = blobUrl;
      } else {
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.width = '1px';
        iframe.style.height = '1px';
        iframe.style.left = '-9999px';
        iframe.src = blobUrl;
        document.body.appendChild(iframe);
      }
      
      this.toast.success(`Bulletin prêt pour ${row.lastName}`);
    } catch (err) {
      console.error('PDF Error:', err);
      if (printWindow) printWindow.close();
      this.toast.error('Erreur lors de la génération du bulletin');
    }
  }

  async printAllBulletins(
    rows: StudentGradeRow[],
    session: any,
    subjects: EvaluationSubjectFieldsFragment[],
    classroomId: string,
    classroomToLevelMap: Map<string, string>,
    availableClassrooms: any[]
  ) {
    if (rows.length === 0) {
      this.toast.warning('Aucun étudiant à imprimer.');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(getPrintLoadingHtml('Préparation des bulletins...'));
    }

    try {
      this.toast.show("Préparation de l'impression... Veuillez patienter.", 'info');
      await new Promise(resolve => setTimeout(resolve, 800));

      const [establishmentGrades, enrollments] = await Promise.all([
          this.fetchAllEstablishmentGrades(session.academicPeriod.id),
          this.fetchAllEnrollments(session.academicPeriod.academicYear.id)
      ]);
      
      // Combine live UI grades for ALL students to compute accurate class stats
      const combinedGrades = this.getCombinedGrades(establishmentGrades, rows, subjects, session, classroomId, classroomToLevelMap, enrollments);
      const averagesMap = this.calculateAllStudentAverages(combinedGrades, subjects, classroomToLevelMap, session.academicPeriod.academicYear.id);

      let logoBase64: string | null = null;
      const est = session?.establishment;
      if (est?.logo) {
        try {
          logoBase64 = await this.loadImage(est.logo);
        } catch (err) {
          console.warn('Failed to load logo image, falling back to default shield', err);
        }
      }

      const [jsPDFModule, autoTableModule] = await Promise.all([
          import('jspdf'),
          import('jspdf-autotable')
      ]);
      const JsPDF = (jsPDFModule as any).default || jsPDFModule;
      const autoTable = (autoTableModule as any).default || autoTableModule;

      const doc = new JsPDF('p', 'mm', 'a4');

      rows.forEach((row, index) => {
          if (index > 0) doc.addPage();
          
          const targetEnrollment = enrollments.find(e => String(e.student?.id) === String(row.studentId));
          const targetCycleId = targetEnrollment?.classroom?.level?.cycle?.id || '';
          const targetCycleName = targetEnrollment?.classroom?.level?.cycle?.name || 'Cycle';

          const currentStudentAvg = averagesMap.get(row.studentId)?.average;

          // Class ranking & denominator (total enrolled in this class)
          const classAverages = Array.from(averagesMap.values())
              .filter(item => item.classroomId === classroomId)
              .map(item => item.average)
              .sort((a, b) => b - a);
          const classRank = currentStudentAvg !== undefined ? classAverages.indexOf(currentStudentAvg) + 1 : null;
          const classEnrolledCount = enrollments.filter(e => String(e.classroom?.id) === classroomId).length;

          // Cycle ranking & denominator (total enrolled in this cycle)
          const cycleAverages = Array.from(averagesMap.values())
              .filter(item => item.cycleId === targetCycleId)
              .map(item => item.average)
              .sort((a, b) => b - a);
          const cycleRank = currentStudentAvg !== undefined ? cycleAverages.indexOf(currentStudentAvg) + 1 : null;
          const cycleEnrolledCount = enrollments.filter(e => String(e.classroom?.level?.cycle?.id) === String(targetCycleId)).length;

          // Establishment ranking & denominator (total enrolled in the establishment)
          const estAverages = Array.from(averagesMap.values())
              .map(item => item.average)
              .sort((a, b) => b - a);
          const estRank = currentStudentAvg !== undefined ? estAverages.indexOf(currentStudentAvg) + 1 : null;
          const estEnrolledCount = enrollments.length;

          const classStats = {
              min: classAverages.length > 0 ? Math.min(...classAverages) : 0,
              max: classAverages.length > 0 ? Math.max(...classAverages) : 0,
              avg: classAverages.length > 0 ? classAverages.reduce((a, b) => a + b, 0) / classAverages.length : 0
          };

          // Filter combinedGrades to only keep target student's grades for table display
          const studentGrades = combinedGrades.filter(g => String(g.student?.id) === String(row.studentId));

          let hasCredits = false;
          for (const g of studentGrades) {
             const currentSubj = subjects.find(s => s.subject?.name === g.evaluationSubject?.subject?.name);
             const subjInfo = this.getDynamicSubjectInfo(currentSubj, classroomId, classroomToLevelMap);
             if (subjInfo.credits && subjInfo.credits > 0) {
                 hasCredits = true;
                 break;
             }
          }

          if (hasCredits) {
              this.generateUniversityBulletin(
                  doc, autoTable, row, session, subjects, classroomId, classroomToLevelMap, availableClassrooms, studentGrades, logoBase64
              );
          } else {
              this.generateSingleBulletin(
                doc,
                autoTable,
                row,
                session,
                subjects,
                classroomId,
                classroomToLevelMap,
                availableClassrooms,
                studentGrades,
                logoBase64,
                classRank,
                classEnrolledCount,
                cycleRank,
                cycleEnrolledCount,
                estRank,
                estEnrolledCount,
                classStats
              );
          }
      });

      doc.autoPrint();
      const blobUrl = doc.output('bloburl');
      
      if (printWindow) {
        printWindow.location.href = blobUrl;
      } else {
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.width = '1px';
        iframe.style.height = '1px';
        iframe.style.left = '-9999px';
        iframe.src = blobUrl;
        document.body.appendChild(iframe);
      }
      
      this.toast.success(`Impression de ${rows.length} bulletins prête.`);
    } catch (err) {
      console.error('PDF Error:', err);
      if (printWindow) printWindow.close();
      this.toast.error('Erreur lors de la génération groupée');
    }
  }

  async printClassRanking(
    rows: StudentGradeRow[],
    session: any,
    classroomId: string,
    availableClassrooms: any[]
  ) {
    if (rows.length === 0) {
      this.toast.warning('Aucun étudiant à imprimer.');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(getPrintLoadingHtml('Préparation du palmarès...'));
    }

    try {
      this.toast.show("Préparation du palmarès... Veuillez patienter.", 'info');
      await new Promise(resolve => setTimeout(resolve, 800));

      const sortedRows = [...rows].sort((a, b) => b.average - a.average);

      let logoBase64: string | null = null;
      const est = session?.establishment;
      if (est?.logo) {
        try {
          logoBase64 = await this.loadImage(est.logo);
        } catch (err) {}
      }

      const [jsPDFModule, autoTableModule] = await Promise.all([
          import('jspdf'),
          import('jspdf-autotable')
      ]);
      const JsPDF = (jsPDFModule as any).default || jsPDFModule;
      const autoTable = (autoTableModule as any).default || autoTableModule;

      const doc = new JsPDF('p', 'mm', 'a4');
      const period = session?.academicPeriod;
      const className = availableClassrooms.find(c => c.id === classroomId)?.name || 'Classe';

      const primaryDark = [15, 23, 42];      // Slate 900
      const primaryTeal = [15, 118, 110];    // Teal 700
      const secondaryTeal = [13, 148, 136];  // Teal 600
      const textDark = [51, 65, 85];         // Slate 700
      const textLight = [100, 116, 139];     // Slate 500
      const borderGray = [226, 232, 240];    // Slate 200

      doc.setDrawColor(...borderGray);
      doc.setLineWidth(0.2);
      doc.rect(8, 8, 194, 281);

      const logoX = 16;
      const logoY = 16;
      if (logoBase64) {
          try { doc.addImage(logoBase64, 'PNG', logoX, logoY, 20, 20); } catch (err) { this.drawDefaultShield(doc, logoX, logoY, primaryDark, secondaryTeal); }
      } else {
          this.drawDefaultShield(doc, logoX, logoY, primaryDark, secondaryTeal);
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(...primaryDark);
      doc.text(est?.name?.toUpperCase() || 'ÉTABLISSEMENT SCOLAIRE', 42, 23);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(...primaryTeal);
      doc.text(est?.slogan || 'Excellence - Discipline - Succès', 42, 28.5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(...primaryDark);
      doc.text('PROCLAMATION DES RÉSULTATS / PALMARÈS', 105, 45, { align: 'center' });

      doc.setFontSize(9);
      doc.setTextColor(...primaryTeal);
      doc.text(`Classe : ${className}  |  Période : ${period?.name}`, 105, 52, { align: 'center' });

      doc.setDrawColor(...primaryTeal);
      doc.setLineWidth(0.8);
      doc.line(16, 56, 194, 56);

      const headers = [['RANG', 'MATRICULE', 'NOM & PRÉNOM', 'MOYENNE /20', 'APPRÉCIATION']];
      const body = sortedRows.map((r, index) => {
          return [
              `${index + 1}${index === 0 ? 'er' : 'e'}`,
              r.matricule,
              `${r.lastName.toUpperCase()} ${r.firstName}`,
              r.average.toFixed(2),
              this.getAppreciation(r.average)
          ];
      });

      autoTable(doc, {
          startY: 62,
          margin: { left: 16, right: 16 },
          head: headers,
          body: body,
          theme: 'grid',
          headStyles: { 
              fillColor: primaryDark, 
              halign: 'center', 
              fontSize: 8, 
              fontStyle: 'bold',
              textColor: [255, 255, 255]
          },
          bodyStyles: { 
              fontSize: 8, 
              cellPadding: 3, 
              textColor: textDark,
              lineColor: borderGray
          },
          alternateRowStyles: { fillColor: [248, 250, 252] },
          columnStyles: {
              0: { halign: 'center', cellWidth: 15, fontStyle: 'bold' },
              1: { halign: 'center', cellWidth: 30 },
              2: { cellWidth: 75 },
              3: { halign: 'center', cellWidth: 25, fontStyle: 'bold' },
              4: { halign: 'center', cellWidth: 35 }
          }
      });

      doc.setFontSize(6);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...textLight);
      doc.text(`Document généré par le Système d'Information • Imprimé le : ${new Date().toLocaleString('fr-FR')}`, 105, 285, { align: 'center' });

      doc.autoPrint();
      const blobUrl = doc.output('bloburl');
      
      if (printWindow) {
        printWindow.location.href = blobUrl;
      } else {
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.width = '1px';
        iframe.style.height = '1px';
        iframe.style.left = '-9999px';
        iframe.src = blobUrl;
        document.body.appendChild(iframe);
      }
      
      this.toast.success(`Palmarès prêt pour l'impression.`);
    } catch (err) {
      console.error('PDF Error:', err);
      if (printWindow) printWindow.close();
      this.toast.error('Erreur lors de la génération du palmarès');
    }
  }

  private async fetchAllEstablishmentGrades(periodId: string): Promise<GradeFieldsFragment[]> {
    try {
      const grades = await firstValueFrom(this.gradeService.listByPeriod(periodId));
      return (grades as GradeFieldsFragment[]) || [];
    } catch (err) {
      console.error('Failed to fetch establishment grades', err);
      return [];
    }
  }

  private async fetchAllEnrollments(academicYearId: string): Promise<any[]> {
    try {
      const enrolls = await firstValueFrom(this.enrollmentService.list({ academicYearId, pageSize: 10000 }));
      return enrolls || [];
    } catch (err) {
      console.error('Failed to fetch enrollments', err);
      return [];
    }
  }

  private getCombinedGrades(
    periodGrades: GradeFieldsFragment[],
    rows: StudentGradeRow[],
    subjects: EvaluationSubjectFieldsFragment[],
    session: any,
    classroomId: string,
    classroomToLevelMap: Map<string, string>,
    allEnrollments: any[]
  ): GradeFieldsFragment[] {
    const currentSessionSubjectIds = new Set(subjects.map(s => String(s.id)));
    // 1. Keep grades from other sessions in the period
    const otherPeriodGrades = periodGrades.filter(g => !g.evaluationSubject || !currentSessionSubjectIds.has(String(g.evaluationSubject.id)));
    
    // 2. Build live grades from all UI rows
    const liveGrades: any[] = [];
    rows.forEach(row => {
        const studentEnrollment = allEnrollments.find(e => String(e.student?.id) === String(row.studentId));

        row.grades.forEach(entry => {
            const subj = subjects.find(s => String(s.id) === String(entry.evaluationSubjectId));
            const val = (entry.value && typeof entry.value === 'object' && 'value' in entry.value) ? entry.value.value : entry.value;
            const absent = (entry.isAbsent && typeof entry.isAbsent === 'object' && 'value' in entry.isAbsent) ? entry.isAbsent.value : !!entry.isAbsent;
            
            liveGrades.push({
                id: entry.gradeId || 'temp',
                value: val,
                comment: entry.comment || '',
                isAbsent: absent,
                student: {
                    id: row.studentId,
                    matricule: row.matricule,
                    firstName: row.firstName,
                    lastName: row.lastName,
                    enrollments: studentEnrollment ? [
                      {
                        id: studentEnrollment.id,
                        classroom: {
                          id: studentEnrollment.classroom?.id,
                          name: studentEnrollment.classroom?.name,
                          level: {
                            id: studentEnrollment.classroom?.level?.id,
                            cycle: studentEnrollment.classroom?.level?.cycle ? {
                              id: studentEnrollment.classroom?.level?.cycle?.id,
                              name: studentEnrollment.classroom?.level?.cycle?.name
                            } : undefined
                          }
                        },
                        academicYear: {
                          id: studentEnrollment.academicYear?.id
                        }
                      }
                    ] : [
                      {
                        id: 'temp-enrollment',
                        classroom: {
                          id: classroomId,
                          name: '',
                          level: {
                            id: classroomToLevelMap.get(classroomId) || ''
                          }
                        },
                        academicYear: {
                          id: session.academicPeriod.academicYear.id
                        }
                      }
                    ]
                },
                evaluationSubject: {
                    id: entry.evaluationSubjectId,
                    subject: {
                        name: subj?.subject?.name || 'Matière'
                    },
                    levelCoefficients: subj?.levelCoefficients || [],
                    session: {
                        id: session.id,
                        evaluationType: {
                            code: session.evaluationType?.code,
                            weight: session.evaluationType?.weight
                        }
                    }
                }
            });
        });
    });

    return [...otherPeriodGrades, ...liveGrades];
  }

  private calculateStudentAverageFromGrades(
    grades: GradeFieldsFragment[],
    subjects: EvaluationSubjectFieldsFragment[],
    classroomId: string,
    classroomToLevelMap: Map<string, string>
  ): number | null {
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

        const currentSubj = subjects.find(s => s.subject?.name === subjectName);
        const subjInfo = this.getDynamicSubjectInfo(currentSubj, classroomId, classroomToLevelMap);
        const coeff = subjInfo.coeff;

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

  private generateSingleBulletin(
    doc: any,
    autoTable: any,
    row: StudentGradeRow,
    session: any,
    subjects: EvaluationSubjectFieldsFragment[],
    classroomId: string,
    classroomToLevelMap: Map<string, string>,
    availableClassrooms: any[],
    periodGrades: GradeFieldsFragment[],
    logoBase64: string | null,
    classRank: number | null,
    totalClassStudents: number,
    cycleRank: number | null,
    totalCycleStudents: number,
    estRank: number | null,
    totalEstStudents: number,
    classStats?: ClassStats
  ) {
    const est = session?.establishment;
    const period = session?.academicPeriod;

    // --- COLOR PALETTE (PRO & PREMIUM SLATE/TEAL) ---
    const primaryDark = [15, 23, 42];      // Slate 900
    const primaryTeal = [15, 118, 110];    // Teal 700
    const secondaryTeal = [13, 148, 136];  // Teal 600
    const textDark = [51, 65, 85];         // Slate 700
    const textLight = [100, 116, 139];     // Slate 500
    const borderGray = [226, 232, 240];    // Slate 200
    const bgLight = [248, 250, 252];       // Slate 50

    // --- PAGE BORDER & BACKGROUND ---
    doc.setDrawColor(...borderGray);
    doc.setLineWidth(0.2);
    doc.rect(8, 8, 194, 281); // Subtle frame

    // --- 1. HEADER BRANDING ---
    // Logo rendering (Dynamic or fallback shield)
    const logoX = 16;
    const logoY = 16;
    if (logoBase64) {
      try {
        doc.addImage(logoBase64, 'PNG', logoX, logoY, 20, 20);
      } catch (err) {
        console.warn('Error rendering base64 logo in PDF, drawing default shield', err);
        this.drawDefaultShield(doc, logoX, logoY, primaryDark, secondaryTeal);
      }
    } else {
      this.drawDefaultShield(doc, logoX, logoY, primaryDark, secondaryTeal);
    }

    // School Name & Motto
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...primaryDark);
    doc.text(est?.name?.toUpperCase() || 'ÉTABLISSEMENT SCOLAIRE', 42, 23);
    
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...primaryTeal);
    doc.text(est?.slogan || 'Excellence - Discipline - Succès', 42, 28.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textLight);
    doc.setFontSize(7);
    doc.text('Système d\'Information et de Suivi Académique Élite', 42, 34);

    // Contact Info (Right)
    doc.setFontSize(6.5);
    doc.setTextColor(...textLight);
    const contactX = 192;
    doc.text(est?.phone ? `Tél: ${est.phone}` : 'Tél: --', contactX, 21, { align: 'right' });
    doc.text(est?.email ? `Email: ${est.email}` : 'Email: --', contactX, 26, { align: 'right' });
    doc.text(est?.website ? `Web: ${est.website}` : 'Web: --', contactX, 31, { align: 'right' });
    doc.text(est?.address ? est.address : '--', contactX, 36, { align: 'right' });

    // Horizontal Divider
    doc.setDrawColor(...primaryTeal);
    doc.setLineWidth(0.8);
    doc.line(16, 43, 194, 43);

    // --- 2. REPORT CARD TITLE ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...primaryDark);
    doc.text('BULLETIN DE NOTES / REPORT CARD', 105, 52, { align: 'center' });

    // --- 3. STUDENT & PERIOD PROFILE CARD (Two Columns in neat box) ---
    const cardY = 58;
    doc.setFillColor(...bgLight);
    doc.setDrawColor(...borderGray);
    doc.setLineWidth(0.3);
    doc.roundedRect(16, cardY, 178, 32, 1.5, 1.5, 'FD');

    // Vertical separator inside card
    doc.line(105, cardY + 3, 105, cardY + 29);

    // Left Column: Student Details
    doc.setFontSize(6.5);
    doc.setTextColor(...textLight);
    doc.setFont('helvetica', 'bold');
    doc.text('ÉLÈVE / STUDENT', 22, cardY + 7);

    doc.setFontSize(9.5);
    doc.setTextColor(...primaryDark);
    doc.text(`${row.lastName.toUpperCase()} ${row.firstName}`, 22, cardY + 13);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textDark);
    doc.text(`Matricule :  ${row.matricule}`, 22, cardY + 20);
    const className = availableClassrooms.find(c => c.id === row.classroomId)?.name || 'N/A';
    doc.text(`Classe :        ${className}`, 22, cardY + 25);

    // Right Column: Academic Period Details
    doc.setFontSize(6.5);
    doc.setTextColor(...textLight);
    doc.setFont('helvetica', 'bold');
    doc.text('PÉRIODE ACADÉMIQUE / PERIOD', 111, cardY + 7);

    doc.setFontSize(9);
    doc.setTextColor(...primaryTeal);
    doc.text(period?.name?.toUpperCase() || 'TRIMESTRE', 111, cardY + 13);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textDark);
    doc.text(`Année Académique :  ${period?.academicYear?.name || '2025-2026'}`, 111, cardY + 20);
    doc.text(`Date d'édition :        ${new Date().toLocaleDateString('fr-FR')}`, 111, cardY + 25);

    // --- 4. GRADES TABLE ---
    const headers = [['MATIÈRE / SUBJECT', 'Moy CC / CC Avg', 'EXAM /20', 'MOY/20 / AVG', 'COEF', 'TOTAL MOYENNE', 'APPRÉCIATION / REMARK']];
    const studentIdToMatch = String(row.studentId);
    const studentGrades = periodGrades.filter(g => String(g.student.id) === studentIdToMatch);
    
    const subjectGroups = new Map<string, GradeFieldsFragment[]>();
    studentGrades.forEach(g => {
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

        const currentSubj = subjects.find(s => s.subject?.name === subjectName);
        const subjInfo = this.getDynamicSubjectInfo(currentSubj, classroomId, classroomToLevelMap);
        const coeff = subjInfo.coeff;

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
        startY: 96,
        margin: { left: 16, right: 16 },
        head: headers,
        body: body,
        theme: 'grid',
        headStyles: { 
            fillColor: primaryDark, 
            halign: 'center', 
            fontSize: 6.5, 
            fontStyle: 'bold',
            textColor: [255, 255, 255],
            cellPadding: 2.5
        },
        bodyStyles: { 
            fontSize: 7, 
            cellPadding: 2, 
            textColor: textDark,
            lineColor: borderGray
        },
        alternateRowStyles: { fillColor: [250, 252, 252] },
        columnStyles: {
            0: { cellWidth: 58, fontStyle: 'bold', textColor: primaryDark },
            1: { halign: 'center', cellWidth: 20 },
            2: { halign: 'center', cellWidth: 20 },
            3: { halign: 'center', cellWidth: 20, fontStyle: 'bold', fillColor: bgLight },
            4: { halign: 'center', cellWidth: 14 },
            5: { halign: 'center', cellWidth: 22, fontStyle: 'bold' },
            6: { halign: 'center', fontSize: 6.5 }
        }
    });

    // --- 5. PERFORMANCE SUMMARY DASHBOARD ---
    const finalY = (doc as any).lastAutoTable?.finalY + 8;
    
    // Left Box: Class Statistics Panel
    const statsX = 16;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...borderGray);
    doc.setLineWidth(0.3);
    doc.roundedRect(statsX, finalY, 105, 28, 1, 1, 'FD');
    
    doc.setFontSize(6.5);
    doc.setTextColor(...textLight);
    doc.setFont('helvetica', 'bold');
    doc.text('STATISTIQUES DE LA CLASSE / CLASS PERFORMANCE', statsX + 5, finalY + 6);
    doc.setDrawColor(...borderGray);
    doc.line(statsX + 5, finalY + 9, statsX + 100, finalY + 9);

    // Class Stats Labels
    doc.setFontSize(6);
    doc.text('NOTE MAX', statsX + 18, finalY + 15, { align: 'center' });
    doc.text('NOTE MIN', statsX + 53, finalY + 15, { align: 'center' });
    doc.text('MOYENNE CLASSE', statsX + 87, finalY + 15, { align: 'center' });

    // Class Stats Values
    doc.setFontSize(8.5);
    doc.setTextColor(...primaryDark);
    const maxVal = classStats ? classStats.max : 0;
    const minVal = classStats ? classStats.min : 0;
    const avgVal = classStats ? classStats.avg : 0;
    doc.text(`${maxVal.toFixed(2)}`, statsX + 18, finalY + 23, { align: 'center' });
    doc.text(`${minVal.toFixed(2)}`, statsX + 53, finalY + 23, { align: 'center' });
    doc.setTextColor(...primaryTeal);
    doc.text(`${avgVal.toFixed(2)}`, statsX + 87, finalY + 23, { align: 'center' });

    // Right Box: Student Result Main Highlight Box
    doc.setFillColor(...bgLight);
    doc.setDrawColor(...primaryTeal);
    doc.setLineWidth(0.4);
    doc.roundedRect(131, finalY, 63, 28, 1, 1, 'FD');

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryTeal);
    doc.text('MOYENNE GÉNÉRALE / STUDENT AVG', 162.5, finalY + 6, { align: 'center' });
    doc.setDrawColor(...borderGray);
    doc.line(136, finalY + 9, 189, finalY + 9);

    doc.setFontSize(12);
    const avgColor = rowAvg >= 10 ? [15, 118, 110] : [220, 38, 38];
    doc.setTextColor(...avgColor);
    doc.text(`${rowAvg.toFixed(2)}`, 157, finalY + 21, { align: 'center' });
    doc.setFontSize(8);
    doc.setTextColor(...primaryDark);
    doc.text('/ 20', 174, finalY + 21);

    // --- 6. APPRECIATION & SIGNATURES ---
    const signY = finalY + 41;
    
    doc.setFontSize(7.5);
    doc.setTextColor(...primaryDark);
    doc.setFont('helvetica', 'bold');
    doc.text(`Appréciation du travail : `, 16, signY);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...primaryTeal);
    doc.text(`${this.getAppreciation(rowAvg)}`, 54, signY);

    // Rankings (Class Rank & Cycle Rank & Establishment Rank)
    doc.setFontSize(7.5);
    doc.setTextColor(...primaryDark);
    doc.setFont('helvetica', 'bold');
    doc.text(`Rang classe : `, 16, signY + 5.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textDark);
    const classRankStr = classRank ? `${classRank}e sur ${totalClassStudents}` : '--';
    doc.text(classRankStr, 38, signY + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryDark);
    doc.text(`Rang cycle : `, 78, signY + 5.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textDark);
    const cycleRankStr = cycleRank ? `${cycleRank}e sur ${totalCycleStudents}` : '--';
    doc.text(cycleRankStr, 98, signY + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryDark);
    doc.text(`Rang établissement : `, 136, signY + 5.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textDark);
    const estRankStr = estRank ? `${estRank}e sur ${totalEstStudents}` : '--';
    doc.text(estRankStr, 169, signY + 5.5);

    // Signature Headers
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryDark);
    
    // Director (Right)
    doc.text('LE CHEF D\'ÉTABLISSEMENT / PRINCIPAL', 130, signY + 15);
    // Parent (Left)
    doc.text('SIGNATURE DES PARENTS / PARENT SIGNATURE', 16, signY + 15);

    // Signature Lines
    doc.setDrawColor(...borderGray);
    doc.setLineWidth(0.4);
    doc.line(16, signY + 33, 76, signY + 33);
    doc.line(130, signY + 33, 190, signY + 33);

    // --- 7. FOOTER WATERMARK ---
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textLight);
    doc.text(`Document officiel généré par GigaCore OS - Projet Init Django Angular`, 105, 283, { align: 'center' });
    doc.text(`${est?.name || 'School System'} | ID: ${row.matricule}-${period?.id}-${row.studentId}`, 105, 287, { align: 'center' });
  }

  private generateUniversityBulletin(
    doc: any,
    autoTable: any,
    row: StudentGradeRow,
    session: any,
    subjects: EvaluationSubjectFieldsFragment[],
    classroomId: string,
    classroomToLevelMap: Map<string, string>,
    availableClassrooms: any[],
    periodGrades: GradeFieldsFragment[],
    logoBase64: string | null
  ) {
    const est = session?.establishment;
    const period = session?.academicPeriod;

    // --- COLOR PALETTE (PRO & PREMIUM SLATE/TEAL) ---
    const primaryDark = [15, 23, 42];
    const primaryTeal = [15, 118, 110];
    const secondaryTeal = [13, 148, 136];
    const textDark = [51, 65, 85];
    const textLight = [100, 116, 139];
    const borderGray = [226, 232, 240];
    const bgLight = [248, 250, 252];
    const ueBgColor = [241, 245, 249]; // Slate 100 for UE rows

    doc.setDrawColor(...borderGray);
    doc.setLineWidth(0.2);
    doc.rect(8, 8, 194, 281);

    // --- 1. HEADER BRANDING ---
    const logoX = 16;
    const logoY = 16;
    if (logoBase64) {
      try {
        doc.addImage(logoBase64, 'PNG', logoX, logoY, 20, 20);
      } catch (err) {
        this.drawDefaultShield(doc, logoX, logoY, primaryDark, secondaryTeal);
      }
    } else {
      this.drawDefaultShield(doc, logoX, logoY, primaryDark, secondaryTeal);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...primaryDark);
    doc.text(est?.name?.toUpperCase() || 'ÉTABLISSEMENT SCOLAIRE', 42, 23);
    
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...primaryTeal);
    doc.text(est?.slogan || 'Excellence - Discipline - Succès', 42, 28.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textLight);
    doc.setFontSize(7);
    doc.text('Système d\'Information et de Suivi Académique Élite', 42, 34);

    doc.setFontSize(6.5);
    doc.setTextColor(...textLight);
    const contactX = 192;
    doc.text(est?.phone ? `Tél: ${est.phone}` : 'Tél: --', contactX, 21, { align: 'right' });
    doc.text(est?.email ? `Email: ${est.email}` : 'Email: --', contactX, 26, { align: 'right' });
    doc.text(est?.website ? `Web: ${est.website}` : 'Web: --', contactX, 31, { align: 'right' });
    doc.text(est?.address ? est.address : '--', contactX, 36, { align: 'right' });

    doc.setDrawColor(...primaryTeal);
    doc.setLineWidth(0.8);
    doc.line(16, 43, 194, 43);

    // --- 2. REPORT CARD TITLE ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...primaryDark);
    doc.text('RELEVÉ DE NOTES ET RÉSULTATS / ACADEMIC TRANSCRIPT', 105, 52, { align: 'center' });

    // --- 3. STUDENT PROFILE ---
    const cardY = 58;
    doc.setFillColor(...bgLight);
    doc.setDrawColor(...borderGray);
    doc.setLineWidth(0.3);
    doc.roundedRect(16, cardY, 178, 32, 1.5, 1.5, 'FD');
    doc.line(105, cardY + 3, 105, cardY + 29);

    doc.setFontSize(6.5);
    doc.setTextColor(...textLight);
    doc.setFont('helvetica', 'bold');
    doc.text('ÉLÈVE / STUDENT', 22, cardY + 7);
    doc.setFontSize(9.5);
    doc.setTextColor(...primaryDark);
    doc.text(`${row.lastName.toUpperCase()} ${row.firstName}`, 22, cardY + 13);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textDark);
    doc.text(`Matricule :  ${row.matricule}`, 22, cardY + 20);
    const className = availableClassrooms.find(c => c.id === row.classroomId)?.name || 'N/A';
    doc.text(`Classe :        ${className}`, 22, cardY + 25);

    doc.setFontSize(6.5);
    doc.setTextColor(...textLight);
    doc.setFont('helvetica', 'bold');
    doc.text('PÉRIODE ACADÉMIQUE / PERIOD', 111, cardY + 7);
    doc.setFontSize(9);
    doc.setTextColor(...primaryTeal);
    doc.text(period?.name?.toUpperCase() || 'SEMESTRE', 111, cardY + 13);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textDark);
    doc.text(`Année Académique :  ${period?.academicYear?.name || '2025-2026'}`, 111, cardY + 20);
    doc.text(`Date d'édition :        ${new Date().toLocaleDateString('fr-FR')}`, 111, cardY + 25);

    // --- 4. GRADES TABLE WITH UE GROUPS ---
    const headers = [['UNITÉS D\'ENSEIGNEMENT (UE) / MATIÈRES', 'Moy CC', 'EXAM /20', 'MOY/20', 'CRÉDITS', 'ACQUIS', 'APPRÉCIATION']];
    
    // Group subjects by UE
    const ueGroups = new Map<string, any[]>();
    const studentIdToMatch = String(row.studentId);
    const studentGrades = periodGrades.filter(g => String(g.student.id) === studentIdToMatch);
    
    const subjectGroups = new Map<string, GradeFieldsFragment[]>();
    studentGrades.forEach(g => {
        const name = g.evaluationSubject?.subject?.name || 'Subject';
        if (!subjectGroups.has(name)) subjectGroups.set(name, []);
        subjectGroups.get(name)!.push(g);
    });

    for (const [subjectName, grades] of subjectGroups.entries()) {
        const currentSubj = subjects.find(s => s.subject?.name === subjectName);
        const subjInfo = this.getDynamicSubjectInfo(currentSubj, classroomId, classroomToLevelMap);
        
        const ccGrades = grades.filter(g => g.evaluationSubject?.session?.evaluationType?.code === 'CC');
        const ccGradesWithValue = ccGrades.filter(g => g.value !== null && g.value !== undefined);
        const ccAvg = ccGradesWithValue.length > 0 ? ccGradesWithValue.reduce((a, b) => a + Number(b.value), 0) / ccGradesWithValue.length : null;
        const ccWeight = ccGrades.length > 0 ? Number(ccGrades[0].evaluationSubject?.session?.evaluationType?.weight || 1) : 1;

        const examGrade = grades.find(g => g.evaluationSubject?.session?.evaluationType?.code === 'EXAM');
        const examVal = (examGrade?.value !== null && examGrade?.value !== undefined) ? Number(examGrade.value) : null;
        const examWeight = examGrade ? Number(examGrade.evaluationSubject?.session?.evaluationType?.weight || 2) : 2;

        let subjectWeightedTotal = 0;
        let divisor = 0;
        if (ccAvg !== null) { subjectWeightedTotal += ccAvg * ccWeight; divisor += ccWeight; }
        if (examVal !== null) { subjectWeightedTotal += examVal * examWeight; divisor += examWeight; }
        const finalSubjAvg = divisor > 0 ? subjectWeightedTotal / divisor : 0;

        if (!ueGroups.has(subjInfo.groupName)) ueGroups.set(subjInfo.groupName, []);
        ueGroups.get(subjInfo.groupName)!.push({
            name: subjectName,
            ccAvg,
            examVal,
            finalSubjAvg,
            credits: subjInfo.credits || 0,
            coeff: subjInfo.coeff || 1
        });
    }

    const body: any[] = [];
    let totalCredits = 0;
    let totalAcquiredCredits = 0;
    let totalPeriodPoints = 0;
    let totalPeriodCoeff = 0;

    for (const [ueName, ueSubjects] of ueGroups.entries()) {
        // Calculate UE average based on coefficients inside the UE
        let ueTotalPoints = 0;
        let ueTotalCoeff = 0;
        let ueTotalCredits = 0;
        
        ueSubjects.forEach(s => {
            ueTotalPoints += s.finalSubjAvg * s.coeff;
            ueTotalCoeff += s.coeff;
            ueTotalCredits += s.credits;
            
            totalPeriodPoints += s.finalSubjAvg * s.coeff;
            totalPeriodCoeff += s.coeff;
            totalCredits += s.credits;
        });

        const ueAvg = ueTotalCoeff > 0 ? ueTotalPoints / ueTotalCoeff : 0;
        const isUeValidated = ueAvg >= 10;
        
        // Add UE Header Row (Safe standard array to avoid colSpan bugs)
        body.push([
            `UE: ${ueName.toUpperCase()}`,
            '',
            '',
            `${ueAvg.toFixed(2)}`,
            '',
            isUeValidated ? 'Validé' : 'Non',
            ''
        ]);

        // Add Subjects within UE
        ueSubjects.forEach(s => {
            const isSubjectAcquired = s.finalSubjAvg >= 10 || isUeValidated;
            if (isSubjectAcquired) {
                totalAcquiredCredits += s.credits;
            }

            body.push([
                `   ${s.name}`,
                s.ccAvg !== null ? Number(s.ccAvg).toFixed(2) : '--',
                s.examVal !== null ? Number(s.examVal).toFixed(2) : '--',
                s.finalSubjAvg.toFixed(2),
                String(s.credits),
                isSubjectAcquired ? String(s.credits) : '0',
                this.getAppreciation(s.finalSubjAvg)
            ]);
        });
    }

    const rowAvg = totalPeriodCoeff > 0 ? totalPeriodPoints / totalPeriodCoeff : 0;

    autoTable(doc, {
        startY: 96,
        margin: { left: 16, right: 16 },
        head: headers,
        body: body,
        theme: 'grid',
        headStyles: { 
            fillColor: primaryDark, 
            halign: 'center', 
            fontSize: 6.5, 
            fontStyle: 'bold',
            textColor: [255, 255, 255],
            cellPadding: 2.5
        },
        bodyStyles: { 
            fontSize: 7, 
            cellPadding: 2, 
            textColor: textDark,
            lineColor: borderGray
        },
        columnStyles: {
            0: { cellWidth: 70 },
            1: { halign: 'center', cellWidth: 15 },
            2: { halign: 'center', cellWidth: 15 },
            3: { halign: 'center', cellWidth: 15, fontStyle: 'bold', fillColor: bgLight },
            4: { halign: 'center', cellWidth: 15 },
            5: { halign: 'center', cellWidth: 15, fontStyle: 'bold' },
            6: { halign: 'center', fontSize: 6.5 }
        },
        didParseCell: (data: any) => {
            if (data.row && data.row.raw && typeof data.row.raw[0] === 'string' && data.row.raw[0].startsWith('UE: ')) {
                data.cell.styles.fillColor = ueBgColor;
                data.cell.styles.fontStyle = 'bold';
                data.cell.styles.textColor = primaryDark;
            }
        }
    });

    // --- 5. ACADEMIC SUMMARY DASHBOARD ---
    const finalY = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 8 : 150;
    
    // Left Box: Credits Stats
    const statsX = 16;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...borderGray);
    doc.setLineWidth(0.3);
    doc.roundedRect(statsX, finalY, 105, 28, 1, 1, 'FD');
    
    doc.setFontSize(6.5);
    doc.setTextColor(...textLight);
    doc.setFont('helvetica', 'bold');
    doc.text('BILAN DES CRÉDITS (ECTS) / CREDITS SUMMARY', statsX + 5, finalY + 6);
    doc.setDrawColor(...borderGray);
    doc.line(statsX + 5, finalY + 9, statsX + 100, finalY + 9);

    doc.setFontSize(6);
    doc.text('TOTAL CRÉDITS', statsX + 26, finalY + 15, { align: 'center' });
    doc.text('CRÉDITS ACQUIS', statsX + 79, finalY + 15, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(...primaryDark);
    doc.text(`${totalCredits}`, statsX + 26, finalY + 23, { align: 'center' });
    const acquiredColor = totalAcquiredCredits === totalCredits ? primaryTeal : [220, 38, 38];
    doc.setTextColor(...acquiredColor);
    doc.text(`${totalAcquiredCredits}`, statsX + 79, finalY + 23, { align: 'center' });

    // Right Box: Decision and Average
    doc.setFillColor(...bgLight);
    doc.setDrawColor(...primaryTeal);
    doc.setLineWidth(0.4);
    doc.roundedRect(131, finalY, 63, 28, 1, 1, 'FD');

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryTeal);
    doc.text('MOYENNE GÉNÉRALE / STUDENT AVG', 162.5, finalY + 6, { align: 'center' });
    doc.setDrawColor(...borderGray);
    doc.line(136, finalY + 9, 189, finalY + 9);

    doc.setFontSize(12);
    const avgColor = rowAvg >= 10 ? [15, 118, 110] : [220, 38, 38];
    doc.setTextColor(...avgColor);
    doc.text(`${rowAvg.toFixed(2)}`, 157, finalY + 21, { align: 'center' });
    doc.setFontSize(8);
    doc.setTextColor(...primaryDark);
    doc.text('/ 20', 174, finalY + 21);

    // --- 6. DECISION & SIGNATURES ---
    const signY = finalY + 41;
    
    doc.setFontSize(7.5);
    doc.setTextColor(...primaryDark);
    doc.setFont('helvetica', 'bold');
    doc.text(`Décision du Jury : `, 16, signY);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...avgColor);
    const decision = rowAvg >= 10 ? 'ADMIS(E)' : 'AJOURNÉ(E)';
    doc.text(decision, 45, signY);

    // Signature Headers
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryDark);
    
    doc.text('LE CHEF D\'ÉTABLISSEMENT / PRINCIPAL', 130, signY + 15);
    doc.text('LE DIRECTEUR DES ÉTUDES / DEAN', 16, signY + 15);

    doc.setDrawColor(...borderGray);
    doc.setLineWidth(0.4);
    doc.line(16, signY + 33, 76, signY + 33);
    doc.line(130, signY + 33, 190, signY + 33);

    // --- 7. FOOTER WATERMARK ---
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textLight);
    doc.text(`Document officiel généré par GigaCore OS - Projet Init Django Angular`, 105, 283, { align: 'center' });
    doc.text(`${est?.name || 'University System'} | ID: ${row.matricule}-${period?.id}-${row.studentId}`, 105, 287, { align: 'center' });
  }

  private getAppreciation(avg: number): string {
    if (avg >= 18) return 'Excellent';
    if (avg >= 16) return 'Très Bien';
    if (avg >= 14) return 'Bien';
    if (avg >= 12) return 'Assez Bien';
    if (avg >= 10) return 'Passable';
    if (avg >= 8) return 'Insuffisant';
    return 'Médiocre';
  }

  private getDynamicSubjectInfo(subject: any, classroomId: string | null, classroomToLevelMap: Map<string, string>): { coeff: number; groupName: string; credits: number } {
    const lcs = subject?.levelCoefficients || [];

    let levelId = '';
    if (classroomId) {
        levelId = classroomToLevelMap.get(classroomId) || '';
    }

    const defaultInfo = { coeff: subject?.coefficient ? Number(subject.coefficient) : 1, groupName: 'AUTRES', credits: 0 };

    if (levelId) {
        const lc = lcs.find((c: any) => c.levelId?.toString() === levelId);
        if (lc) {
            return {
                coeff: lc.coefficient ? Number(lc.coefficient) : defaultInfo.coeff,
                groupName: lc.groupName || defaultInfo.groupName,
                credits: lc.credits ? Number(lc.credits) : 0
            };
        }
    }

    if (lcs.length > 0) {
        const first = lcs[0];
        return {
            coeff: first.coefficient ? Number(first.coefficient) : defaultInfo.coeff,
            groupName: first.groupName || defaultInfo.groupName,
            credits: first.credits ? Number(first.credits) : 0
        };
    }

    return defaultInfo;
  }

  private calculateAllStudentAverages(
    grades: GradeFieldsFragment[],
    subjects: EvaluationSubjectFieldsFragment[],
    classroomToLevelMap: Map<string, string>,
    academicYearId: string
  ): Map<string, { average: number; classroomId: string; classroomName: string; cycleId: string; cycleName: string }> {
    const studentGroups = new Map<string, GradeFieldsFragment[]>();
    grades.forEach(g => {
        if (!g.student) return;
        const sid = String(g.student.id);
        if (!studentGroups.has(sid)) studentGroups.set(sid, []);
        studentGroups.get(sid)!.push(g);
    });

    const averagesMap = new Map<string, { average: number; classroomId: string; classroomName: string; cycleId: string; cycleName: string }>();

    for (const [sid, studentGrades] of studentGroups.entries()) {
        if (studentGrades.length === 0) continue;
        const sampleGrade = studentGrades[0];
        
        // Find active enrollment for the current academic year
        const activeEnrollment = (sampleGrade.student as any).enrollments?.find((e: any) => 
            String(e.academicYear?.id) === String(academicYearId)
        );
        
        const classroomId = activeEnrollment?.classroom?.id || '';
        const classroomName = activeEnrollment?.classroom?.name || '';
        const levelId = activeEnrollment?.classroom?.level?.id || '';
        const cycleId = activeEnrollment?.classroom?.level?.cycle?.id || '';
        const cycleName = activeEnrollment?.classroom?.level?.cycle?.name || '';

        // Temporary level map including this student's level
        const tempLevelMap = new Map(classroomToLevelMap);
        if (classroomId && levelId) {
            tempLevelMap.set(classroomId, levelId);
        }

        // Calculate student average
        const avg = this.calculateStudentAverageFromGrades(studentGrades, subjects, classroomId, tempLevelMap);
        if (avg !== null) {
            averagesMap.set(sid, {
                average: avg,
                classroomId,
                classroomName,
                cycleId,
                cycleName
            });
        }
    }

    return averagesMap;
  }

  private drawDefaultShield(doc: any, logoX: number, logoY: number, primaryDark: number[], secondaryTeal: number[]) {
    // Outer shield (Slate 900)
    doc.setFillColor(...primaryDark);
    doc.rect(logoX, logoY, 20, 10, 'F');
    doc.triangle(logoX, logoY + 10, logoX + 20, logoY + 10, logoX + 10, logoY + 20, 'F');

    // Inner shield (Teal 600)
    doc.setFillColor(...secondaryTeal);
    doc.rect(logoX + 2, logoY + 2, 16, 8, 'F');
    doc.triangle(logoX + 2, logoY + 10, logoX + 18, logoY + 10, logoX + 10, logoY + 17, 'F');

    // Letter 'E' (Centered)
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('E', logoX + 10, logoY + 11.5, { align: 'center' });
  }

  private loadImage(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          try {
            const dataURL = canvas.toDataURL('image/png');
            resolve(dataURL);
          } catch (e) {
            reject(e);
          }
        } else {
          reject(new Error('Canvas context not available'));
        }
      };
      img.onerror = (err) => reject(err);
      img.src = url;
    });
  }
}
