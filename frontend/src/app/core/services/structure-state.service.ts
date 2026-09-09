import { Injectable, signal, effect, inject } from '@angular/core';
import { GetAllEstablishmentsGQL } from '../../features/structure/graphql/structure.generated';
import { GetMeGQL } from '../../features/profilmanagement/graphql/profil.generated';
import { firstValueFrom } from 'rxjs';
import { EstablishmentType } from '@app/graphql/types';
import { AuthService } from './auth.service';
import { PermissionService } from './permission.service';

/** Nombre d'établissements récupérés par requête (le resolver par défaut n'en renvoie que 10). */
const ESTABLISHMENTS_PAGE_SIZE = 100;
/** Garde-fou anti-boucle infinie si le serveur renvoyait une pagination incohérente. */
const MAX_ESTABLISHMENT_PAGES = 100;

@Injectable({
    providedIn: 'root'
})
export class StructureStateService {
    private getAllEstablishmentsGQL = inject(GetAllEstablishmentsGQL);
    private getMeGQL = inject(GetMeGQL);
    private auth = inject(AuthService);
    private permissionService = inject(PermissionService);

    // Signal pour l'ID de l'établissement sélectionné
    readonly currentEstablishmentId = signal<string | null>(this.getInitialId());
    
    // Signal pour la liste des établissements
    readonly establishments = signal<any[]>([]);
    readonly isLoading = signal<boolean>(false);

    // Signal pour le rôle contextuel de l'utilisateur
    readonly currentUserRole = signal<string>('Admin');

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
            this.fetchCurrentUserRole();
        }
    }

    async fetchEstablishments(): Promise<void> {
        this.isLoading.set(true);
        const userId = this.auth.getUserId();

        try {
            // Le resolver GraphQL `establishments` pagine par défaut à 10 éléments/page.
            // On boucle sur TOUTES les pages pour que l'intégralité des établissements
            // soit disponible (grille de sélection de l'accueil, sélecteur du header...).
            const seen = new Set<string>();
            const all: any[] = [];
            let page = 1;
            let numPages = 1;

            do {
                const res = await firstValueFrom(
                    this.getAllEstablishmentsGQL.fetch(
                        { userId, page, pageSize: ESTABLISHMENTS_PAGE_SIZE },
                        { fetchPolicy: 'network-only' },
                    ),
                );

                const meta = res?.data?.establishments;
                (meta?.items ?? []).forEach((item: any) => {
                    if (item?.id && !seen.has(String(item.id))) {
                        seen.add(String(item.id));
                        all.push(item);
                    }
                });

                numPages = meta?.numPages ?? page;
                page += 1;
            } while (page <= numPages && page <= MAX_ESTABLISHMENT_PAGES);

            this.onEstablishmentsLoaded(all);
        } catch (error) {
            console.error('[StructureState] Erreur chargement des établissements:', error);
            this.establishments.set([]);
            this.isLoading.set(false);
        }
    }

    private onEstablishmentsLoaded(items: any[]): void {
        this.establishments.set(items);
        this.isLoading.set(false);

        const currentId = this.currentEstablishmentId();
        const firstEstablishmentId = items[0]?.id ?? null;

        // Si on a un ID mais qu'il n'est plus dans la liste (ex: changement de compte)
        if (currentId && !items.find((i: any) => i?.id === currentId)) {
            console.log('[StructureState] ID invalid ou obsolète, reset.');
            this.setEstablishment(null);
        }

        // Auto-sélection si unique
        if (items.length === 1 && firstEstablishmentId && !this.currentEstablishmentId()) {
            console.log('[StructureState] Auto-selection unique site:', firstEstablishmentId);
            this.setEstablishment(firstEstablishmentId);
        }

        // Bypass pour l'administrateur technique 'ethernanos'
        const username = this.auth.getUsername();
        if (username?.toLowerCase() === 'ethernanos' && firstEstablishmentId && !this.currentEstablishmentId()) {
            console.log('[StructureState] Admin master détecté, sélection automatique du premier établissement.');
            this.setEstablishment(firstEstablishmentId);
        }
    }

    setEstablishment(id: string | null) {
        console.log('[StructureState] Changement établissement:', id);
        this.currentEstablishmentId.set(id);
        this.fetchCurrentUserRole();
    }

    fetchCurrentUserRole() {
        const username = this.auth.getUsername();
        if (username?.toLowerCase() === 'ethernanos') {
            this.currentUserRole.set('Super Admin');
            this.permissionService.setPermissions([]);
            return;
        }

        this.getMeGQL.fetch({}, { fetchPolicy: 'network-only' }).subscribe({
            next: (res) => {
                const roles = res.data?.me?.roles || [];
                const permissions: string[] = [];
                roles.forEach((role: any) => {
                    if (role?.permissions) {
                        role.permissions.forEach((perm: any) => {
                            if (perm?.codename) {
                                permissions.push(perm.codename);
                            }
                        });
                    }
                });
                this.permissionService.setPermissions(permissions);

                if (roles.length > 0) {
                    const roleName = roles.map((r: any) => r?.name).filter(Boolean).join(', ');
                    this.currentUserRole.set(roleName || 'Utilisateur');
                } else {
                    this.currentUserRole.set('Utilisateur');
                }
            },
            error: (err) => {
                console.error('[StructureState] Erreur lors de la récupération du rôle:', err);
                this.currentUserRole.set('Admin');
                this.permissionService.setPermissions([]);
            }
        });
    }

    private getInitialId(): string | null {
        return localStorage.getItem('currentEstablishmentId');
    }
}
