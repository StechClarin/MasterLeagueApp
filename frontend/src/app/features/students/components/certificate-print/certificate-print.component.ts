import { Component, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-certificate-print',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './certificate-print.component.html',
  styleUrls: ['./certificate-print.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class CertificatePrintComponent implements OnInit {
  data = signal<any>(null);
  currentDate = new Date();

  ngOnInit() {
    const rawData = localStorage.getItem('certificate_print_data');
    if (rawData) {
      try {
        const parsed = JSON.parse(rawData);
        this.data.set(parsed);
        // Automatically trigger print dialog after a short delay to allow images to load
        setTimeout(() => {
          window.print();
        }, 500);
      } catch (err) {
        console.error('Failed to parse certificate print data', err);
      }
    }
  }
}
