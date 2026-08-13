import re

with open('frontend/src/app/features/students/components/enrollment-list/enrollment-list.component.ts', 'r') as f:
    code = f.read()

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

old_confirm_transfer = """    confirmTransfer() {
        if (!this.selectedItem()) return;
        this.service.save({ id: this.selectedItem().id, status: 'LEFT' }).subscribe({
            next: () => {
                this.toastService.success('Départ enregistré avec succès');
                this.closeModal();
                this.refresh();
            },
            error: () => this.toastService.error('Erreur lors de l\\'opération')
        });
    }"""

if old_confirm_transfer in code:
    code = code.replace(old_confirm_transfer, methods_to_insert)

with open('frontend/src/app/features/students/components/enrollment-list/enrollment-list.component.ts', 'w') as f:
    f.write(code)

print("Methods replaced in enrollment-list.")
