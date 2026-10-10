import { Component, Input, Output, EventEmitter, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiButtonComponent } from '../ui-button/ui-button.component';
import { UiDropdownComponent } from '../ui-dropdown/ui-dropdown.component';

export interface UiTableActionConfig {
  key: string;
  label?: string;
  icon?: string;
  customIconPath?: string;
  color?: string;
}

export type UiTableActionItem = 'show' | 'edit' | 'delete' | 'send' | UiTableActionConfig;

export interface UiTableColumn {
  header: string;
  key?: string;
  template?: TemplateRef<any>;
  className?: string;
  format?: (row: any) => string;
  sortable?: boolean;
  type?: 'text' | 'actions' | 'boolean';
  actions?: UiTableActionItem[];
}

@Component({
  selector: 'app-ui-table',
  standalone: true,
  imports: [CommonModule, UiButtonComponent, UiDropdownComponent],
  template: `
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-100 border-b-2 border-gray-200">
          <tr>
            @for (col of columns; track col) {
              <th scope="col"
                class="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider select-none"
                [ngClass]="{'cursor-pointer hover:bg-gray-200': col.sortable, 'text-right': col.type === 'actions'}"
                (click)="onSort(col)">
                <div class="flex items-center gap-1" [ngClass]="{'justify-end': col.type === 'actions'}">
                  {{ col.header }}
                  @if (col.sortable && sortField === col.key) {
                    <span class="text-indigo-600">
                      @if (sortDirection === 'asc') {
                        ↑
                      }
                      @if (sortDirection === 'desc') {
                        ↓
                      }
                    </span>
                  }
                </div>
              </th>
            }
            <!-- Legacy Actions Template Column -->
            @if (actionsTemplate) {
              <th scope="col" class="relative px-6 py-4">
                <span class="sr-only">Actions</span>
              </th>
            }
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-100">
          @for (item of data; track item; let i = $index) {
            <tr
              class="hover:bg-indigo-50/30 transition-colors group animate-in fade-in slide-in-from-bottom-1 duration-300"
              [style.animation-delay]="(i % 10) * 30 + 'ms'">
              @for (col of columns; track col) {
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <!-- Custom Template -->
                  @if (col.template) {
                    <ng-container *ngTemplateOutlet="col.template; context: { $implicit: item }"></ng-container>
                  } @else {
                    @if (col.type !== 'actions') {
                      <div [ngClass]="col.className || ''">
                        {{ col.format ? col.format(item) : (col.key ? item[col.key] : '') }}
                      </div>
                    } @else {
                      <div class="flex justify-end">
                        <app-ui-dropdown #dropdown>
                          <!-- Trigger Button (Hamburger morphing into Cross) -->
                          <app-ui-button
                            trigger
                            variant="ghost"
                            shape="circle"
                            size="sm"
                            [icon]="'hamburger'"
                            [activeIcon]="'cross'"
                            [isActive]="dropdown.isOpen"
                            customClass="text-gray-500 hover:text-indigo-600 hover:bg-indigo-50">
                          </app-ui-button>
                          <!-- Action Dropdown Items -->
                          <div menu class="py-1 min-w-[140px]">
                            @for (act of (col.actions || defaultActions); track act) {
                              <button
                                (click)="onTriggerAction(getActionConfig(act).key, item); dropdown.onClose()"
                                class="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2.5 transition-colors rounded-lg">
                                @if (getActionConfig(act).icon && isFileIcon(getActionConfig(act).icon)) {
                                  <span
                                    class="w-4 h-4 inline-block bg-current"
                                    [style.mask]="'url(/icons/' + getActionConfig(act).icon + '.svg) no-repeat center / contain'"
                                    [style.-webkit-mask]="'url(/icons/' + getActionConfig(act).icon + '.svg) no-repeat center / contain'">
                                  </span>
                                }
                                @if (getActionConfig(act).icon && !isFileIcon(getActionConfig(act).icon)) {
                                  <svg
                                    class="w-4 h-4 transition-colors"
                                    [ngClass]="getActionConfig(act).color || 'text-gray-500'"
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                      [attr.d]="getActionConfig(act).customIconPath || getBuiltInIconPath(getActionConfig(act).icon)" />
                                  </svg>
                                }
                                <span>{{ getActionConfig(act).label }}</span>
                              </button>
                            }
                          </div>
                        </app-ui-dropdown>
                      </div>
                    }
                  }
                  <!-- Format Function or Key Access -->
                  <!-- Dynamic Hamburger -> Cross Dropdown Actions -->
                </td>
              }
              <!-- Legacy Actions Template Cell -->
              @if (actionsTemplate) {
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                  <ng-container *ngTemplateOutlet="actionsTemplate; context: { $implicit: item }"></ng-container>
                </td>
              }
            </tr>
          }
    
          @if (!data || data.length === 0) {
            <tr>
              <td [attr.colspan]="columns.length + (actionsTemplate ? 1 : 0)" class="px-6 py-10 text-center text-gray-500 italic">
                Aucune donnée disponible.
              </td>
            </tr>
          }
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
  @Output() actionClick = new EventEmitter<{ action: string, item: any }>();

  defaultActions: UiTableActionItem[] = ['show', 'edit', 'delete'];

  onSort(col: UiTableColumn) {
    if (!col.sortable || !col.key) return;

    let direction = 'asc';
    if (this.sortField === col.key) {
      direction = this.sortDirection === 'asc' ? 'desc' : 'asc';
    }

    this.sort.emit({ field: col.key, direction });
  }

  getActionConfig(actionItem: UiTableActionItem): UiTableActionConfig {
    if (typeof actionItem === 'string') {
      const defaultConfig: Record<string, UiTableActionConfig> = {
        show: { key: 'show', label: 'Consulter', icon: 'show', color: 'text-indigo-600' },
        edit: { key: 'edit', label: 'Modifier', icon: 'edit', color: 'text-amber-600' },
        delete: { key: 'delete', label: 'Supprimer', icon: 'delete', color: 'text-rose-600' },
        send: { key: 'send', label: 'Envoyer', icon: 'send', color: 'text-blue-600' }
      };
      return defaultConfig[actionItem] || { key: actionItem, label: actionItem, icon: actionItem, color: 'text-gray-700' };
    }
    return actionItem;
  }

  isFileIcon(iconName?: string): boolean {
    return !!iconName && iconName.startsWith('f_');
  }

  getBuiltInIconPath(iconName?: string): string {
    if (!iconName) return '';
    const paths: Record<string, string> = {
      show: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
      edit: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
      delete: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
      send: 'M2.01 21L23 12 2.01 3 2 10l15 2-15 2z',
      check: 'M5 13l4 4L19 7',
      close: 'M6 18L18 6M6 6l12 12'
    };
    return paths[iconName] || '';
  }

  onTriggerAction(actionKey: string, item: any) {
    if (actionKey === 'edit') this.edit.emit(item);
    if (actionKey === 'delete') this.delete.emit(item);
    this.actionClick.emit({ action: actionKey, item });
  }
}

