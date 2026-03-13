import { Component, OnInit, inject, ViewChild, TemplateRef, AfterViewInit, ChangeDetectorRef, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { BaseModalListComponent } from '@core/abstracts/base-modal-list.component';
import { AcademicYearService } from '@features/structure/services/academic_year.service';
import { EnrollmentService } from '../../services/enrollment.service';
import { StudentService } from '../../services/student.service';
import { StudentFormComponent } from '../student-form/student-form.component';
import { StudentDetailComponent } from '../student-detail/student-detail.component';
import { ClassRoomService } from '@features/structure/services/classroom.service';
import { StructureStateService } from '@core/services/structure-state.service';
import { EstablishmentService } from '@features/structure/services/establishment.service';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';

import { UiModalComponent } from '@shared/components/ui-modal/ui-modal.component';
import { UiPaginationComponent } from '@shared/components/ui-pagination/ui-pagination.component';
import { UiDropdownComponent } from '@shared/components/ui-dropdown/ui-dropdown.component';
import { UiStatusBadgeComponent } from '@shared/components/ui-status-badge/ui-status-badge.component';
import { UiAvatarComponent } from '@shared/components/ui-avatar/ui-avatar.component';
import { UiListPageComponent } from '@shared/components/ui-list-page/ui-list-page.component';
import { UiToolbarComponent } from '@shared/components/ui-toolbar/ui-toolbar.component';
import { UiConfirmModalComponent } from '@shared/components/ui-confirm-modal/ui-confirm-modal.component';
import { UiTableComponent, UiTableColumn } from '@shared/components/ui-table/ui-table.component';
import { UiFilterPanelComponent } from '@shared/components/ui-filter-panel/ui-filter-panel.component';
import { UiExportModalComponent } from '@shared/components/ui-export-modal/ui-export-modal.component';

@Component({
    selector: 'app-student-list',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        StudentFormComponent,
        StudentDetailComponent,
        UiModalComponent,
        UiPaginationComponent,
        UiDropdownComponent,
        UiStatusBadgeComponent,
        UiAvatarComponent,
        UiListPageComponent,
        UiToolbarComponent,
        UiConfirmModalComponent,
        UiTableComponent,
        UiFilterPanelComponent,
        UiExportModalComponent
    ],
    templateUrl: './student-list.component.html'
})
export class StudentListComponent extends BaseModalListComponent<any> implements OnInit, AfterViewInit, OnDestroy {

    service = inject(StudentService);
    classService = inject(ClassRoomService);
    academicYearService = inject(AcademicYearService);
    enrollmentService = inject(EnrollmentService);
    establishmentService = inject(EstablishmentService);

    query = this.service.getQuery();
    responseKey = 'students';
    formComponent = StudentFormComponent;

    // Filters
    searchControl = new FormControl('');
    isFiltersOpen = signal(false);
    classrooms$ = this.classService.list();
    academicYears$ = this.academicYearService.list();

    private destroy$ = new Subject<void>();
    private cdr = inject(ChangeDetectorRef);

    @ViewChild('studentCell') studentCell!: TemplateRef<any>;
    @ViewChild('classCell') classCell!: TemplateRef<any>;
    @ViewChild('statusCell') statusCell!: TemplateRef<any>;
    @ViewChild('actionsCell') actionsCell!: TemplateRef<any>;

    tableColumns: UiTableColumn[] = [];

    override initFilterForm(): FormGroup {
        return this.fb.group({
            search: [''],
            classroomId: [null],
            academicYearId: [null],
            status: [null],
            parentPhone: ['']
        });
    }

