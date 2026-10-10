import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../models/user.model';
import { UiAvatarComponent } from '@shared/components/ui-avatar/ui-avatar.component';
import { UiStatusBadgeComponent } from '@shared/components/ui-status-badge/ui-status-badge.component';
import { UiButtonComponent } from '@shared/components/ui-button/ui-button.component';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, UiAvatarComponent, UiStatusBadgeComponent, UiButtonComponent],
  templateUrl: './user-detail.component.html'
})
export class UserDetailComponent {
  @Input() user: User | null = null;
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }

  isSuperUser(): boolean {
    return this.user?.roles?.some(r => r.name === 'Admin' || r.name === 'SuperUser') || false;
  }

  getRoleBadgeClass(roleName: string): string {
    if (roleName === 'Admin' || roleName === 'SuperUser') {
      return 'bg-purple-100 text-purple-700 border-purple-200';
    } else if (roleName === 'Enseignant') {
      return 'bg-blue-100 text-blue-700 border-blue-200';
    } else if (roleName === 'Élève') {
      return 'bg-green-100 text-green-700 border-green-200';
    } else {
      return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  }
}
