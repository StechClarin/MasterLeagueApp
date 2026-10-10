import { Component, Input } from '@angular/core';


@Component({
    selector: 'app-ui-status-badge',
    standalone: true,
    imports: [],
    template: `
    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border"
      [class]="isActive 
        ? 'bg-green-50 text-green-700 border-green-200' 
        : 'bg-gray-100 text-gray-600 border-gray-200'">
      <span class="w-2 h-2 rounded-full mr-2" [class]="isActive ? 'bg-green-500' : 'bg-gray-400'"></span>
      {{ isActive ? activeLabel : inactiveLabel }}
    </span>
  `
})
export class UiStatusBadgeComponent {
    @Input() isActive: boolean = false;
    @Input() activeLabel: string = 'Actif';
    @Input() inactiveLabel: string = 'Inactif';
}
