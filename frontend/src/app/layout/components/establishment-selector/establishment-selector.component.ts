import {
    Component,
    ElementRef,
    HostListener,
    OnDestroy,
    OnInit,
    ViewChild,
    computed,
    inject,
    signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { StructureStateService } from '@core/services/structure-state.service';
import { GetAllEstablishmentsGQL } from '@features/structure/graphql/structure.generated';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, takeUntil } from 'rxjs/operators';

/** Option affichée dans le menu déroulant du sélecteur. */
export interface EstablishmentOption {
    id: string;
    name: string;
    city?: string | null;
    country?: string | null;
}

/**
 * Sélecteur d'établissement « distant » (combobox).
 *
 * Remplaçant du <select> natif : on peut saisir le nom d'un établissement pour
 * lancer une recherche distante (GraphQL `establishments(search: ...)`) et la
 * liste est déroulante / scrollable.
 */
@Component({
    selector: 'app-establishment-selector',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './establishment-selector.component.html',
})
export class EstablishmentSelectorComponent implements OnInit, OnDestroy {
    public structureState = inject(StructureStateService);
    private getAllEstablishmentsGQL = inject(GetAllEstablishmentsGQL);

    @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

    // --- État UI (signals) ---
    isOpen = signal(false);
    isSearching = signal(false);
    searchText = signal('');
    remoteResults = signal<EstablishmentOption[]>([]);
    /** Index dans `list()` (0 = « Tous les établissements »). */
    highlightedIndex = signal(-1);

    private search$ = new Subject<string>();
    private destroy$ = new Subject<void>();

    /**
     * Tous les établissements connus (cache local de StructureStateService +
     * résultats de la recherche distante). Sert au libellé de la sélection.
     */
    known = computed<EstablishmentOption[]>(() => {
        const map = new Map<string, EstablishmentOption>();
        (this.structureState.establishments() ?? []).forEach((e: any) => {
            if (e?.id) map.set(String(e.id), { id: String(e.id), name: e.name, city: e.city ?? null, country: e.country ?? null });
        });
        this.remoteResults().forEach((e) => map.set(String(e.id), e));
        return [...map.values()];
    });

    /** Options filtrées affichées quand la recherche est active. */
    filteredOptions = computed<EstablishmentOption[]>(() => {
        const term = this.searchText().trim();
        if (!term) return this.known();
        return this.remoteResults();
    });

    /** Liste complète (ligne « Tous les établissements » + options). */
    list = computed<Array<{ id: string | null; name: string; city?: string | null; country?: string | null }>>(() => {
        return [
            { id: null, name: 'Tous les établissements' },
            ...this.filteredOptions().map((opt) => ({
                id: opt.id,
                name: opt.name,
                city: opt.city ?? null,
                country: opt.country ?? null,
            })),
        ];
    });

    /** Libellé affiché sur le bouton déclencheur. */
    selectedLabel = computed<string>(() => {
        const id = this.structureState.currentEstablishmentId();
        if (!id) return 'Tous les établissements';
        return this.known().find((e) => String(e.id) === String(id))?.name ?? 'Tous les établissements';
    });

    constructor() {
        // Recherche distante debouncée (300 ms) sur la saisie utilisateur
        this.search$
            .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
            .subscribe((term) => this.runRemoteSearch(term));
    }

    ngOnInit(): void {
        // Si le cache local est vide ET qu'aucun fetch n'est en cours, on rafraîchit
        // (évite de lancer une 2e requête si StructureStateService charge déjà).
        if (!this.structureState.isLoading() && this.structureState.establishments().length === 0) {
            this.structureState.fetchEstablishments();
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    // --- Ouverture / fermeture ---

    toggleOpen(): void {
        if (this.isOpen()) {
            this.close();
        } else {
            this.open();
        }
    }

    open(): void {
        this.isOpen.set(true);
        this.searchText.set('');
        this.remoteResults.set([]);
        this.highlightedIndex.set(-1);
        // Focus l'input au prochain tick (le DOM du menu vient d'apparaître)
        setTimeout(() => this.searchInput?.nativeElement?.focus(), 0);
    }

    close(): void {
        this.isOpen.set(false);
        this.highlightedIndex.set(-1);
    }

    @HostListener('document:click', ['$event'])
    onClickOutside(event: MouseEvent): void {
        if (this.isOpen() && !(event.target as HTMLElement)?.closest('.establishment-selector-root')) {
            this.close();
        }
    }

    @HostListener('document:keydown.escape', ['$event'])
    onEscape(): void {
        this.close();
    }

    // --- Saisie ---

    onSearchInput(event: Event): void {
        const value = (event.target as HTMLInputElement).value;
        this.searchText.set(value);
        this.highlightedIndex.set(0);
        this.search$.next(value);
    }

    private runRemoteSearch(term: string): void {
        const query = term.trim();
        if (!query) {
            this.remoteResults.set([]);
            this.isSearching.set(false);
            return;
        }
        this.isSearching.set(true);
        this.getAllEstablishmentsGQL
            .fetch(
                { search: query, page: 1, pageSize: 50 },
                { fetchPolicy: 'network-only' },
            )
            .pipe(
                map((res) => res.data?.establishments?.items ?? []),
                takeUntil(this.destroy$),
            )
            .subscribe({
                next: (items) => {
                    this.remoteResults.set(
                        items
                            .filter((e): e is NonNullable<typeof e> => !!e?.id)
                            .map((e) => ({
                                id: String(e.id),
                                name: e.name,
                                city: e.city ?? null,
                                country: e.country ?? null,
                            })),
                    );
                    this.isSearching.set(false);
                    this.highlightedIndex.set(0);
                },
                error: () => {
                    this.remoteResults.set([]);
                    this.isSearching.set(false);
                },
            });
    }

    // --- Sélection ---

    selectId(id: string | null): void {
        this.structureState.setEstablishment(id);
        this.close();
    }

    onListKeydown(event: KeyboardEvent): void {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            this.highlightedIndex.update((i) => (i >= this.list().length - 1 ? 0 : i + 1));
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            this.highlightedIndex.update((i) => (i <= 0 ? this.list().length - 1 : i - 1));
        } else if (event.key === 'Enter') {
            event.preventDefault();
            const item = this.list()[this.highlightedIndex()];
            if (item) this.selectId(item.id);
        }
    }
}

