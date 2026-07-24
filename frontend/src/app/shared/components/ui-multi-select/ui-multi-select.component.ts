import { Component, Input, Output, EventEmitter, OnInit, ElementRef, HostListener, signal, computed, ViewChild, ChangeDetectorRef, OnChanges, SimpleChanges, Self, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormControl, NgControl, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
    selector: 'app-ui-multi-select',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <div class="mb-4 relative">
      <label *ngIf="label" class="block text-sm font-medium text-gray-700 mb-1">
        {{ label }} <span *ngIf="required" class="text-red-500">*</span>
      </label>

      <!-- Trigger Area -->
      <div 
        class="min-h-[42px] w-full px-3 py-2 bg-white border border-gray-300 rounded-xl shadow-sm cursor-pointer focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all"
        [class.ring-2]="isOpen()"
        [class.ring-indigo-500]="isOpen()"
        [class.border-indigo-500]="isOpen()"
        [class.bg-gray-50]="disabled"
        [class.cursor-not-allowed]="disabled"
        [class.opacity-75]="disabled"
        (click)="!disabled && toggleOpen()">
        
        <div class="flex flex-wrap gap-2 items-center">
            <span *ngIf="selectedObjects.length === 0" class="text-gray-400 text-sm">{{ placeholder }}</span>
            
            <!-- Chips -->
            <div *ngFor="let item of selectedObjects" class="bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-lg text-sm font-medium flex items-center gap-1">
                <span>{{ item[bindLabel] }}</span>
                <button type="button" *ngIf="!disabled" (click)="removeItem($event, item)" class="text-indigo-400 hover:text-indigo-900 rounded-full p-0.5 transition-colors">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
        </div>
        
         <!-- Chevron -->
         <div class="absolute right-3 top-[38px] pointer-events-none text-gray-400">
            <svg class="w-5 h-5 transition-transform duration-200" [class.rotate-180]="isOpen()" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
         </div>
      </div>

      <!-- Dropdown Menu -->
      <div *ngIf="isOpen()" class="absolute z-50 mt-1 w-full bg-white rounded-xl shadow-lg border border-gray-100 max-h-80 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
         <!-- Search Input -->
         <div class="p-2 border-b border-gray-100" *ngIf="isSearchable">
            <input 
              #searchInput
              type="text" 
              class="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              [placeholder]="searchPlaceholder"
              (input)="onSearch($event)"
              (click)="$event.stopPropagation()">
         </div>

         <!-- Options List -->
         <div class="overflow-y-auto max-h-64 py-1">
             <div *ngIf="isLoading" class="px-4 py-3 flex justify-center">
                <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
             </div>

             <div *ngIf="!isLoading && (!options || options.length === 0)" class="px-4 py-2 text-sm text-gray-500 italic">
              {{ emptyMessage }}
             </div>

             <!-- Select All Option -->
             <div *ngIf="showSelectAll && options && options.length > 0 && !groupBy" 
                  (click)="toggleSelectAll()"
                  class="px-4 py-2 border-b border-gray-50 hover:bg-gray-50 cursor-pointer text-sm flex items-center justify-between group transition-colors font-semibold text-indigo-600">
                  <span>{{ isAllSelected() ? 'Tout désélectionner' : 'Tout sélectionner' }}</span>
                  <div class="w-4 h-4 border-2 border-indigo-200 rounded flex items-center justify-center transition-colors"
                       [class.bg-indigo-600]="isAllSelected()"
                       [class.border-indigo-600]="isAllSelected()">
                       <svg *ngIf="isAllSelected()" class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                  </div>
             </div>
             
             <!-- Normal List -->
             <ng-container *ngIf="!groupBy">
                <div *ngFor="let option of options" 
                    (click)="toggleSelection(option)"
                    class="px-4 py-2 hover:bg-indigo-50 cursor-pointer text-sm flex items-center justify-between group transition-colors"
                    [class.bg-indigo-50]="isSelected(option)"
                    [class.text-indigo-700]="isSelected(option)"
                    [class.font-medium]="isSelected(option)">
                    
                    <div class="flex flex-col">
                        <span>{{ option[bindLabel] }}</span>
                        <span *ngIf="bindSubLabel && option[bindSubLabel]" class="text-[10px] text-gray-400">{{ option[bindSubLabel] }}</span>
                    </div>
                    
                    <svg *ngIf="isSelected(option)" class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
             </ng-container>

             <!-- Grouped List -->
             <ng-container *ngIf="groupBy">
                <div *ngFor="let group of groupedOptions" class="border-b border-gray-50 last:border-0">
                    <div class="px-4 py-2 bg-gray-50 flex items-center justify-between cursor-pointer group" (click)="toggleGroup(group)">
                        <div class="flex items-center gap-2">
                             <!-- Toggle Arrow -->
                             <svg class="w-4 h-4 text-gray-400 transition-transform" [class.rotate-90]="isGroupExpanded(group.key)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                             </svg>
                             <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">{{ group.key }}</span>
                        </div>
                        <!-- Group Checkbox -->
                        <div *ngIf="showSelectAll" 
                             (click)="toggleSelectAllGroup($event, group)"
                             class="w-4 h-4 border-2 border-gray-300 rounded flex items-center justify-center transition-colors hover:border-indigo-400"
                             [class.bg-indigo-600]="isGroupAllSelected(group)"
                             [class.border-indigo-600]="isGroupAllSelected(group)">
                             <svg *ngIf="isGroupAllSelected(group)" class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                    </div>
                    
                    <div *ngIf="isGroupExpanded(group.key)" class="animate-in slide-in-from-top-1 duration-150">
                        <div *ngFor="let option of group.items" 
                            (click)="toggleSelection(option)"
                            class="pl-10 pr-4 py-2 hover:bg-indigo-50 cursor-pointer text-sm flex items-center justify-between group transition-colors"
                            [class.bg-indigo-50]="isSelected(option)"
                            [class.text-indigo-700]="isSelected(option)">
                            
                            <div class="flex flex-col">
                                <span>{{ option[bindLabel] }}</span>
                                <span *ngIf="bindSubLabel && option[bindSubLabel]" class="text-[10px] text-gray-400">{{ option[bindSubLabel] }}</span>
                            </div>
                            
                            <svg *ngIf="isSelected(option)" class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                    </div>
                </div>
             </ng-container>
         </div>
      </div>

      <p *ngIf="hint" class="mt-1 text-sm text-gray-500">{{ hint }}</p>

      <div *ngIf="control.invalid && (control.dirty || control.touched)" class="text-red-600 text-sm mt-1">
        <div *ngIf="control.errors?.['required']">Ce champ est requis.</div>
        <div *ngIf="control.errors?.['serverError']">{{ control.errors?.['serverError'] }}</div>
      </div>
    </div>
  `
})
export class UiMultiSelectComponent implements ControlValueAccessor, OnInit, OnChanges {
    @Input() label: string = '';
    @Input() placeholder: string = 'Sélectionner...';
    @Input() set options(val: any[]) {
        this._options = val || [];
        this.updateGroupedOptions();
        this.syncSelectedObjects();
    }
    get options() { return this._options; }
    private _options: any[] = [];

    @Input() bindLabel: string = 'label';
    @Input() bindValue: string = 'value'; // value property of option to store
    @Input() required: boolean = false;
    @Input() hint: string = '';
    @Input() isSearchable: boolean = true;
    @Input() searchPlaceholder: string = 'Rechercher...';
    @Input() emptyMessage: string = 'Aucune option trouvée';
    @Input() isLoading: boolean = false;
    @Input() bindSubLabel: string = '';
    @Input() showSelectAll: boolean = false;
    @Input() groupBy: string = ''; // Key to group by

    @Output() search = new EventEmitter<string>();

    // Internal state
    isOpen = signal(false);
    expandedGroups = signal<Set<string>>(new Set());

    // Value stored in FormControl (array of values)
    value: any[] = [];
    selectedObjects: any[] = [];

    groupedOptions: { key: string, items: any[] }[] = [];
    disabled = false;

    onChange: any = () => { };
    onTouch: any = () => { };
    
    private searchSubject = new Subject<string>();

    @Input() control: FormControl = new FormControl();

    constructor(
        private elementRef: ElementRef, 
        private cdr: ChangeDetectorRef,
        @Self() @Optional() public ngControl?: NgControl
    ) { 
        if (this.ngControl) {
            this.ngControl.valueAccessor = this;
        }
    }

    ngOnInit() {
        this.searchSubject.pipe(
            debounceTime(300),
            distinctUntilChanged()
        ).subscribe(val => {
            this.search.emit(val);
        });

        this.control.valueChanges.subscribe(value => {
            this.value = value || [];
            this.syncSelectedObjects();
            this.onChange(value);
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['groupBy'] && !changes['options']) {
            this.updateGroupedOptions();
        }
    }

    private syncSelectedObjects() {
        if (!this.value || !this.options) return;
        
        // Match existing values with current options
        const matched = this.options.filter(o => this.value.includes(o[this.bindValue]));
        
        // Keep track of values already in selectedObjects but NOT in matched (to avoid losing async items)
        const currentMatchedValues = matched.map(m => m[this.bindValue]);
        const preserved = this.selectedObjects.filter(o => this.value.includes(o[this.bindValue]) && !currentMatchedValues.includes(o[this.bindValue]));
        
        this.selectedObjects = [...matched, ...preserved];
        this.cdr.detectChanges();
    }

    private updateGroupedOptions() {
        if (!this.groupBy || !this.options) {
            this.groupedOptions = [];
            return;
        }

        const groups = new Map<string, any[]>();
        this.options.forEach(opt => {
            const groupKey = opt[this.groupBy] || 'Autre';
            if (!groups.has(groupKey)) groups.set(groupKey, []);
            groups.get(groupKey)?.push(opt);
        });

        this.groupedOptions = Array.from(groups.entries()).map(([key, items]) => ({ key, items }));
        
        // Auto-expand all groups by default if they are few
        if (this.groupedOptions.length <= 5) {
            this.expandedGroups.set(new Set(this.groupedOptions.map(g => g.key)));
        }
    }

    onSearch(event: any) {
        this.searchSubject.next(event.target.value);
    }

    toggleOpen() {
        this.isOpen.update(v => !v);
        if (!this.isOpen()) {
            this.onTouch();
        }
    }

    toggleSelection(option: any) {
        const val = option[this.bindValue];
        const index = this.value.indexOf(val);

        if (index === -1) {
            this.value = [...this.value, val];
            this.selectedObjects = [...this.selectedObjects, option];
        } else {
            this.value = this.value.filter(v => v !== val);
            this.selectedObjects = this.selectedObjects.filter(o => o[this.bindValue] !== val);
        }

        this.onChange(this.value);
    }

    toggleSelectAll() {
        if (this.isAllSelected()) {
            const currentOptionValues = this.options.map(o => o[this.bindValue]);
            this.value = this.value.filter(v => !currentOptionValues.includes(v));
            this.selectedObjects = this.selectedObjects.filter(o => !currentOptionValues.includes(o[this.bindValue]));
        } else {
            this.options.forEach(option => {
                const val = option[this.bindValue];
                if (!this.value.includes(val)) {
                    this.value = [...this.value, val];
                    this.selectedObjects = [...this.selectedObjects, option];
                }
            });
        }
        this.onChange(this.value);
    }

    toggleSelectAllGroup(event: Event, group: any) {
        event.stopPropagation();
        const groupValues = group.items.map((o: any) => o[this.bindValue]);
        const allSelected = group.items.every((o: any) => this.value.includes(o[this.bindValue]));

        if (allSelected) {
            this.value = this.value.filter(v => !groupValues.includes(v));
            this.selectedObjects = this.selectedObjects.filter(o => !groupValues.includes(o[this.bindValue]));
        } else {
            group.items.forEach((option: any) => {
                const val = option[this.bindValue];
                if (!this.value.includes(val)) {
                    this.value = [...this.value, val];
                    this.selectedObjects = [...this.selectedObjects, option];
                }
            });
        }
        this.onChange(this.value);
    }

    isGroupAllSelected(group: any): boolean {
        if (!group.items || group.items.length === 0) return false;
        return group.items.every((o: any) => this.value.includes(o[this.bindValue]));
    }

    toggleGroup(group: any) {
        const current = new Set(this.expandedGroups());
        if (current.has(group.key)) current.delete(group.key);
        else current.add(group.key);
        this.expandedGroups.set(current);
    }

    isGroupExpanded(key: string): boolean {
        return this.expandedGroups().has(key);
    }

    isAllSelected(): boolean {
        if (!this.options || this.options.length === 0) return false;
        return this.options.every(option => this.value.includes(option[this.bindValue]));
    }

    isSelected(option: any): boolean {
        return this.value.includes(option[this.bindValue]);
    }

    removeItem(event: Event, item: any) {
        event.stopPropagation();
        this.toggleSelection(item);
    }

    @HostListener('document:click', ['$event'])
    onClickOutside(event: Event) {
        if (!this.elementRef.nativeElement.contains(event.target)) {
            this.isOpen.set(false);
            this.onTouch();
        }
    }

    writeValue(val: any[]): void {
        if (this.control.value !== val) {
            this.control.setValue(val, { emitEvent: false });
        }
        this.value = val || [];
        this.syncSelectedObjects();
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouch = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        isDisabled ? this.control.disable() : this.control.enable();
        this.disabled = isDisabled;
        this.cdr.markForCheck();
    }
}
