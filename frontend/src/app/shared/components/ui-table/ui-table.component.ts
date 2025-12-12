import { Component, Input, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface UiTableColumn {
    header: string;
    key?: string;
    template?: TemplateRef<any>;
    className?: string;
}

@Component({
    selector: 'app-ui-table',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-100 border-b-2 border-gray-200">
          <tr>
            <th *ngFor="let col of columns" scope="col" 
                class="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider"
                [ngClass]="col.className || ''">
              {{ col.header }}
            </th>
            <th *ngIf="actionsTemplate" scope="col" class="relative px-6 py-4">
              <span class="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-100">
          <tr *ngFor="let item of data" class="hover:bg-indigo-50/30 transition-colors group">
            
            <td *ngFor="let col of columns" class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <ng-container *ngIf="col.template; else textCell">
                <ng-container *ngTemplateOutlet="col.template; context: { $implicit: item }"></ng-container>
              </ng-container>
              <ng-template #textCell>
                <div [ngClass]="col.className || ''">
                  {{ col.key ? item[col.key] : '' }}
                </div>
              </ng-template>
            </td>

            <td *ngIf="actionsTemplate" class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
              <ng-container *ngTemplateOutlet="actionsTemplate; context: { $implicit: item }"></ng-container>
            </td>

          </tr>
          
          <tr *ngIf="!data || data.length === 0">
            <td [attr.colspan]="columns.length + (actionsTemplate ? 1 : 0)" class="px-6 py-10 text-center text-gray-500 italic">
              Aucune donnée disponible.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class UiTableComponent {
    @Input() data: any[] = [];
    @Input() columns: UiTableColumn[] = [];
    @Input() actionsTemplate?: TemplateRef<any>;
}
