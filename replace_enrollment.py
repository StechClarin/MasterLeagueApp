import re

with open('frontend/src/app/features/students/components/enrollment-list/enrollment-list.component.ts', 'r') as f:
    code = f.read()

# 1. Imports
if 'StructureStateService' not in code:
    imports = """
import { StructureStateService } from '@core/services/structure-state.service';
import { EstablishmentService } from '@features/structure/services/establishment.service';
import { environment } from 'src/environments/environment';
import { firstValueFrom } from 'rxjs';
import { Validators } from '@angular/forms';
"""
    code = code.replace("import { AcademicYearService } from '@features/structure/services/academic_year.service';",
                        "import { AcademicYearService } from '@features/structure/services/academic_year.service';" + imports)

# 2. Injects and properties
code = code.replace("academicYears$ = this.academicYearService.list();", 
                    "academicYears$ = this.academicYearService.list();\n    structureState = inject(StructureStateService);\n    establishmentService = inject(EstablishmentService);\n\n    transferForm = this.fb.group({\n        targetSchoolName: ['', [Validators.required]],\n        targetSchoolAddress: ['', [Validators.required]]\n    });")

# 3. HTML Buttons
html_buttons = """
            <button (click)="onPrintCertificate(item)" class="p-2 rounded-full text-indigo-500 hover:bg-indigo-50" title="Imprimer l'attestation">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            </button>
            <button (click)="onPrintIdCard(item)" class="p-2 rounded-full text-blue-500 hover:bg-blue-50" title="Imprimer carte scolaire">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
            </button>
            <div class="w-px h-6 bg-gray-200 mx-1"></div>
"""

code = code.replace("""<!-- Menu Content -->
          <div menu class="flex items-center gap-1">""", """<!-- Menu Content -->
          <div menu class="flex items-center gap-1">""" + html_buttons)

transfer_modal_html = """
        <div *ngIf="isMode('transfer')" class="p-8">
            <div class="flex items-center gap-4 mb-6">
                <div class="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                </div>
                <div>
                    <h3 class="text-xl font-bold text-gray-900">Transfert d'élève</h3>
                    <p class="text-sm text-gray-500">Enregistrez le départ vers un autre établissement</p>
                </div>
            </div>

            <div [formGroup]="transferForm" class="space-y-6">
                <div class="space-y-1.5">
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">École de destination</label>
                  <input type="text" formControlName="targetSchoolName" class="block w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all">
                </div>
                <div class="space-y-1.5">
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Adresse / Ville</label>
                  <input type="text" formControlName="targetSchoolAddress" class="block w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all">
                </div>
            </div>

            <div class="mt-8 flex justify-end gap-3">
                <button (click)="closeModal()" class="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                    Annuler
                </button>
                <button (click)="confirmTransfer()" 
                    [disabled]="transferForm.invalid"
                    class="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200">
                    Confirmer & Imprimer
                </button>
            </div>
        </div>
"""

code = code.replace("""<app-ui-confirm-modal *ngIf="isMode('transfer')"
            title="Transférer l'élève"
            message="Confirmez-vous le départ de cet élève ? Son statut passera à 'Parti'."
            (confirm)="confirmTransfer()"
            (cancel)="closeModal()"></app-ui-confirm-modal>""", transfer_modal_html)

# 4. Filter forms
init_filter_replacement = """
    override initFilterForm(): FormGroup {
        const activeYearId = this.structureState.currentAcademicYearId();
        return this.fb.group({
            search: [''],
            classroomId: [null],
            academicYearId: [activeYearId]
        });
    }
"""

code = re.sub(r'override initFilterForm\(\): FormGroup \{[\s\S]*?\}', init_filter_replacement, code)

# 5. Methods replacement
old_confirm_transfer = """
    confirmTransfer() {
        if (!this.selectedItem()) return;
        this.service.save({ id: this.selectedItem().id, status: 'LEFT' }).subscribe({
            next: () => {
                this.toastService.success('Départ enregistré avec succès');
                this.closeModal();
                this.refresh();
            },
            error: () => this.toastService.error('Erreur lors de l\\'opération')
        });
    }
"""

