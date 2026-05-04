import { Component, Input, Output, EventEmitter, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface UiTableColumn {
  header: string;
  key?: string;
  template?: TemplateRef<any>;
  className?: string;
  format?: (row: any) => string;
  sortable?: boolean;
  type?: 'text' | 'actions' | 'boolean';
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
                class="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider select-none"
                [ngClass]="{'cursor-pointer hover:bg-gray-200': col.sortable, 'text-right': col.type === 'actions'}"
                (click)="onSort(col)">
              <div class="flex items-center gap-1" [ngClass]="{'justify-end': col.type === 'actions'}">
                {{ col.header }}
                <span *ngIf="col.sortable && sortField === col.key" class="text-indigo-600">
                  <ng-container *ngIf="sortDirection === 'asc'">↑</ng-container>
                  <ng-container *ngIf="sortDirection === 'desc'">↓</ng-container>
                </span>
              </div>
            </th>
            <!-- Legacy Actions Template Column -->
            <th *ngIf="actionsTemplate" scope="col" class="relative px-6 py-4">
              <span class="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-100">
          <tr *ngFor="let item of data; let i = index" 
              class="hover:bg-indigo-50/30 transition-colors group animate-in fade-in slide-in-from-bottom-1 duration-300"
              [style.animation-delay]="(i % 10) * 30 + 'ms'">
            
            <td *ngFor="let col of columns" class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              
              <!-- Custom Template -->
              <ng-container *ngIf="col.template; else formatCell">
                <ng-container *ngTemplateOutlet="col.template; context: { $implicit: item }"></ng-container>
              </ng-container>

              <!-- Format Function or Key Access -->
              <ng-template #formatCell>
                <ng-container *ngIf="col.type !== 'actions'; else actionsCellInternal">
                    <div [ngClass]="col.className || ''">
                    {{ col.format ? col.format(item) : (col.key ? item[col.key] : '') }}
                    </div>
                </ng-container>
              </ng-template>

              <!-- Default Actions (Internal Column Type) -->
              <ng-template #actionsCellInternal>
                 <div class="flex justify-end gap-2">
                    <button (click)="edit.emit(item)" class="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 p-2 rounded-full transition-colors" title="Modifier">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    </button>
                    <button (click)="delete.emit(item)" class="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-2 rounded-full transition-colors" title="Supprimer">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                 </div>
              </ng-template>

            </td>

            <!-- Legacy Actions Template Cell -->
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
  @Input() data: any[] | null = [];
  @Input() columns: UiTableColumn[] = [];
  @Input() actionsTemplate?: TemplateRef<any>;

  @Input() sortField = '';
  @Input() sortDirection = 'asc';

  @Output() sort = new EventEmitter<{ field: string, direction: string }>();
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();

  onSort(col: UiTableColumn) {
    if (!col.sortable || !col.key) return;

    let direction = 'asc';
    if (this.sortField === col.key) {
      direction = this.sortDirection === 'asc' ? 'desc' : 'asc';
    }

    this.sort.emit({ field: col.key, direction });
  }
}
