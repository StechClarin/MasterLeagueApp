import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BulletinData } from '../../services/bulletin-data-builder';

@Component({
  selector: 'app-bulletin-print',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bulletin-print.component.html',
  styleUrls: ['./bulletin-print.component.css']
})
export class BulletinPrintComponent implements OnInit {
  bulletins = signal<BulletinData[]>([]);

  ngOnInit() {
    const data = localStorage.getItem('bulletin_print_data');
    if (data) {
      try {
        const parsed = JSON.parse(data) as BulletinData[];
        this.bulletins.set(parsed);
        // Automatically trigger print dialog after a short delay to allow images to load
        setTimeout(() => {
          window.print();
        }, 500);
      } catch (err) {
        console.error('Failed to parse bulletin print data', err);
      }
    }
  }

  getDecision(studentAvg: number): string {
    if (studentAvg >= 10) return 'Admis(e)';
    return 'Ajourné(e)';
  }

  getTotalCredits(ueGroups: any[]): number {
    return ueGroups.reduce((acc, ue) => acc + (ue.ueCredits || 0), 0);
  }

  getAcquiredCredits(ueGroups: any[]): number {
    return ueGroups.reduce((acc, ue) => acc + (ue.ueCreditsAcquired || 0), 0);
  }
}
