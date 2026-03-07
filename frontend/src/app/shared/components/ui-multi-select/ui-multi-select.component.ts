import { Component, Input, OnInit, ElementRef, HostListener, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormControl, NgControl, ReactiveFormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

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
      <div *ngIf="isOpen()" class="absolute z-50 mt-1 w-full bg-white rounded-xl shadow-lg border border-gray-100 max-h-60 overflow-auto py-1 animate-in fade-in slide-in-from-top-2 duration-200">
         <div *ngIf="!options || options.length === 0" class="px-4 py-2 text-sm text-gray-500 italic">Aucune option disponible</div>
         
         <div *ngFor="let option of options" 
              (click)="toggleSelection(option)"
              class="px-4 py-2.5 hover:bg-indigo-50 cursor-pointer text-sm flex items-center justify-between group transition-colors"
              [class.bg-indigo-50]="isSelected(option)"
              [class.text-indigo-700]="isSelected(option)"
              [class.font-medium]="isSelected(option)">
              
              <span>{{ option[bindLabel] }}</span>
              
              <svg *ngIf="isSelected(option)" class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
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

    // Internal state
    isOpen = signal(false);

    // Value stored in FormControl (array of values)
    value: any[] = [];

    onChange: any = () => { };
    onTouch: any = () => { };

    constructor(private elementRef: ElementRef) { }

    ngOnInit() { }

    // Logic for UI display (mapping values back to options)
    getSelectedItems() {
        if (!this.value || this.value.length === 0) return [];
        if (!this.options) return [];
        // Map stored values to full option objects for display
        return this.options.filter(opt => this.value.includes(opt[this.bindValue]));
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
        } else {
            // Remove
            this.value = this.value.filter(v => v !== val);
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
