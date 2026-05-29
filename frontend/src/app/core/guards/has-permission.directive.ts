import { Directive, Input, TemplateRef, ViewContainerRef, inject, effect } from '@angular/core';
import { PermissionService } from '../services/permission.service';

@Directive({
  selector: '[appHasPermission]',
  standalone: true
})
export class HasPermissionDirective {
  private permissionService = inject(PermissionService);
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);

  private hasView = false;
  private requiredPermission: string = '';

  @Input() set appHasPermission(permission: string) {
    this.requiredPermission = permission;
    this.updateView();
  }

  constructor() {
    // Effet réactif Angular : se déclenche à chaque modification des permissions actives
    effect(() => {
      this.permissionService.activePermissions(); // Dépendance réactive implicite
      this.updateView();
    });
  }

  private updateView() {
    if (!this.requiredPermission) {
      this.showTemplate();
      return;
    }

    const hasPerm = this.permissionService.hasPermission(this.requiredPermission);

    if (hasPerm && !this.hasView) {
      this.showTemplate();
    } else if (!hasPerm && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }

  private showTemplate() {
    this.viewContainer.clear();
    this.viewContainer.createEmbeddedView(this.templateRef);
    this.hasView = true;
  }
}
