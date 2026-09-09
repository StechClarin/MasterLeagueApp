import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-personnel-contract-print',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './personnel-contract-print.component.html',
    styles: [`
        :host { display: block; background: #fff; }
        .contract-sheet { max-width: 820px; margin: 0 auto; padding: 48px 56px; color: #111; font-family: Georgia, 'Times New Roman', serif; font-size: 14px; line-height: 1.6; }
        .sign-line { border-top: 1px solid #111; }
        @media print {
            :host { padding: 0; }
            .toolbar, .no-print { display: none !important; }
            .contract-sheet { max-width: 100%; padding: 12px; }
        }
    `]
})
export class PersonnelContractPrintComponent implements OnInit {
    data: any = null;

    ngOnInit() {
        try {
            this.data = JSON.parse(localStorage.getItem('personnel_contract_print_data') || 'null');
        } catch {
            this.data = null;
        }
        // Impression automatique une fois le document rendu
        if (this.data) {
            setTimeout(() => window.print(), 600);
        }
    }

    printNow() {
        window.print();
    }

    fullName(): string {
        const p = this.data?.personnel || {};
        return `${p.firstName || ''} ${p.lastName || ''}`.trim() || '........................';
    }

    paymentLabel(): string {
        const mode = this.data?.contract?.paymentMode;
        return mode === 'POINTAGE'
            ? 'Rémunération horaire (pointage)'
            : 'Salaire brut mensuel';
    }

    paymentDetail(): string {
        const c = this.data?.contract || {};
        if (c.paymentMode === 'POINTAGE') {
            return c.hourlyRate ? `${c.hourlyRate} FCFA / heure` : '........................ FCFA / heure';
        }
        return c.grossSalary ? `${c.grossSalary} FCFA / mois` : '........................ FCFA / mois';
    }

    formatDate(value: string | null): string {
        if (!value) return '........................';
        try { return new Date(value).toLocaleDateString('fr-FR'); } catch { return String(value); }
    }

    generatedDate(): string {
        try { return new Date(this.data?.generatedAt).toLocaleDateString('fr-FR'); } catch { return ''; }
    }
}
