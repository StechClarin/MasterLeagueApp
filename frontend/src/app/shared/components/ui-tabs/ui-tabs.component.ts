import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Tab {
  id: string;
  label: string;
  hasError?: boolean;
}

@Component({
  selector: 'app-ui-tabs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="border-b border-gray-200">
      <nav class="-mb-px flex space-x-8" aria-label="Tabs">
        <button *ngFor="let tab of tabs" 
                type="button"
                (click)="selectTab(tab)"
                [class.border-indigo-500]="activeTab() === tab.id"
                [class.text-indigo-600]="activeTab() === tab.id"
                [class.border-transparent]="activeTab() !== tab.id"
                [class.text-gray-500]="activeTab() !== tab.id"
                [class.hover:text-gray-700]="activeTab() !== tab.id"
                [class.hover:border-gray-300]="activeTab() !== tab.id"
                class="group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200">
          
          <!-- Icon / Status -->
          <span *ngIf="tab.hasError" 
                class="mr-2 w-2 h-2 bg-red-500 rounded-full inline-block"
                title="Erreur dans cet onglet"></span>
          
          {{ tab.label }}
        </button>
      </nav>
    </div>

    <div class="mt-6">
      <ng-content></ng-content>
    </div>
  `
})
export class UiTabsComponent {
  @Input() tabs: Tab[] = [];
  @Input() set currentTab(value: string) {
    this.activeTab.set(value);
  }

  @Output() tabChange = new EventEmitter<string>();

  activeTab = signal<string>('');

  selectTab(tab: Tab) {
    this.activeTab.set(tab.id);
    this.tabChange.emit(tab.id);
  }
}
