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

export interface EstablishmentOption {
    id: string;
    name: string;
    city?: string | null;
    country?: string | null;
}

/**
 * Composant UI réutilisable de sélection d'établissement avec recherche distante.
 */
@Component({
    selector: 'app-ui-establishment-selector',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './ui-establishment-selector.component.html',
})
export class UiEstablishmentSelectorComponent implements OnInit, OnDestroy {
    public structureState = inject(StructureStateService);
    private getAllEstablishmentsGQL = inject(GetAllEstablishmentsGQL);

    @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

    isOpen = signal(false);
    isSearching = signal(false);
    searchText = signal('');
    remoteResults = signal<EstablishmentOption[]>([]);
    highlightedIndex = signal(-1);

    private search$ = new Subject<string>();
    private destroy$ = new Subject<void>();

    known = computed<EstablishmentOption[]>(() => {
        const map = new Map<string, EstablishmentOption>();
        (this.structureState.establishments() ?? []).forEach((e: any) => {
            if (e?.id) map.set(String(e.id), { id: String(e.id), name: e.name, city: e.city ?? null, country: e.country ?? null });
        });
        this.remoteResults().forEach((e) => map.set(String(e.id), e));
        return [...map.values()];
    });

    filteredOptions = computed<EstablishmentOption[]>(() => {
        const term = this.searchText().trim();
        if (!term) return this.known();
        return this.remoteResults();
    });

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

    selectedLabel = computed<string>(() => {
        const id = this.structureState.currentEstablishmentId();
        if (!id) return 'Tous les établissements';
        return this.known().find((e) => String(e.id) === String(id))?.name ?? 'Tous les établissements';
    });

    constructor() {
        this.search$
            .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
            .subscribe((term) => this.runRemoteSearch(term));
    }

    ngOnInit(): void {
        if (!this.structureState.isLoading() && this.structureState.establishments().length === 0) {
            this.structureState.fetchEstablishments();
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

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
