import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-idcard-print',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './idcard-print.component.html',
  styleUrls: ['./idcard-print.component.css']
})
export class IdcardPrintComponent implements OnInit {
  data = signal<any>(null);

  ngOnInit() {
    const rawData = localStorage.getItem('idcard_print_data');
    if (rawData) {
      try {
        const parsed = JSON.parse(rawData);
        this.data.set(parsed);
        // Automatically trigger print dialog after a short delay to allow images to load
        setTimeout(() => {
          window.print();
        }, 500);
      } catch (err) {
        console.error('Failed to parse id card print data', err);
      }
    }
  }

  getFullPhotoUrl(photoUrl: string | null | undefined): string | null {
    if (!photoUrl) return null;
    if (photoUrl.startsWith('http') || photoUrl.startsWith('data:')) return photoUrl;

    const baseUrl = environment.apiUrl.replace('/api', '');
    const cleanPath = photoUrl.startsWith('/') ? photoUrl.substring(1) : photoUrl;
    // Some backends return the path already containing 'media/', others don't.
    // If it already has media/, we shouldn't duplicate it.
    if (cleanPath.startsWith('media/')) {
        return `${baseUrl}/${cleanPath}`;
    }
    return `${baseUrl}/media/${cleanPath}`;
  }
}
