import { Injectable, inject, signal } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { GET_SIDEBAR_MODULES } from '../../layout/components/sidebar/sidebar.queries';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ModuleStateService {
  private apollo = inject(Apollo);

  // Status du chargement
  readonly isLoading = signal<boolean>(false);
  
  // Liste des modules centralisée
  readonly modules = signal<any[]>([]);

  /**
   * Charge les modules depuis le backend. 
   * Si force est à false et qu'on a déjà des données, on ne refait pas la requête.
   */
  async fetchModules(force: boolean = false): Promise<void> {
    // Si on a déjà chargé et qu'on ne force pas, on sort
    if (this.modules().length > 0 && !force) {
        return;
    }

    this.isLoading.set(true);
    
    try {
        const result = await new Promise<any>((resolve, reject) => {
            this.apollo.watchQuery<any>({
                query: GET_SIDEBAR_MODULES,
                fetchPolicy: 'network-only' // Toujours frais pour le service central
            }).valueChanges.pipe(
                map(res => res.data.modules || [])
            ).subscribe({
                next: (items) => resolve(items),
                error: (err) => reject(err)
            });
        });

        this.modules.set(result);
    } catch (error) {
        console.error('[ModuleState] Erreur lors du chargement des modules:', error);
    } finally {
        this.isLoading.set(false);
    }
  }

  /**
   * Vide l'état (utile au logout)
   */
  clear() {
    this.modules.set([]);
    this.isLoading.set(false);
  }
}
