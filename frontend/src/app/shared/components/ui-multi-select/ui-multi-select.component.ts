import { Component, Input, Output, EventEmitter, OnInit, ElementRef, HostListener, signal, computed, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormControl, NgControl, ReactiveFormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
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
        (click)="toggleOpen()">
        
        <div class="flex flex-wrap gap-2 items-center">
            <span *ngIf="getSelectedItems().length === 0" class="text-gray-400 text-sm">{{ placeholder }}</span>
            
            <!-- Chips -->
            <div *ngFor="let item of getSelectedItems()" class="bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-lg text-sm font-medium flex items-center gap-1">
                <span>{{ item[bindLabel] }}</span>
                <button type="button" (click)="removeItem($event, item)" class="text-indigo-400 hover:text-indigo-900 rounded-full p-0.5 transition-colors">
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
      <div *ngIf="isOpen()" class="absolute z-50 mt-1 w-full bg-white rounded-xl shadow-lg border border-gray-100 max-h-72 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
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
         <div class="overflow-y-auto max-h-60 py-1">
             <div *ngIf="isLoading" class="px-4 py-3 flex justify-center">
                <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
             </div>

             <div *ngIf="!isLoading && (!options || options.length === 0)" class="px-4 py-2 text-sm text-gray-500 italic">
                {{ emptyMessage }}
             </div>
             
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
         </div>
      </div>

      <p *ngIf="hint" class="mt-1 text-sm text-gray-500">{{ hint }}</p>
    </div>
  `,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: UiMultiSelectComponent,
            multi: true
        }
    ]
})
export class UiMultiSelectComponent implements ControlValueAccessor, OnInit {
    @Input() label: string = '';
    @Input() placeholder: string = 'Sélectionner...';
    @Input() options: any[] = [];
    @Input() bindLabel: string = 'label';
    @Input() bindValue: string = 'value'; // value property of option to store
    @Input() required: boolean = false;
    @Input() hint: string = '';
    @Input() isSearchable: boolean = true;
    @Input() searchPlaceholder: string = 'Rechercher...';
    @Input() emptyMessage: string = 'Aucune option trouvée';
    @Input() isLoading: boolean = false;
    @Input() bindSubLabel: string = '';

    @Output() search = new EventEmitter<string>();

    // Internal state
    isOpen = signal(false);

    // Value stored in FormControl (array of values)
    value: any[] = [];

    onChange: any = () => { };
    onTouch: any = () => { };
    
    // To keep track of selected objects (important for async search where current options might change)
    selectedObjects: any[] = [];
    
    private searchSubject = new Subject<string>();

    constructor(private elementRef: ElementRef, private cdr: ChangeDetectorRef) { }

    ngOnInit() {
        this.searchSubject.pipe(
            debounceTime(300),
            distinctUntilChanged()
        ).subscribe(val => {
            this.search.emit(val);
        });
    }

    // Logic for UI display (mapping values back to options)
    getSelectedItems() {
        return this.selectedObjects;
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
            // Add
            this.value = [...this.value, val];
            this.selectedObjects = [...this.selectedObjects, option];
        } else {
            // Remove
            this.value = this.value.filter(v => v !== val);
            this.selectedObjects = this.selectedObjects.filter(o => o[this.bindValue] !== val);
        }

        this.onChange(this.value);
    }

    isSelected(option: any): boolean {
        return this.value.includes(option[this.bindValue]);
    }

    removeItem(event: Event, item: any) {
        event.stopPropagation(); // Prevent dropdown toggle
        this.toggleSelection(item);
    }

    // Close on click outside
    @HostListener('document:click', ['$event'])
    onClickOutside(event: Event) {
        if (!this.elementRef.nativeElement.contains(event.target)) {
            this.isOpen.set(false);
            this.onTouch();
        }
    }

    // ControlValueAccessor implementation
    writeValue(val: any[]): void {
        if (val) {
            this.value = val;
        } else {
            this.value = [];
        }
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouch = fn;
    }
}