    override ngOnInit(): void {
        super.ngOnInit();

        // Sync Search
        this.searchControl.valueChanges.pipe(
            takeUntil(this.destroy$)
        ).subscribe(val => {
            this.filterForm.patchValue({ search: val });
        });

        // Auto-refresh on filter change
        this.filterForm.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            takeUntil(this.destroy$)
        ).subscribe(() => {
            this.currentPage.set(1);
            this.refresh();
        });
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.tableColumns = [
                { header: 'Élève', template: this.studentCell },
                { header: 'Matricule', key: 'matricule' },
                { header: 'Classe Actuelle', template: this.classCell },
                { header: 'Statut', template: this.statusCell }
            ];
            this.cdr.detectChanges();
        });
    }

    onExpel(item: any) {
        const enrollment = this.getCurrentEnrollment(item);
        if (!enrollment) {
            this.toastService.error('Aucune inscription active trouvée pour cet élève');
            return;
        }
        this.selectedItem.set(enrollment);
        (this.modalMode as any).set('expel');
        this.openModal();
    }

    onTransfer(item: any) {
        const enrollment = this.getCurrentEnrollment(item);
        if (!enrollment) {
            this.toastService.error('Aucune inscription active trouvée pour cet élève');
            return;
        }
        this.selectedItem.set(enrollment);
        (this.modalMode as any).set('transfer');
        this.openModal();
    }

    async onPrintCertificate(student: any) {
        const enrollment = this.getCurrentEnrollment(student);
        if (!enrollment) {
            this.toastService.error('Cet élève n\'a pas d\'inscription pour imprimer l\'attestation');
            return;
        }

        this.isLoading.set(true);
        try {
            // Load PDF tools
            const [jsPDFModule, autoTableModule] = await Promise.all([
                import('jspdf'),
                import('jspdf-autotable')
            ]);
            const JsPDF = (jsPDFModule as any).default || jsPDFModule;
            const autoTable = (autoTableModule as any).default || autoTableModule;

            // Fetch Establishment info
            const estId = this.structureState.currentEstablishmentId();
            let establishment: any = null;
            if (estId) {
                const ests = await firstValueFrom(this.establishmentService.getAll());
                establishment = (ests.data as any)?.establishments?.items?.find((e: any) => e.id === estId);
            }

            const doc = new JsPDF();
            this.generateCertificate(doc, student, enrollment, establishment);
            doc.save(`attestation_${student.matricule}.pdf`);
            this.toastService.success('Attestation générée avec succès');
        } catch (err) {
            console.error('PDF Error:', err);
            this.toastService.error('Erreur lors de la génération de l\'attestation');
        } finally {
            this.isLoading.set(false);
        }
    }

    private generateCertificate(doc: any, student: any, enrollment: any, est: any) {
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
        // Logo
        if (est?.logo) {
            const baseUrl = environment.apiUrl.replace('/api', '');
            const logoUrl = est.logo.startsWith('http') ? est.logo : `${baseUrl}/media/${est.logo}`;
            // For now, let's use a placeholder if loading fails or keep it simple
            doc.setDrawColor(...indigo600);
            doc.setLineWidth(0.5);
            doc.rect(20, 25, 25, 25);
            doc.setFontSize(7);
            doc.text('LOGO', 32.5, 38, { align: 'center' });
        } else {
            doc.setDrawColor(...indigo600);
            doc.setLineWidth(0.5);
            doc.rect(20, 25, 25, 25);
            doc.setFontSize(7);
            doc.text('LOGO', 32.5, 38, { align: 'center' });
        }

        // School Name
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.setTextColor(...slate800);
        doc.text(est?.name?.toUpperCase() || 'ÉTABLISSEMENT SCOLAIRE', 52, 35);
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(...slate500);
        doc.text(est?.slogan || 'Excellence en Éducation', 52, 42);

        // Contact Info (Right)
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...slate500);
        const contactX = 190;
        doc.text(`Tél: ${est?.phone || '(+237) ...'}`, contactX, 30, { align: 'right' });
        doc.text(`Email: ${est?.email || 'contact@ecole.com'}`, contactX, 35, { align: 'right' });
        doc.text(`Site: ${est?.website || 'www.ecole.com'}`, contactX, 40, { align: 'right' });
        doc.text(`${est?.city || 'Douala'}, ${est?.country || 'Cameroun'}`, contactX, 45, { align: 'right' });

        // --- 3. TITLE ---
        doc.setFillColor(...bgGray);
        doc.rect(20, 60, 170, 15, 'F');
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...indigo600);
        doc.text('ATTESTATION D\'INSCRIPTION', 105, 70, { align: 'center' });

        // --- 4. BODY ---
        doc.setFontSize(11);
        doc.setTextColor(...slate800);
        doc.setFont('helvetica', 'normal');
        
        const startY = 90;
        const lineSpacing = 10;
        const indent = 20;

        doc.text(`Je soussigné, Monsieur le Directeur de ${est?.name || 'l\'établissement'},`, indent, startY);
        doc.text(`atteste par la présente que l'élève :`, indent, startY + lineSpacing);

        // Student Data Box
        doc.setFillColor(...bgGray);
        doc.roundedRect(indent, startY + 15, 170, 45, 2, 2, 'F');
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(`${student.lastName.toUpperCase()} ${student.firstName}`, indent + 10, startY + 28);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(...slate500);
        doc.text(`Matricule : ${student.matricule}`, indent + 10, startY + 38);
        doc.text(`Né(e) le : ${student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('fr-FR') : '-'} à ${student.placeOfBirth || '-'}`, indent + 10, startY + 44);
        doc.text(`Sexe : ${student.gender === 'M' ? 'Masculin' : 'Féminin'}`, indent + 10, startY + 50);

        // Enrollment Details
        doc.setFontSize(11);
        doc.setTextColor(...slate800);
        doc.text(`Est régulièrement inscrit(e) au sein de notre établissement pour l'année académique :`, indent, startY + 75);
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(...indigo600);
        doc.text(`${enrollment.academicYear.name}`, 105, startY + 85, { align: 'center' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(...slate800);
        doc.text(`Dans la classe de :`, indent, startY + 100);
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text(`${enrollment.classroom.name}`, indent + 40, startY + 100);

        // Conclusion
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`En foi de quoi, la présente attestation lui est délivrée pour servir et faire valoir ce que de droit.`, indent, startY + 120);

        // --- 5. SIGNATURE ---
        const footerY = 240;
        doc.setFontSize(9);
        doc.text(`Fait à ${est?.city || 'Yaoundé'}, le ${new Date().toLocaleDateString('fr-FR')}`, 190, footerY, { align: 'right' });
        
        doc.setFont('helvetica', 'bold');
        doc.text('Le Directeur', 160, footerY + 10);
        
        // Stamp Placeholder
        doc.setDrawColor(...slate500);
        doc.setLineWidth(0.2);
        doc.setLineDashPattern([2, 1], 0);
        doc.circle(170, footerY + 30, 20);
        doc.setFontSize(7);
        doc.setTextColor(...slate500);
        doc.text('CACHET DE L\'ÉTABLISSEMENT', 170, footerY + 30, { align: 'center' });

        // --- 6. FOOTER BAR ---
        doc.setLineDashPattern([], 0);
        doc.setFillColor(...bgGray);
        doc.rect(0, 280, 210, 17, 'F');
        doc.setFontSize(8);
        doc.setTextColor(...slate500);
        doc.text(est?.print_footer || `${est?.name || 'Établissement'} - Tous droits réservés.`, 105, 290, { align: 'center' });
    }

    confirmExpel() {
        if (!this.selectedItem()) return;
        this.enrollmentService.save({ id: this.selectedItem().id, status: 'EXPELLED' }).subscribe({
            next: () => {
                this.toastService.success('Élève renvoyé avec succès');
                this.closeModal();
                this.refresh();
            },
            error: () => this.toastService.error('Erreur lors de l\'opération')
        });
    }

    confirmTransfer() {
        if (!this.selectedItem()) return;
        this.enrollmentService.save({ id: this.selectedItem().id, status: 'LEFT' }).subscribe({
            next: () => {
                this.toastService.success('Départ enregistré avec succès');
                this.closeModal();
                this.refresh();
            },
            error: () => this.toastService.error('Erreur lors de l\'opération')
        });
    }

    getStatusLabel(status: string): string {
        const labels: any = {
            'REGISTERED': 'Inscrit',
            'LEFT': 'Parti',
            'EXPELLED': 'Renvoyé'
        };
        return labels[status] || 'Non inscrit';
    }

    getStatusClass(status: string): string {
        const base = 'px-2.5 py-1 rounded-full text-xs font-bold border ';
        const classes: any = {
            'REGISTERED': base + 'bg-green-50 text-green-700 border-green-100',
            'LEFT': base + 'bg-gray-50 text-gray-700 border-gray-100',
            'EXPELLED': base + 'bg-red-50 text-red-700 border-red-100'
        };
        return classes[status] || base + 'bg-gray-50 text-gray-400 border-gray-100';
    }

    isMode(mode: string): boolean {
        return (this.modalMode() as any) === mode;
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    toggleFilters() {
        this.isFiltersOpen.update(v => !v);
    }

    resetFilters() {
        this.filterForm.reset();
        this.searchControl.setValue('');
    }

    // Import / Export

    onDownloadTemplate() {
        this.service.downloadTemplate().subscribe(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'import_template_eleves.xlsx';
            a.click();
            window.URL.revokeObjectURL(url);
        });
    }

    onImport() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xlsx, .csv';
        input.onchange = (e: any) => {
            const file = e.target.files[0];
            if (file) {
                this.service.import(file).subscribe({
                    next: () => {
                        this.toastService.success('Import réussi');
                        this.refresh();
                    },
                    error: () => this.toastService.error('Erreur lors de l\'import')
                });
            }
        };
        input.click();
    }

    protected override getExportConfig() {
        return {
            title: 'Liste des Élèves',
            columns: [
                { header: 'Matricule', key: 'matricule' },
                { header: 'Prénom', key: 'firstName' },
                { header: 'Nom', key: 'lastName' },
                {
                    header: 'Sexe',
                    key: 'gender',
                    format: (v: string) => v === 'M' ? 'Masculin' : 'Féminin'
                },
                {
                    header: 'Date de Naissance',
                    key: 'dateOfBirth',
                    format: (v: string) => v ? new Date(v).toLocaleDateString('fr-FR') : '-'
                },
                { header: 'Lieu de Naissance', key: 'placeOfBirth' },
                { header: 'Classe', key: 'enrollments.0.classroom.name' },
                {
                    header: 'Téléphone Parent',
                    key: 'guardians',
                    format: (gs: any[]) => gs?.map(g => g.phoneNumber).join(', ') || '-'
                }
            ]
        };
    }

    // Helpers for Template
    getCurrentEnrollment(student: any) {
        if (!student.enrollments || student.enrollments.length === 0) return null;
        return student.enrollments[0];
    }
}