methods_to_insert = """
    async onPrintCertificate(enrollment: any) {
        this.isLoading.set(true);
        try {
            const [jsPDFModule] = await Promise.all([
                import('jspdf')
            ]);
            const JsPDF = (jsPDFModule as any).default || jsPDFModule;

            const estId = this.structureState.currentEstablishmentId();
            let establishment: any = null;
            if (estId) {
                const ests = await firstValueFrom(this.establishmentService.getAll());
                establishment = (ests.data as any)?.establishments?.items?.find((e: any) => e.id === estId);
            }

            const doc = new JsPDF();
            this.generateCertificate(doc, enrollment.student, enrollment, establishment);
            doc.save(`attestation_${enrollment.student.matricule}.pdf`);
            this.toastService.success('Attestation générée avec succès');
        } catch (err) {
            console.error('PDF Error:', err);
            this.toastService.error('Erreur lors de la génération de l\\'attestation');
        } finally {
            this.isLoading.set(false);
        }
    }

    private generateCertificate(doc: any, student: any, enrollment: any, est: any) {
        doc.setFillColor(30, 41, 59);
        doc.rect(0, 0, 210, 15, 'F');
        doc.setFillColor(79, 70, 229);
        doc.rect(0, 15, 210, 2, 'F');

        if (est?.logo) {
            doc.setDrawColor(79, 70, 229);
            doc.setLineWidth(0.5);
            doc.rect(20, 25, 25, 25);
            doc.setFontSize(7);
            doc.text('LOGO', 32.5, 38, { align: 'center' });
        } else {
            doc.setDrawColor(79, 70, 229);
            doc.setLineWidth(0.5);
            doc.rect(20, 25, 25, 25);
            doc.setFontSize(7);
            doc.text('LOGO', 32.5, 38, { align: 'center' });
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.setTextColor(30, 41, 59);
        doc.text(est?.name?.toUpperCase() || 'ÉTABLISSEMENT SCOLAIRE', 52, 35);
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100, 116, 139);
        doc.text(est?.slogan || 'Excellence en Éducation', 52, 42);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        const contactX = 190;
        doc.text(`Tél: ${est?.phone || '(+237) ...'}`, contactX, 30, { align: 'right' });
        doc.text(`Email: ${est?.email || 'contact@ecole.com'}`, contactX, 35, { align: 'right' });
        doc.text(`Site: ${est?.website || 'www.ecole.com'}`, contactX, 40, { align: 'right' });
        doc.text(`${est?.city || 'Douala'}, ${est?.country || 'Cameroun'}`, contactX, 45, { align: 'right' });

        doc.setFillColor(248, 250, 252);
        doc.rect(20, 60, 170, 15, 'F');
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(79, 70, 229);
        doc.text('ATTESTATION D\\'INSCRIPTION', 105, 70, { align: 'center' });

        doc.setFontSize(11);
        doc.setTextColor(30, 41, 59);
        doc.setFont('helvetica', 'normal');
        
        const startY = 90;
        const lineSpacing = 10;
        const indent = 20;

        doc.text(`Je soussigné, Monsieur le Directeur de ${est?.name || 'l\\'établissement'},`, indent, startY);
        doc.text(`atteste par la présente que l'élève :`, indent, startY + lineSpacing);

        doc.setFillColor(248, 250, 252);
        doc.roundedRect(indent, startY + 15, 170, 45, 2, 2, 'F');
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(`${student.lastName?.toUpperCase()} ${student.firstName}`, indent + 10, startY + 28);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text(`Matricule : ${student.matricule}`, indent + 10, startY + 38);
        doc.text(`Né(e) le : ${student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('fr-FR') : '-'} à ${student.placeOfBirth || '-'}`, indent + 10, startY + 44);
        doc.text(`Sexe : ${student.gender === 'M' ? 'Masculin' : 'Féminin'}`, indent + 10, startY + 50);

        doc.setFontSize(11);
        doc.setTextColor(30, 41, 59);
        doc.text(`Est régulièrement inscrit(e) au sein de notre établissement pour l'année académique :`, indent, startY + 75);
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(79, 70, 229);
        doc.text(`${enrollment.academicYear?.name}`, 105, startY + 85, { align: 'center' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(30, 41, 59);
        doc.text(`Dans la classe de :`, indent, startY + 100);
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text(`${enrollment.classroom?.name}`, indent + 40, startY + 100);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`En foi de quoi, la présente attestation lui est délivrée pour servir et faire valoir ce que de droit.`, indent, startY + 120);

        const footerY = 240;
        doc.setFontSize(9);
        doc.text(`Fait à ${est?.city || 'Yaoundé'}, le ${new Date().toLocaleDateString('fr-FR')}`, 190, footerY, { align: 'right' });
        
        doc.setFont('helvetica', 'bold');
        doc.text('Le Directeur', 160, footerY + 10);
        
        doc.setDrawColor(100, 116, 139);
        doc.setLineWidth(0.2);
        doc.setLineDashPattern([2, 1], 0);
        doc.circle(170, footerY + 30, 20);
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        doc.text('CACHET', 170, footerY + 30, { align: 'center' });

        doc.setLineDashPattern([], 0);
        doc.setFillColor(248, 250, 252);
        doc.rect(0, 280, 210, 17, 'F');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(est?.print_footer || `${est?.name || 'Établissement'} - Tous droits réservés.`, 105, 290, { align: 'center' });
    }

    async onPrintIdCard(enrollment: any) {
        this.isLoading.set(true);
        try {
            const [jsPDFModule] = await Promise.all([
                import('jspdf')
            ]);
            const JsPDF = (jsPDFModule as any).default || jsPDFModule;

            const estId = this.structureState.currentEstablishmentId();
            let establishment: any = null;
            if (estId) {
                const ests = await firstValueFrom(this.establishmentService.getAll());
                establishment = (ests.data as any)?.establishments?.items?.find((e: any) => e.id === estId);
            }

            const doc = new JsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: [85.6, 54]
            });

            this.generateIdCard(doc, enrollment.student, enrollment, establishment);
            doc.save(`carte_${enrollment.student.matricule}.pdf`);
            this.toastService.success('Carte scolaire générée');
        } catch (err) {
            console.error('PDF Error:', err);
            this.toastService.error('Erreur lors de la génération de la carte');
        } finally {
            this.isLoading.set(false);
        }
    }

    private generateIdCard(doc: any, student: any, enrollment: any, est: any) {
        doc.setFillColor(248, 250, 252);
        doc.rect(0, 0, 85.6, 54, 'F');

        doc.setFillColor(79, 70, 229);
        doc.rect(0, 0, 85.6, 12, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.text(est?.name?.toUpperCase() || 'ÉTABLISSEMENT', 42.8, 8, { align: 'center' });

        doc.setFontSize(7);
        doc.setTextColor(30, 41, 59);
        doc.text('CARTE SCOLAIRE', 42.8, 16, { align: 'center' });

        doc.setDrawColor(100, 116, 139);
        doc.setLineWidth(0.3);
        doc.rect(4, 18, 20, 25);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6);
        doc.text('PHOTO', 14, 31, { align: 'center' });

        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text(`${student.lastName?.toUpperCase()}`, 28, 22);
        doc.setFont('helvetica', 'normal');
        doc.text(`${student.firstName}`, 28, 26);
        
        doc.setFontSize(7);
        doc.text(`Né(e) le : ${student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('fr-FR') : '-'}`, 28, 31);
        doc.text(`Matricule : ${student.matricule}`, 28, 35);
        doc.text(`Classe : ${enrollment.classroom?.name}`, 28, 39);
        doc.text(`Année : ${enrollment.academicYear?.name}`, 28, 43);

        doc.setFillColor(30, 41, 59);
        doc.rect(0, 50, 85.6, 4, 'F');
        doc.setFontSize(5);
        doc.setTextColor(255, 255, 255);
        doc.text('Document strictement personnel', 42.8, 52.5, { align: 'center' });
    }

    async confirmTransfer() {
        if (!this.selectedItem() || this.transferForm.invalid) return;
        
        const enrollment = this.selectedItem();

        this.isLoading.set(true);
        this.service.save({ 
            id: enrollment.id, 
            status: 'LEFT' 
        }).subscribe({
            next: async () => {
                this.toastService.success('Départ enregistré avec succès');
                const targetInfo = this.transferForm.value;
                await this.printTransferApproval(enrollment, targetInfo);
                this.closeModal();
                this.refresh();
            },
            error: () => {
                this.isLoading.set(false);
                this.toastService.error('Erreur lors de l\\'opération');
            }
        });
    }

    async printTransferApproval(enrollment: any, target: any) {
        try {
            const [jsPDFModule] = await Promise.all([import('jspdf')]);
            const JsPDF = (jsPDFModule as any).default || jsPDFModule;

            const estId = this.structureState.currentEstablishmentId();
            let establishment: any = null;
            if (estId) {
                const ests = await firstValueFrom(this.establishmentService.getAll());
                establishment = (ests.data as any)?.establishments?.items?.find((e: any) => e.id === estId);
            }

            const doc = new JsPDF();
            this.generateTransferPDF(doc, enrollment, establishment, target);
            doc.save(`transfert_${enrollment.student.matricule}.pdf`);
        } catch (err) {
            console.error('Print Error:', err);
            this.toastService.error('Erreur lors de l\\'impression du transfert');
        }
    }

    private generateTransferPDF(doc: any, enrollment: any, est: any, target: any) {
        const student = enrollment.student;

        doc.setFillColor(30, 41, 59);
        doc.rect(0, 0, 210, 15, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.text(est?.name?.toUpperCase() || 'ÉTABLISSEMENT SCOLAIRE', 105, 35, { align: 'center' });
        
        doc.setFontSize(16);
        doc.setTextColor(79, 70, 229);
        doc.text('CERTIFICAT DE TRANSFERT', 105, 55, { align: 'center' });

        doc.setTextColor(30, 41, 59);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        
        const bodyY = 80;
        doc.text(`Le Chef d'établissement de ${est?.name || 'l\\'école'} certifie que l'élève :`, 20, bodyY);
        
        doc.setFont('helvetica', 'bold');
        doc.text(`${student.lastName?.toUpperCase()} ${student.firstName}`, 20, bodyY + 10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Matricule: ${student.matricule}`, 20, bodyY + 15);
        doc.text(`Classe: ${enrollment.classroom?.name}`, 20, bodyY + 20);

        doc.text(`Est autorisé(e) à être transféré(e) vers l'établissement suivant :`, 20, bodyY + 35);
        
        doc.setFont('helvetica', 'bold');
        doc.text(target.targetSchoolName?.toUpperCase(), 20, bodyY + 45);
        doc.setFont('helvetica', 'normal');
        doc.text(`Adresse: ${target.targetSchoolAddress}`, 20, bodyY + 50);

        doc.text(`Le dossier scolaire de l'élève a été clôturé au sein de notre établissement.`, 20, bodyY + 70);

        doc.text(`Fait à ${est?.city || 'Yaoundé'}, le ${new Date().toLocaleDateString('fr-FR')}`, 190, bodyY + 100, { align: 'right' });
        doc.text('Le Directeur', 160, bodyY + 110);
        
        doc.setDrawColor(150);
        doc.circle(170, bodyY + 130, 20);
        doc.setFontSize(7);
        doc.text('CACHET', 170, bodyY + 130, { align: 'center' });
    }
"""

if "confirmTransfer() {" in code:
    code = re.sub(r'    confirmTransfer\(\) \{[\s\S]*?\}\n', methods_to_insert, code)

with open('frontend/src/app/features/students/components/enrollment-list/enrollment-list.component.ts', 'w') as f:
    f.write(code)

print("enrollment-list.component.ts updated.")
