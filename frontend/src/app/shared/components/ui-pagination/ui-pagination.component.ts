import { Component, EventEmitter, Input, Output } from '@angular/core';


@Component({
  selector: 'app-ui-pagination',
  standalone: true,
  imports: [],
  template: `
    @if (totalCount > 0) {
      <div class="w-full select-none animate-in fade-in slide-in-from-bottom-2 duration-700">
        <div class="w-full flex items-center bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 p-1.5 gap-2 group/pagination">
          <!-- Stats Integration -->
          <div class="flex items-center px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 gap-4">
            <div class="flex flex-col min-w-[60px]">
              <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Total</span>
              <span class="text-xs font-bold text-slate-700">{{ totalCount }} <span class="text-[10px] font-medium text-slate-400 ml-0.5">items</span></span>
            </div>
            <div class="w-px h-6 bg-slate-200"></div>
            <div class="flex flex-col min-w-[40px]">
              <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Pages</span>
              <span class="text-xs font-bold text-slate-700 text-center">{{ numPages }}</span>
            </div>
          </div>
          <!-- Navigation Track (Centered) -->
          <div class="flex-1 flex items-center justify-center gap-1">
            <!-- Previous Button -->
            <button (click)="onPrev()" [disabled]="currentPage === 1"
              class="nav-trigger group/prev" [class.disabled]="currentPage === 1">
              <svg class="w-4 h-4 transition-transform group-hover/prev:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <!-- Pages Container -->
            <div class="flex items-center gap-1.5 px-4">
              @for (page of visiblePages; track page) {
                @if (page === -1) {
                  <span class="text-slate-300 font-bold px-1">...</span>
                }
                @if (page !== -1) {
                  <button
                    (click)="onGoTo(page)"
                    class="page-item"
                    [class.active]="page === currentPage">
                    {{ page }}
                    @if (page === currentPage) {
                      <div class="active-pill"></div>
                    }
                  </button>
                }
              }
            </div>
            <!-- Next Button -->
            <button (click)="onNext()" [disabled]="currentPage === numPages"
              class="nav-trigger group/next" [class.disabled]="currentPage === numPages">
              <svg class="w-4 h-4 transition-transform group-hover/next:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <!-- Current View Indicator -->
          <div class="flex items-center pr-2">
            <div class="page-indicator">
              <span class="text-slate-400 mr-1 uppercase">Vue</span>
              <span class="text-indigo-600 font-black">{{ currentPage }}</span>
              <span class="text-slate-300 mx-1">/</span>
              <span class="text-slate-500 font-bold">{{ numPages }}</span>
            </div>
          </div>
        </div>
      </div>
    }
    `,
  styles: [`
    .nav-trigger {
      width: 38px;
      height: 38px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      background: white;
      color: #64748b;
      border: 1px solid #f1f5f9;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .nav-trigger:hover:not(.disabled) {
      background: #f8fafc;
      color: #4f46e5;
      border-color: #e2e8f0;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }
    .nav-trigger.disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .page-item {
      position: relative;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      font-weight: 700;
      color: #94a3b8;
      border-radius: 10px;
      transition: all 0.3s ease;
    }
    .page-item:hover:not(.active) {
      color: #4f46e5;
      background: #f1f5f9;
    }
    .page-item.active {
      color: white;
      transform: translateY(-2px);
      z-index: 2;
    }

    .active-pill {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
      border-radius: 10px;
      z-index: -1;
      box-shadow: 0 8px 16px -4px rgba(79, 70, 229, 0.4);
      animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    @keyframes popIn {
      from { transform: scale(0.8); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    .page-indicator {
      font-size: 0.7rem;
      font-weight: 800;
      letter-spacing: 0.05em;
      padding: 0.5rem 1rem;
      background: #f8fafc;
      border-radius: 10px;
      border: 1px solid #f1f5f9;
      min-width: 100px;
      text-align: center;
    }
  `]
})
export class UiPaginationComponent {
    @Input() currentPage = 1;
    @Input() pageSize = 10;
    @Input() totalCount = 0;
    @Input() numPages = 0;

    @Output() prev = new EventEmitter<void>();
    @Output() next = new EventEmitter<void>();
    @Output() goTo = new EventEmitter<number>();

    get visiblePages(): number[] {
        const pages: number[] = [];
        const delta = 1;

        for (let i = 1; i <= this.numPages; i++) {
            if (i === 1 || i === this.numPages || (i >= this.currentPage - delta && i <= this.currentPage + delta)) {
                if (pages.length > 0 && i !== pages[pages.length - 1] + 1) pages.push(-1);
                pages.push(i);
            }
        }
        return pages;
    }

    onPrev() { if (this.currentPage > 1) this.prev.emit(); }
    onNext() { if (this.currentPage < this.numPages) this.next.emit(); }
    onGoTo(page: number) { if (page !== this.currentPage && page > 0) this.goTo.emit(page); }
}
