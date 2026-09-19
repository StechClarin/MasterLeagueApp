import { Injectable, inject, signal } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { firstValueFrom } from 'rxjs';
import { GET_SIDEBAR_MODULES } from '../../layout/components/sidebar/sidebar.queries';

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
  async fetchModules(force: boolean = false): Promise<any[]> {
    // Si on a déjà chargé et qu'on ne force pas, on sort
    if (this.modules().length > 0 && !force) {
        return this.modules();
    }

    this.isLoading.set(true);
    
    try {
        const res = await firstValueFrom(
            this.apollo.query<any>({
                query: GET_SIDEBAR_MODULES,
                fetchPolicy: 'network-only'
            })
        );

        const items = res?.data?.modules || [];
        this.modules.set(items);
        return items;
    } catch (error) {
        console.error('[ModuleState] Erreur lors du chargement des modules:', error);
        return [];
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
