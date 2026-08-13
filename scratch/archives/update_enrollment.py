import re

with open('frontend/src/app/features/students/components/enrollment-list/enrollment-list.component.ts', 'r') as f:
    code = f.read()

# 1. Update the ID Card icon in HTML
old_icon = """<button (click)="onPrintIdCard(item)" class="p-2 rounded-full text-blue-500 hover:bg-blue-50" title="Imprimer carte scolaire">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
            </button>"""

new_icon = """<button (click)="onPrintIdCard(item)" class="p-2 rounded-full text-blue-500 hover:bg-blue-50" title="Imprimer carte scolaire">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path></svg>
            </button>"""

code = code.replace(old_icon, new_icon)

# 2. Update onPrintCertificate method
old_print_cert = """    async onPrintCertificate(enrollment: any) {
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
            this.toastService.error('Erreur lors de la génération de l\'attestation');
        } finally {
            this.isLoading.set(false);
        }
    }"""

new_print_cert = """    async onPrintCertificate(enrollment: any) {
        this.isLoading.set(true);
        try {
            const estId = this.structureState.currentEstablishmentId();
            let establishment: any = null;
            if (estId) {
                const ests = await firstValueFrom(this.establishmentService.getAll());
                establishment = (ests.data as any)?.establishments?.items?.find((e: any) => e.id === estId);
            }

            const printData = {
                student: enrollment.student,
                enrollment: enrollment,
                establishment: establishment
            };
            localStorage.setItem('certificate_print_data', JSON.stringify(printData));
            window.open('/print/certificate', '_blank');
        } catch (err) {
            console.error('Print Error:', err);
            this.toastService.error('Erreur lors de la préparation de l\\'impression');
        } finally {
            this.isLoading.set(false);
        }
    }"""

code = code.replace(old_print_cert, new_print_cert)

# 3. Update onPrintIdCard method
old_print_idcard = """    async onPrintIdCard(enrollment: any) {
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
    }"""

new_print_idcard = """    async onPrintIdCard(enrollment: any) {
        this.isLoading.set(true);
        try {
            const estId = this.structureState.currentEstablishmentId();
            let establishment: any = null;
            if (estId) {
                const ests = await firstValueFrom(this.establishmentService.getAll());
                establishment = (ests.data as any)?.establishments?.items?.find((e: any) => e.id === estId);
            }

            const printData = {
                student: enrollment.student,
                enrollment: enrollment,
                establishment: establishment
            };
            localStorage.setItem('idcard_print_data', JSON.stringify(printData));
            window.open('/print/idcard', '_blank');
        } catch (err) {
            console.error('Print Error:', err);
            this.toastService.error('Erreur lors de la préparation de l\\'impression');
        } finally {
            this.isLoading.set(false);
        }
    }"""

code = code.replace(old_print_idcard, new_print_idcard)

# 4. Remove generateCertificate and generateIdCard methods
code = re.sub(r'    private generateCertificate\(.*?\}\n\n', '', code, flags=re.DOTALL)
code = re.sub(r'    private generateIdCard\(.*?\}\n\n', '', code, flags=re.DOTALL)

with open('frontend/src/app/features/students/components/enrollment-list/enrollment-list.component.ts', 'w') as f:
    f.write(code)

print("Updated enrollment list.")
