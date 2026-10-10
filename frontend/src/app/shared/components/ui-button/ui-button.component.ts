import { Component, EventEmitter, Input, Output } from '@angular/core';


export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonShape = 'rounded' | 'pill' | 'circle' | 'square';

@Component({
  selector: 'app-ui-button',
  standalone: true,
  imports: [],
  host: {
    '[class.w-full]': 'fullWidth'
  },
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      (click)="onClick($event)"
      [class]="buttonClasses">
    
      <!-- Loading Spinner -->
      @if (loading) {
        <svg class="animate-spin h-4 w-4 text-current" [class.mr-2]="!!label" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      }
    
      <!-- Content Projection for explicit custom SVGs -->
      <ng-content select="[icon]"></ng-content>
    
      <!-- Left Icon rendering (if no projected content used and loading is false) -->
      @if (!loading && icon && iconPosition === 'left') {
        <!-- File-based Icon (public/icons/f_*.svg) -->
        @if (isFileIcon(icon)) {
          <span
            class="w-5 h-5 inline-block bg-current transition-colors"
            [class.mr-2]="!!label"
            [style.mask]="'url(/icons/' + icon + '.svg) no-repeat center / contain'"
            [style.-webkit-mask]="'url(/icons/' + icon + '.svg) no-repeat center / contain'">
          </span>
        }
        <!-- Built-in or Custom Path Vector Icon -->
        @if (!isFileIcon(icon)) {
          <svg
            class="w-5 h-5 transition-colors"
            [class.mr-2]="!!label"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              [attr.d]="customIconPath || getBuiltInIconPath(icon)" />
          </svg>
        }
      }
    
      <!-- Label -->
      @if (label) {
        <span class="font-medium">{{ label }}</span>
      }
    
      <!-- Right Icon rendering -->
      @if (!loading && icon && iconPosition === 'right') {
        @if (isFileIcon(icon)) {
          <span
            class="w-5 h-5 inline-block bg-current transition-colors ml-2"
            [style.mask]="'url(/icons/' + icon + '.svg) no-repeat center / contain'"
            [style.-webkit-mask]="'url(/icons/' + icon + '.svg) no-repeat center / contain'">
          </span>
        }
        @if (!isFileIcon(icon)) {
          <svg
            class="w-5 h-5 ml-2 transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              [attr.d]="customIconPath || getBuiltInIconPath(icon)" />
          </svg>
        }
      }
    </button>
    `
})
export class UiButtonComponent {
  @Input() label?: string;
  @Input() icon?: string;
  @Input() customIconPath?: string;
  @Input() iconPosition: 'left' | 'right' = 'left';
  @Input() variant: ButtonVariant = 'secondary';
  @Input() size: ButtonSize = 'md';
  @Input() shape: ButtonShape = 'rounded';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() fullWidth: boolean = false;
  @Input() customClass: string = '';

  @Input() isActive: boolean = false;
  @Input() activeIcon?: string;

  @Output() btnClick = new EventEmitter<MouseEvent>();

  get effectiveIcon(): string | undefined {
    if (this.isActive && this.activeIcon) {
      return this.activeIcon;
    }
    return this.icon;
  }

  onClick(event: MouseEvent): void {
    if (!this.disabled && !this.loading) {
      this.btnClick.emit(event);
    }
  }

  isFileIcon(iconName?: string): boolean {
    const target = iconName || this.effectiveIcon;
    return !!target && target.startsWith('f_');
  }

  get buttonClasses(): string {
    const base = 'inline-flex items-center justify-center transition-all shadow-sm focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed group';
    
    // Sizes & Shapes
    let sizeShapeClass = '';
    if (this.shape === 'circle') {
      const circleSizes = {
        sm: 'w-8 h-8 rounded-full',
        md: 'w-10 h-10 rounded-full',
        lg: 'w-12 h-12 rounded-full'
      };
      sizeShapeClass = circleSizes[this.size] || circleSizes.md;
    } else {
      const radiusClass = {
        rounded: 'rounded-xl',
        pill: 'rounded-full',
        square: 'rounded-md'
      }[this.shape] || 'rounded-xl';

      const paddingClass = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2.5 text-sm',
        lg: 'px-5 py-3 text-base'
      }[this.size] || 'px-4 py-2.5 text-sm';

      sizeShapeClass = `${radiusClass} ${paddingClass}`;
    }

    // Variants
    const variantClasses: Record<ButtonVariant, string> = {
      primary: 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 focus:ring-indigo-500/30 border border-transparent shadow-indigo-500/20',
      secondary: 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 focus:ring-gray-200',
      success: 'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 focus:ring-emerald-500/30 border border-transparent shadow-emerald-500/20',
      danger: 'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 focus:ring-rose-500/30 border border-transparent shadow-rose-500/20',
      warning: 'bg-amber-500 text-white hover:bg-amber-600 active:bg-amber-700 focus:ring-amber-500/30 border border-transparent',
      info: 'bg-indigo-50 border border-indigo-100 text-indigo-600 hover:bg-indigo-100 focus:ring-indigo-200',
      ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-200'
    };

    const variantClass = variantClasses[this.variant] || variantClasses.secondary;
    const widthClass = this.fullWidth ? 'w-full' : '';

    return `${base} ${widthClass} ${sizeShapeClass} ${variantClass} ${this.customClass}`.trim();
  }

  getBuiltInIconPath(iconName?: string): string {
    const target = iconName || this.effectiveIcon;
    if (!target) return '';

    const paths: Record<string, string> = {
      import: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4',
      export: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12',
      download: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      plus: 'M12 4v16m8-8H4',
      search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
      filter: 'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z',
      edit: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
      trash: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
      delete: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
      check: 'M5 13l4 4L19 7',
      close: 'M6 18L18 6M6 6l12 12',
      cross: 'M6 18L18 6M6 6l12 12',
      eye: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
      show: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
      send: 'M2.01 21L23 12 2.01 3 2 10l15 2-15 2z',
      hamburger: 'M4 6h16M4 12h16M4 18h16',
      menu: 'M4 6h16M4 12h16M4 18h16',
      dots: 'M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z',
      kebab: 'M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z',
      refresh: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
      'arrow-left': 'M10 19l-7-7m0 0l7-7m-7 7h18',
      back: 'M10 19l-7-7m0 0l7-7m-7 7h18',
      'arrow-right': 'M14 5l7 7m0 0l-7 7m7-7H3',
      logout: 'M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1',
      file: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      bell: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'
    };

    return paths[target] || '';
  }

}
