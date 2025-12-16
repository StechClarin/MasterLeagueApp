import { Component, OnInit, inject, OnDestroy, signal, ViewChild, TemplateRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { map, take, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { BaseModalListComponent } from '@core/abstracts/base-modal-list.component';
import { User } from '../../models/user.model';
import { UserActions, selectUserFilters } from '../../store/user/user.store';
import { UserFormComponent } from '../user-form/user-form.component';
import { UserDetailComponent } from '../user-detail/user-detail.component';
import { UserService } from '../../services/user.service';
import { RoleService } from '../../services/role.service';
import { UiModalComponent } from '@shared/components/ui-modal/ui-modal.component';
import { UiPaginationComponent } from '@shared/components/ui-pagination/ui-pagination.component';

import { UiDropdownComponent } from '@shared/components/ui-dropdown/ui-dropdown.component';
import { UiStatusBadgeComponent } from '@shared/components/ui-status-badge/ui-status-badge.component';
import { UiAvatarComponent } from '@shared/components/ui-avatar/ui-avatar.component';
import { UiListPageComponent } from '@shared/components/ui-list-page/ui-list-page.component';
import { UiExportModalComponent } from '@shared/components/ui-export-modal/ui-export-modal.component';
import { UiToolbarComponent } from '@shared/components/ui-toolbar/ui-toolbar.component';
import { UiFilterPanelComponent } from '@shared/components/ui-filter-panel/ui-filter-panel.component';
import { UiConfirmModalComponent } from '@shared/components/ui-confirm-modal/ui-confirm-modal.component';
import { UiTableComponent, UiTableColumn } from '@shared/components/ui-table/ui-table.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UserFormComponent, UiModalComponent, UiPaginationComponent, UiDropdownComponent, UiStatusBadgeComponent, UiAvatarComponent, UserDetailComponent, UiListPageComponent, UiExportModalComponent, UiToolbarComponent, UiFilterPanelComponent, UiConfirmModalComponent, UiTableComponent],
  templateUrl: './user-list.component.html'
})
export class UserListComponent extends BaseModalListComponent<User> implements OnInit, OnDestroy, AfterViewInit {

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  query = inject(UserService).getQuery(); // Dynamic Query
  responseKey = 'users';

  private store = inject(Store);

  // Contrôles de formulaire pour les filtres
  protected Math = Math;
  searchControl = new FormControl('');
  isFiltersOpen = signal(false);

  private destroy$ = new Subject<void>();

  public service = inject(UserService); // Public pour être accessible par le template si besoin
  private roleService = inject(RoleService); // Injected here for use in ngOnInit

  // === Import / Export (DRY Pattern) ===

