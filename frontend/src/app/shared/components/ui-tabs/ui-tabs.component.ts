import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Tab {
  id: string;
  label: string;
  icon?: string; // Raw SVG string
  hasError?: boolean;
}

@Component({
  selector: 'app-ui-tabs',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    :host { display: block; width: 100%; height: 100%; }
  `],
  template: `
    <div [class.flex]="layout === 'vertical'"
      [class.h-full]="layout === 'vertical'"
      [class.w-full]="layout === 'vertical'"
      class="min-h-0 min-w-0">
      <!-- Tab Navigation -->
      <div [class.border-b]="layout === 'horizontal'"
        [class.border-gray-200]="layout === 'horizontal'"
        [class.border-r]="layout === 'vertical'"
        [class.w-64]="layout === 'vertical'"
        [class.bg-slate-50]="layout === 'vertical'"
        [class.flex-shrink-0]="layout === 'vertical'"
        class="min-h-0">
    
        <nav [class.-mb-px]="layout === 'horizontal'"
          [class.flex]="layout === 'horizontal'"
          [class.space-x-8]="layout === 'horizontal'"
          [class.flex-col]="layout === 'vertical'"
          [class.space-y-1]="layout === 'vertical'"
          [class.p-4]="layout === 'vertical'"
          [class.h-full]="layout === 'vertical'"
          [class.overflow-y-auto]="layout === 'vertical'"
          aria-label="Tabs">
    
          @for (tab of tabs; track tab) {
            <button
              type="button"
              (click)="selectTab(tab)"
              [class.border-indigo-500]="activeTab() === tab.id && layout === 'horizontal'"
              [class.text-indigo-600]="activeTab() === tab.id"
              [class.bg-white]="activeTab() === tab.id && layout === 'vertical'"
              [class.shadow-sm]="activeTab() === tab.id && layout === 'vertical'"
              [class.border-indigo-600]="activeTab() === tab.id && layout === 'vertical'"
              [class.border-l-4]="layout === 'vertical'"
              [class.border-transparent]="activeTab() !== tab.id"
              [class.border-b-2]="layout === 'horizontal'"
              [class.text-gray-500]="activeTab() !== tab.id"
              [class.hover:text-gray-700]="activeTab() !== tab.id"
              [class.py-4]="layout === 'horizontal'"
              [class.px-1]="layout === 'horizontal'"
              [class.py-3]="layout === 'vertical'"
              [class.px-4]="layout === 'vertical'"
              [class.rounded-lg]="layout === 'vertical'"
              [class.text-left]="layout === 'vertical'"
              [class.w-full]="layout === 'vertical'"
              [ngClass]="activeTab() !== tab.id && layout === 'vertical' ? 'hover:bg-white/50' : ''"
              class="group inline-flex items-center font-semibold text-sm whitespace-nowrap transition-all duration-200">
              <!-- Icon Support -->
              @if (tab.icon) {
                <span [innerHTML]="tab.icon"
                  [class.text-indigo-600]="activeTab() === tab.id"
                  [class.text-slate-400]="activeTab() !== tab.id"
                class="mr-3 w-5 h-5 flex-shrink-0 transition-colors duration-200"></span>
              }
              <!-- Status Dot -->
              @if (tab.hasError) {
                <span
                  class="mr-2 w-2 h-2 bg-red-500 rounded-full inline-block"
                title="Erreur dans cet onglet"></span>
              }
              <span class="truncate">{{ tab.label }}</span>
              <!-- Active Indicator for Vertical -->
              @if (activeTab() === tab.id && layout === 'vertical') {
                <svg
                  class="ml-auto w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              }
            </button>
          }
        </nav>
      </div>
    
      <!-- Tab Content Area -->
      <div [class.mt-6]="layout === 'horizontal'"
        [class.flex-1]="layout === 'vertical'"
        [class.overflow-hidden]="layout === 'vertical'"
        [class.bg-white]="layout === 'vertical'"
        class="min-h-0 min-w-0">
        <ng-content></ng-content>
      </div>
    </div>
    `
})
export class UiTabsComponent {
  @Input() tabs: Tab[] = [];
  @Input() layout: 'horizontal' | 'vertical' = 'horizontal';
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
