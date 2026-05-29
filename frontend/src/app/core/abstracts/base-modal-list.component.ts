import { Component, signal, inject, OnInit } from '@angular/core';
import { BaseListComponent } from './base-list.component';
import { LoggingService } from '../services/logging.service';

@Component({ template: '' })
export abstract class BaseModalListComponent<T> extends BaseListComponent<T> implements OnInit {

    protected logger = inject(LoggingService);
    protected componentName = this.constructor.name;

    // État de la modale
    isModalOpen = signal(false);
    modalMode = signal<'create' | 'edit' | 'detail' | 'delete' | 'clone'>('create');
    selectedItem = signal<T | null>(null);

    // État du menu d'actions (pour les listes qui ont un menu dropdown par ligne)
    activeMenuId = signal<string | number | null>(null);

    override ngOnInit() {
        super.ngOnInit();
        this.logger.logLifecycle(this.componentName, 'Initialized');
    }

    // --- Modal Management ---

    openModal(item: T | null = null, mode: 'create' | 'edit' | 'detail' | 'delete' | 'clone' = 'create') {
        this.logger.logAction(this.componentName, `Open Modal [${mode}]`, item);
        this.selectedItem.set(item);
        this.modalMode.set(mode);
        this.isModalOpen.set(true);
        this.closeMenu(); // Ferme le menu d'actions s'il était ouvert
    }

    closeModal() {
        this.logger.logAction(this.componentName, 'Close Modal');
        this.isModalOpen.set(false);
        this.selectedItem.set(null);
    }

    // --- Actions Standards ---

    onEdit(item: T) {
        this.logger.logAction(this.componentName, 'Click Edit', item);
        this.openModal(item, 'edit');
    }

    onClone(item: T) {
        this.logger.logAction(this.componentName, 'Click Clone', item);
        this.openModal(item, 'clone');
    }

    onDetails(item: T) {
        this.logger.logAction(this.componentName, 'Click Details', item);
        this.openModal(item, 'detail');
    }

    onDelete(item: T) {
        this.logger.logAction(this.componentName, 'Click Delete', item);
        this.openModal(item, 'delete');
    }

    // Callback appelé quand le formulaire enfant émet "success"
    onSave() {
        this.closeModal();
        this.refresh();
        const mode = this.modalMode();
        const action = (mode === 'create' || mode === 'clone') ? 'créé' : 'modifié';
        this.logger.logAction(this.componentName, `Save Success [${mode}]`);
        this.toastService.success(`Élément ${action} avec succès`);
    }

    // Logique de suppression standard
    confirmDelete() {
        const item = this.selectedItem();
        if (!item) return;

        // On suppose que l'item a un ID. 
        // Si T n'a pas d'ID garanti, il faudrait une interface (ex: Entity { id: any })
        const id = (item as any).id;

        if (!id) {
            console.error('Impossible de supprimer: ID manquant', item);
            return;
        }

        this.logger.logAction(this.componentName, 'Confirm Delete', { id });
        this.service.delete(id).subscribe({
            next: () => {
                this.toastService.success('Élément supprimé avec succès');
                this.refresh();
                this.closeModal();
            },
            error: (err: any) => {
                console.error('Erreur suppression', err);
                this.toastService.error('Erreur lors de la suppression');
            }
        });
    }

    // --- Menu Management ---

    toggleMenu(id: string | number, event?: Event) {
        if (event) event.stopPropagation();

        if (this.activeMenuId() === id) {
            this.closeMenu();
        } else {
            this.logger.logAction(this.componentName, 'Open Action Menu', { id });
            this.activeMenuId.set(id);
        }
    }

    closeMenu() {
        this.activeMenuId.set(null);
    }
}
