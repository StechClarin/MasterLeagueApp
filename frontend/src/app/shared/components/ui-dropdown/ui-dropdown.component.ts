import { Component, EventEmitter, Input, Output, ElementRef, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, query, stagger, group } from '@angular/animations';

@Component({
  selector: 'app-ui-dropdown',
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('dropdownAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        group([
          animate('200ms cubic-bezier(0.4, 0.0, 0.2, 1)', style({ opacity: 1, transform: 'scale(1)' })),
          query('button', [
            style({ opacity: 0, transform: 'translateX(20px)' }),
            stagger(50, [
              animate('300ms cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 1, transform: 'translateX(0)' }))
            ])
          ], { optional: true })
        ])
      ]),
      transition(':leave', [
        animate('150ms cubic-bezier(0.4, 0.0, 0.2, 1)', style({ opacity: 0, transform: 'scale(0.95)' }))
      ])
    ])
  ],
  template: `
    <div class="relative inline-block text-left">
      <!-- Trigger -->
      <div (click)="onToggle($event)">
        <ng-content select="[trigger]"></ng-content>
      </div>

      <!-- Menu (Backdrop removed) -->
      <div *ngIf="isOpen" 
           [@dropdownAnimation]
           [ngClass]="menuClasses">
        <div [class.py-1]="direction === 'vertical'" role="none" [class.flex]="direction === 'horizontal'" [class.gap-1]="direction === 'horizontal'">
            <ng-content select="[menu]"></ng-content>
        </div>
      </div>
    </div>
  `
})
export class UiDropdownComponent {
  @Input() isOpen = false;
  @Input() direction: 'vertical' | 'horizontal' = 'vertical';
  @Output() isOpenChange = new EventEmitter<boolean>();

  private elementRef = inject(ElementRef);

  get menuClasses(): string {
    if (this.direction === 'horizontal') {
      // On retire les classes d'animation Tailwind inutiles
      return 'absolute right-full top-0 mr-2 z-50 flex items-center p-1 rounded-full bg-white shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none';
    }
    return 'absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none';
  }

  onToggle(event: Event) {
    event.stopPropagation();
    this.isOpen = !this.isOpen;
    this.isOpenChange.emit(this.isOpen);
  }

  onClose(event?: Event) {
    if (event) event.stopPropagation();
    this.isOpen = false;
    this.isOpenChange.emit(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.isOpen) return;
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.isOpen = false;
      this.isOpenChange.emit(false);
    }
  }
}
