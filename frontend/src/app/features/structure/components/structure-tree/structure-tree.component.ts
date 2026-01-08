import { Component, inject, ViewChild, signal, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { CycleListComponent } from '../cycle-list/cycle-list.component';
import { LevelListComponent } from '../level-list/level-list.component';
import { UiListPageComponent } from '@shared/components/ui-list-page/ui-list-page.component';
import { UiToolbarComponent } from '@shared/components/ui-toolbar/ui-toolbar.component';
import { UiTabsComponent, Tab } from '@shared/components/ui-tabs/ui-tabs.component';
import { CycleFormComponent } from '../cycle-form/cycle-form.component';
import { LevelFormComponent } from '../level-form/level-form.component';
import { UiModalComponent } from '@shared/components/ui-modal/ui-modal.component';
import { UiConfirmModalComponent } from '@shared/components/ui-confirm-modal/ui-confirm-modal.component';
import { UiFilterPanelComponent } from '@shared/components/ui-filter-panel/ui-filter-panel.component';
import { UiPaginationComponent } from '@shared/components/ui-pagination/ui-pagination.component';

@Component({
    selector: 'app-structure-tree',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        CycleListComponent,
        LevelListComponent,
        UiListPageComponent,
        UiToolbarComponent,
        UiTabsComponent,
        CycleFormComponent,
        LevelFormComponent,
        UiModalComponent,
        UiConfirmModalComponent,
        UiFilterPanelComponent,
        UiPaginationComponent
    ],
    templateUrl: './structure-tree.component.html'
})
export class StructureTreeComponent implements AfterViewInit {
    private cdr = inject(ChangeDetectorRef);

    // Child Components References
    // Child Components References
    @ViewChild(CycleListComponent) cycleList?: CycleListComponent;
    @ViewChild(LevelListComponent) levelList?: LevelListComponent;

    // Tab State
    tabs: Tab[] = [
        { id: 'cycles', label: 'Cycles' },
        { id: 'levels', label: 'Niveaux' }
    ];
    activeTab = signal<string>('cycles'); // Default active tab

    // Toolbar State
    searchControl = new FormControl('');

    // Fallback form for initialization to prevent NG01052
    fallbackForm = new FormGroup({});

    // --- Tab Management ---
    onTabChange(tabId: string) {
        this.activeTab.set(tabId);
        this.searchControl.setValue(''); // Reset search on tab switch
    }

    ngAfterViewInit() {
        // Fix for NG0100: ExpressionChangedAfterItHasBeenCheckedError
        this.cdr.detectChanges();

        // Sync Global Search to Child Components
        this.searchControl.valueChanges.subscribe(val => {
            if (this.activeTab() === 'cycles') {
                this.cycleList?.searchControl.setValue(val);
            } else {
                this.levelList?.searchControl.setValue(val);
            }
        });
    }

    // --- Action Delegation ---
    // These methods are called by the main toolbar and delegate to the active child component

    onAdd() {
        if (this.activeTab() === 'cycles') {
            this.cycleList?.openModal();
        } else {
            this.levelList?.openModal(); // Or openLevelModal if strict signature
        }
    }

    onRefresh() {
        if (this.activeTab() === 'cycles') {
            this.cycleList?.refresh();
        } else {
            this.levelList?.refresh();
        }
    }



    onToggleFilters() {
        if (this.activeTab() === 'cycles') {
            this.cycleList?.toggleFilters();
        } else {
            this.levelList?.toggleFilters();
        }
    }

    isFiltersOpen(): boolean {
        const isOpen = this.activeTab() === 'cycles'
            ? this.cycleList?.isFiltersOpen()
            : this.levelList?.isFiltersOpen();
        return isOpen ?? false;
    }

    // --- Pagination Delegation ---
    onPrevPage() {
        if (this.activeTab() === 'cycles') {
            this.cycleList?.prevPage();
        } else {
            this.levelList?.prevPage();
        }
    }

    onNextPage() {
        if (this.activeTab() === 'cycles') {
            this.cycleList?.nextPage();
        } else {
            this.levelList?.nextPage();
        }
    }

    onGoToPage(page: number) {
        if (this.activeTab() === 'cycles') {
            this.cycleList?.goToPage(page);
        } else {
            this.levelList?.goToPage(page);
        }
    }

    // Helper for direct service calls if child component method access is tricky
    // But ideally child component should expose these methods (which they do via BaseList inheritance mostly)


}
