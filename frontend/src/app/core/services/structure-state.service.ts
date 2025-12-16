import { Injectable, signal, effect } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class StructureStateService {
    // Signal pour l'ID de l'établissement sélectionné
    readonly currentEstablishmentId = signal<string | null>(this.getInitialId());

    constructor() {
        // Effet pour synchroniser avec le localStorage à chaque changement
        effect(() => {
            const id = this.currentEstablishmentId();
            if (id) {
                localStorage.setItem('currentEstablishmentId', id);
            } else {
                localStorage.removeItem('currentEstablishmentId');
            }
        });
    }

    setEstablishment(id: string | null) {
        console.log('[StructureState] Changement    setEstablishment(id: string | null)');
        console.log('[StructureState] Changement établissement:', id);
        this.currentEstablishmentId.set(id);
    }

    private getInitialId(): string | null {
        return localStorage.getItem('currentEstablishmentId');
    }
}