  /**
   * Méthode générique pour gérer les opérations de fichiers (import/export)
   * Respecte le principe DRY en évitant la duplication de code
   */
  private handleFileOperation(
    operation: 'import' | 'export',
    serviceMethod: () => Observable<any>,
    successMessage: string
  ) {
    this.isLoading.set(true);

    serviceMethod().subscribe({
      next: (response) => {
        if (operation === 'export') {
          // Pour l'export, on télécharge le fichier
          this.downloadFile(response);
        } else {
          // Pour l'import, on rafraîchit la liste
          this.refresh();
        }
        this.toastService.success(successMessage);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(`Erreur lors de l'${operation}`, err);
        this.toastService.error(`Une erreur est survenue lors de l'${operation}.`);
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Gère l'import d'utilisateurs depuis un fichier CSV/Excel
   */
  onImport() {
    // Créer un input file invisible
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx,.xls';

    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (!file) return;

      this.handleFileOperation(
        'import',
        () => this.service.import(file),
        `${file.name} importé avec succès.`
      );
    };

    input.click();
  }

  /**
   * Télécharge le modèle d'import
   */
  onDownloadTemplate() {
    this.handleFileOperation(
      'export', // On réutilise la logique d'export (téléchargement)
      () => this.service.downloadTemplate(),
      'Modèle téléchargé avec succès.'
    );
  }

  /**
   * Télécharge un fichier blob
   */
  private downloadFile(blob: Blob) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `users_export_${new Date().toISOString().split('T')[0]}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
  }


  roles$!: Observable<any[]>;

  // Templates for custom columns
  @ViewChild('userCell') userCell!: TemplateRef<any>;
  @ViewChild('roleCell') roleCell!: TemplateRef<any>;
  @ViewChild('statusCell') statusCell!: TemplateRef<any>;
  @ViewChild('dateCell') dateCell!: TemplateRef<any>;
  @ViewChild('actionsCell') actionsCell!: TemplateRef<any>;

  tableColumns: UiTableColumn[] = [];

  initFilterForm(): FormGroup {
    return this.fb.group({
      username: [''], // Mappé au searchControl via sync
      email: [''],
      role: [''],
      status_active: [false],
      status_inactive: [false]
    });
  }

  protected override getFilterVariables(): any {
    const values = { ...this.filterForm.value };

    // Map checkboxes to isActive boolean
    if (values.status_active && !values.status_inactive) {
      values.isActive = true;
    } else if (!values.status_active && values.status_inactive) {
      values.isActive = false;
    }

    delete values.status_active;
    delete values.status_inactive;

    return values;
  }

  override ngOnInit(): void {
    // 0. Initialiser le formulaire AVANT tout le reste
    this.filterForm = this.initFilterForm();

    // Initialize table columns
    // We need to do this in ngAfterViewInit normally to access ViewChilds, 
    // but since we pass templates to the child component, we can define the structure here 
    // and the templates will be resolved when passed to the input.
    // However, ViewChilds are only available after view init.
    // So we'll initialize columns in ngAfterViewInit.

    // Charger les rôles pour le filtre
    this.roles$ = this.apollo.watchQuery<any>({
      query: this.roleService.getQuery()
    }).valueChanges.pipe(
      map(result => result.data.roles)
    );

    // 1. Restauration des filtres depuis le Store (AVANT d'initialiser la query)
    console.log('[UserListComponent] Waiting for filters...');
    this.store.select(selectUserFilters).pipe(take(1)).subscribe(filters => {
      console.log('[UserListComponent] Filters received:', filters);
      if (filters && Object.keys(filters).length > 0) {
        console.log("⚡ Filtres restaurés:", filters);
        this.filterForm.patchValue(filters, { emitEvent: false });
      }

      // 2. Initialisation de la requête (QueryRef) une fois les filtres appliqués
      console.log('[UserListComponent] Initializing query...');
      this.initQuery();
    });

    // 4. Synchro Search Input -> Store
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(value => {
      this.filterForm.patchValue({ username: value }, { emitEvent: false });
      this.dispatchFilters();
    });

    // 5. Synchro Filtres Avancés -> Store
    this.filterForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.dispatchFilters();
    });
  }

  dispatchFilters() {
    const filters = this.filterForm.value;
    this.store.dispatch(UserActions.setFilters({ filters }));
    this.currentPage.set(1); // Reset page on filter change
    this.refresh();
  }

  toggleFilters() {
    this.isFiltersOpen.update(v => !v);
  }

  private cdr = inject(ChangeDetectorRef);

  ngAfterViewInit() {
    // Initialize columns once templates are available
    setTimeout(() => {
      this.tableColumns = [
        { header: 'Utilisateur', template: this.userCell },
        { header: 'Rôle', template: this.roleCell },
        { header: 'Statut', template: this.statusCell },
        { header: 'Date d\'inscription', template: this.dateCell }
      ];
      this.cdr.detectChanges(); // Force view update
    });
  }

  resetFilters() {
    this.searchControl.setValue('');
    this.filterForm.reset();
  }

  override refresh() {
    this.store.dispatch(UserActions.setFilters({ filters: this.filterForm.value }));
    super.refresh();
  }

  // Configuration de l'export PDF
  protected override getExportConfig() {
    return {
      title: 'Liste des Utilisateurs',
      columns: [
        { header: 'Utilisateur', key: 'username' },
        { header: 'Email', key: 'email' },
        {
          header: 'Rôle',
          key: 'roles',
          format: (roles: any[]) => roles && roles.length > 0 ? roles.map(r => r.name).join(', ') : 'Aucun'
        },
        {
          header: 'Statut',
          key: 'isActive',
          format: (isActive: boolean) => isActive ? 'Actif' : 'Inactif'
        },
        {
          header: 'Date d\'inscription',
          key: 'dateJoined',
          format: (date: string) => new Date(date).toLocaleDateString('fr-FR')
        }
      ]
    };
  }
}