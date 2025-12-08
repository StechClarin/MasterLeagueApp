import { Component, OnInit, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { map, take, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { BaseListComponent } from '@core/abstracts/base-list.component';
import { User } from '../../models/user.model';
// import { GET_ALL_ROLES } from '../../graphql/user.queries'; // REMOVED
import { UserActions, selectUserFilters } from '../../store/user/user.store';
import { UserFormComponent } from '../user-form/user-form.component';
import { UserDetailComponent } from '../user-detail/user-detail.component';
import { UserService } from '../../services/user.service';
import { RoleService } from '../../services/role.service';
import { UiModalComponent } from '@shared/components/ui-modal/ui-modal.component';
import { ToastService } from '@core/services/toast.service';
import { UiPaginationComponent } from '@shared/components/ui-pagination/ui-pagination.component';

import { UiDropdownComponent } from '@shared/components/ui-dropdown/ui-dropdown.component';
import { UiStatusBadgeComponent } from '@shared/components/ui-status-badge/ui-status-badge.component';
import { UiAvatarComponent } from '@shared/components/ui-avatar/ui-avatar.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UserFormComponent, UiModalComponent, UiPaginationComponent, UiDropdownComponent, UiStatusBadgeComponent, UiAvatarComponent, UserDetailComponent],
  templateUrl: './user-list.component.html'
})
export class UserListComponent extends BaseListComponent<User> implements OnInit, OnDestroy {
  // ... existing code ...

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // query = GET_ALL_USERS; // REMOVED
  query = inject(UserService).getQuery(); // Dynamic Query
  responseKey = 'users';

  private store = inject(Store);

  // Utilisateur sélectionné pour édition
  selectedUser = signal<User | null>(null);

  // État de la modale
  isModalOpen = signal(false);
  modalMode = signal<'create' | 'edit' | 'detail' | 'delete'>('create');

  // État du menu d'actions (ID de l'utilisateur dont le menu est ouvert)
  activeMenuId = signal<string | null>(null);

  // Contrôles de formulaire pour les filtres
  protected Math = Math;
  searchControl = new FormControl('');
  isFiltersOpen = signal(false);

  private destroy$ = new Subject<void>();

  openModal(user: User | null = null, mode: 'create' | 'edit' | 'detail' | 'delete' = 'create') {
    this.selectedUser.set(user);
    this.modalMode.set(mode);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.selectedUser.set(null);
  }

  // Gestion du menu d'actions
  toggleMenu(userId: string, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    if (this.activeMenuId() === userId) {
      this.closeMenu();
    } else {
      this.activeMenuId.set(userId);
    }
  }

  closeMenu() {
    this.activeMenuId.set(null);
  }

  // Actions
  onEdit(user: User) {
    this.closeMenu();
    this.openModal(user, 'edit');
  }

  public service = inject(UserService); // Public pour être accessible par le template si besoin
  private roleService = inject(RoleService); // Injected here for use in ngOnInit
  // private toastService = inject(ToastService); // Déjà dans BaseListComponent

  onSeeMore(user: User) {
    console.log('See more user:', user);
    this.closeMenu();
    this.openModal(user, 'detail');
  }

  onDelete(user: User) {
    this.closeMenu();
    this.openModal(user, 'delete');
  }

  confirmDelete() {
    const user = this.selectedUser();
    if (!user) return;

    this.service.delete(user.id).subscribe({
      next: () => {
        this.refresh();
        this.closeModal();
        this.toastService.success(`Utilisateur ${user.username} supprimé avec succès.`);
      },
      error: (err) => {
        console.error('Erreur lors de la suppression', err);
        this.toastService.error('Une erreur est survenue lors de la suppression.');
      }
    });
  }

  onUserCreated() {
    this.closeModal();
    this.refresh(); // On recharge la liste pour voir le nouvel utilisateur
    this.toastService.success('Utilisateur enregistré avec succès.');
  }

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

  initFilterForm(): FormGroup {
    return this.fb.group({
      username: [''], // Mappé au searchControl via sync
      email: [''],
      role: ['']
    });
  }

  // Pagination state and methods are now inherited from BaseListComponent

  override ngOnInit(): void {
    // 0. Initialiser le formulaire AVANT tout le reste
    this.filterForm = this.initFilterForm();

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