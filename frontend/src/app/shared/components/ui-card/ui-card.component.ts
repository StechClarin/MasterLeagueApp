import { Component, Input } from '@angular/core';


@Component({
    selector: 'app-ui-card',
    standalone: true,
    imports: [],
    template: `
    <div class="bg-white rounded-xl shadow-xl border border-gray-200 max-w-2xl mx-auto overflow-hidden">
    
      <!-- Header -->
      <div class="bg-gradient-to-r from-slate-800 to-slate-900 p-8 text-white">
        <ng-content select="[header]"></ng-content>
      </div>
    
      <!-- Content -->
      <div class="p-8">
        <ng-content select="[content]"></ng-content>
      </div>
    
      <!-- Footer -->
      @if (hasFooter) {
        <div class="bg-gray-50 px-8 py-4 border-t border-gray-100 flex justify-end">
          <ng-content select="[footer]"></ng-content>
        </div>
      }
    
    </div>
    `
})
export class UiCardComponent {
    @Input() hasFooter = true;
}
