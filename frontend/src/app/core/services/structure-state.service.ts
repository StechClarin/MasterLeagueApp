import { Injectable, signal, effect, inject } from '@angular/core';
import { GetAllEstablishmentsGQL } from '../../features/structure/graphql/structure.generated';
import { map, tap } from 'rxjs/operators';
import { EstablishmentType } from '@app/graphql/types';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class StructureStateService {
    private getAllEstablishmentsGQL = inject(GetAllEstablishmentsGQL);
    private auth = inject(AuthService);

    // Signal pour l'ID de l'établissement sélectionné
    readonly currentEstablishmentId = signal<string | null>(this.getInitialId());
    
    // Signal pour la liste des établissements
    readonly establishments = signal<any[]>([]);
    readonly isLoading = signal<boolean>(false);

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

        // Charger les établissements au démarrage (seulement si connecté)
        if (localStorage.getItem('access_token')) {
            this.fetchEstablishments();
        }
    }

    fetchEstablishments() {
        this.isLoading.set(true);
        const userId = this.auth.getUserId();

        this.getAllEstablishmentsGQL.watch(
            { userId: userId }, 
            { fetchPolicy: 'network-only' }
        ).valueChanges.pipe(
            map(res => res.data.establishments?.items || []),
            tap(items => {
                this.establishments.set(items);
                this.isLoading.set(false);

                const currentId = this.currentEstablishmentId();
                
                // Si on a un ID mais qu'il n'est plus dans la liste (ex: changement de compte)
                if (currentId && !items.find((i: any) => i?.id === currentId)) {
                    console.log('[StructureState] ID invalid ou obsolète, reset.');
                    this.setEstablishment(null);
                }

                // Auto-sélection si unique
                if (items.length === 1 && items[0]?.id && !this.currentEstablishmentId()) {
                    console.log('[StructureState] Auto-selection unique site:', items[0].id);
                    this.setEstablishment(items[0].id);
                }
            })
        ).subscribe();
    }

    setEstablishment(id: string | null) {
        console.log('[StructureState] Changement établissement:', id);
        this.currentEstablishmentId.set(id);
    }

    private getInitialId(): string | null {
        return localStorage.getItem('currentEstablishmentId');
    }
}
