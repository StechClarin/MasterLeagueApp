import { Component, signal } from '@angular/core';
import { BaseListComponent } from './base-list.component';

@Component({ template: '' })
export abstract class BaseModalListComponent<T> extends BaseListComponent<T> {

    // État de la modale
    isModalOpen = signal(false);
    modalMode = signal<'create' | 'edit' | 'detail' | 'delete'>('create');
    selectedItem = signal<T | null>(null);

    // État du menu d'actions (pour les listes qui ont un menu dropdown par ligne)
    activeMenuId = signal<string | number | null>(null);

    // --- Modal Management ---

    openModal(item: T | null = null, mode: 'create' | 'edit' | 'detail' | 'delete' = 'create') {
        this.selectedItem.set(item);
        this.modalMode.set(mode);
        this.isModalOpen.set(true);
        this.closeMenu(); // Ferme le menu d'actions s'il était ouvert
    }

    closeModal() {
        this.isModalOpen.set(false);
        this.selectedItem.set(null);
    }

    // --- Actions Standards ---

    onEdit(item: T) {
        this.openModal(item, 'edit');
    }

    onDetails(item: T) {
        this.openModal(item, 'detail');
    }

    onDelete(item: T) {
        this.openModal(item, 'delete');
    }

    // Callback appelé quand le formulaire enfant émet "success"
    onSave() {
        this.closeModal();
        this.refresh();
        const mode = this.modalMode();
        const action = mode === 'create' ? 'créé' : 'modifié';
        // Note: On pourrait rendre le message plus dynamique si besoin
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
            this.activeMenuId.set(id);
        }
    }

    closeMenu() {
        this.activeMenuId.set(null);
    }
}
