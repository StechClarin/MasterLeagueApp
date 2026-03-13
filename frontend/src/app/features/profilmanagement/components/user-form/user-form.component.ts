import { Component, inject, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { UiInputComponent } from '@shared/components/ui-input/ui-input.component';
import { UiFormComponent } from '@shared/components/ui-form/ui-form.component';
import { UiMediaInputComponent } from '@shared/components/ui-media-input/ui-media-input.component';
import { UiMultiSelectComponent } from '@shared/components/ui-multi-select/ui-multi-select.component';
import { UserService } from '../../services/user.service';
import { RoleService } from '../../services/role.service';
import { BaseModalFormComponent } from '@core/abstracts/base-modal-form.component';
import { User } from '../../models/user.model';
import { CustomValidators } from '@core/validators/custom-validators';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UiInputComponent, UiFormComponent, UiMediaInputComponent, UiMultiSelectComponent],
  template: `
    <app-ui-form [formErrors]="formErrors"
      [title]="user ? 'Modifier l\\'Utilisateur' : 'Nouvel Utilisateur'"
      [formGroup]="form"
      [isLoading]="isSubmitting"
      [errorMessage]="errorMessage"
      [submitLabel]="user ? 'Modifier' : 'Créer'"
      (submitForm)="onSubmit()"
      (cancel)="onCancel()">

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        
        <div class="col-span-1 md:col-span-2 flex justify-center mb-4">
            <app-ui-media-input
                formControlName="photo"
                shape="circle"
                size="md"
                label="Photo de profil"
            ></app-ui-media-input>
        </div>

        <app-ui-input
          label="Nom d'utilisateur"
          [control]="getControl('username')"
          [required]="true"
          placeholder="ex: jdupont"
        ></app-ui-input>

        <app-ui-input
          label="Email professionnel"
          type="email"
          [control]="getControl('email')"
          [required]="true"
          placeholder="jean.dupont@company.com"
        ></app-ui-input>

      </div>

      <!-- Sélection du Rôle -->
      <div class="mb-6">
          <app-ui-multi-select
              label="Rôles"
              formControlName="roles"
              [options]="(roles$ | async) || []"
              bindLabel="name"
              bindValue="id"
              placeholder="Sélectionner les rôles"
          ></app-ui-multi-select>
          <div *ngIf="form.get('roles')?.invalid && form.get('roles')?.touched" class="mt-1 text-sm text-red-600">
              Au moins un rôle est requis.
          </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <app-ui-input
            label="Mot de passe"
            type="password"
            [control]="getControl('password')"
            [required]="!user"
          ></app-ui-input>

          <app-ui-input
            label="Confirmation"
            type="password"
            [control]="getControl('password2')"
            [required]="!user"
            errorMessage="Les mots de passe ne correspondent pas."
          ></app-ui-input>
      </div>

    </app-ui-form>
  `
})
export class UserFormComponent extends BaseModalFormComponent implements OnInit, OnChanges {
  // fb is inherited
  private userService = inject(UserService);
  private roleService = inject(RoleService);

  @Input() user: User | null = null;

  override form!: FormGroup;

  roles$!: Observable<any[]>;

  initForm(): FormGroup {
    return this.fb.group({
      photo: [null], // FormControl pour la photo
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      roles: [[], [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      password2: ['', [Validators.required]]
    }, { validators: CustomValidators.match('password', 'password2') });
  }

  override ngOnInit() {
    super.ngOnInit();
    this.roles$ = this.roleService.getAll().pipe(
      map((result: any) => {
        // DEBUG: Inspect structure to fix NgFor error
        console.log('[UserFormComponent] Roles loaded:', result);
        if (result?.data?.roles?.items) {
          return result.data.roles.items;
        }
        if (Array.isArray(result?.data?.roles)) {
          return result.data.roles;
        }
        return [];
      })
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.form) return;
    if (changes['user']) {
      if (this.user) {
        this.form.patchValue({
          photo: this.getPhotoUrl((this.user as any).photo) as any, // Utilisation du helper
          username: this.user.username,
          email: this.user.email,
          roles: this.user.roles?.map(r => r.id) || []
        });

        this.form.get('password')?.clearValidators();
        this.form.get('password')?.updateValueAndValidity();
        this.form.get('password2')?.clearValidators();
        this.form.get('password2')?.updateValueAndValidity();
      } else {
        this.form.reset();
        this.form.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
        this.form.get('password')?.updateValueAndValidity();
        this.form.get('password2')?.setValidators([Validators.required]);
        this.form.get('password2')?.updateValueAndValidity();
      }
    }
  }

  onSubmit() {
    super.submit();
  }

  save(): Observable<any> {
    const formData = new FormData();
    const formValue = this.form.value;

    formData.append('username', formValue.username || '');
    formData.append('email', formValue.email || '');

    if (formValue.roles) {
      const roles = Array.isArray(formValue.roles) ? formValue.roles : [formValue.roles];
      roles.forEach((roleId: any) => formData.append('roles', roleId));
    }

    if (formValue.password) formData.append('password', formValue.password);
    if (formValue.password2) formData.append('password2', formValue.password2);

    if (this.user && this.user.id) {
      formData.append('id', this.user.id.toString());
      if (!formValue.password) {
        formData.delete('password');
        formData.delete('password2');
      }
    }

    // Gestion propre via FormControl
    const photo = this.form.get('photo')?.value as any;
    if (photo instanceof File) {
      formData.append('photo', photo);
    }

    return this.userService.save(formData);
  }
}