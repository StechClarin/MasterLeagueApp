import { Injectable, signal } from '@angular/core';

export interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
}

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    toasts = signal<Toast[]>([]);
    private counter = 0;
    private timeouts = new Map<number, any>();
    private remainingTimes = new Map<number, number>();
    private startTimes = new Map<number, number>();

    show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') {
        const id = this.counter++;
        this.toasts.update(current => [...current, { id, message, type }]);
        this.resume(id, 3000);
    }

    remove(id: number) {
        if (this.timeouts.has(id)) {
            clearTimeout(this.timeouts.get(id));
            this.timeouts.delete(id);
            this.remainingTimes.delete(id);
            this.startTimes.delete(id);
        }
        this.toasts.update(current => current.filter(t => t.id !== id));
    }

    pause(id: number) {
        if (this.timeouts.has(id)) {
            clearTimeout(this.timeouts.get(id));
            const elapsed = Date.now() - (this.startTimes.get(id) || Date.now());
            const remaining = (this.remainingTimes.get(id) || 3000) - elapsed;
            this.remainingTimes.set(id, remaining > 0 ? remaining : 0);
        }
    }

    resume(id: number, time?: number) {
        const remaining = time ?? this.remainingTimes.get(id) ?? 3000;
        this.startTimes.set(id, Date.now());
        this.remainingTimes.set(id, remaining);

        if (this.timeouts.has(id)) {
            clearTimeout(this.timeouts.get(id));
        }

        this.timeouts.set(id, setTimeout(() => {
            this.remove(id);
        }, remaining));
    }

    success(message: string) {
        this.show(message, 'success');
    }

    error(message: string) {
        this.show(message, 'error');
    }

    warning(message: string) {
        this.show(message, 'warning');
    }
}
