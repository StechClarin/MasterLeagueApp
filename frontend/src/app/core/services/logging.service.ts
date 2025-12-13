import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class LoggingService {

    constructor() { }

    private formatTime(): string {
        const now = new Date();
        return now.toLocaleTimeString() + '.' + now.getMilliseconds().toString().padStart(3, '0');
    }

    logNavigation(url: string) {
        console.groupCollapsed(`%c[NAVIG] ${this.formatTime()} -> ${url}`, 'color: #2563eb; font-weight: bold;');
        console.log('Navigated to:', url);
        console.groupEnd();
    }

    logAction(context: string, action: string, details?: any) {
        console.groupCollapsed(`%c[ACTION] ${this.formatTime()} [${context}] ${action}`, 'color: #16a34a; font-weight: bold;');
        if (details) {
            console.log('Details:', details);
        }
        console.groupEnd();
    }

    logApi(method: string, url: string, status: 'START' | 'SUCCESS' | 'ERROR', data?: any) {
        const color = status === 'ERROR' ? '#dc2626' : (status === 'SUCCESS' ? '#059669' : '#d97706');
        const icon = status === 'START' ? '⏳' : (status === 'SUCCESS' ? '✅' : '❌');

        console.groupCollapsed(`%c[API] ${this.formatTime()} ${icon} ${method} ${url}`, `color: ${color}; font-weight: bold;`);
        if (data) {
            console.log('Payload/Response:', data);
        }
        console.groupEnd();
    }

    logLifecycle(context: string, event: string) {
        console.log(`%c[LIFE] ${this.formatTime()} [${context}] ${event}`, 'color: #9333ea; font-style: italic;');
    }
}
