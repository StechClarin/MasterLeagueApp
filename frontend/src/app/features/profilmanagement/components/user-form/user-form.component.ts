import { Component, inject, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Apollo } from 'apollo-angular';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { UiInputComponent } from '@shared/components/ui-input/ui-input.component';
import { UiFormComponent } from '@shared/components/ui-form/ui-form.component';
import { UserService } from '../../services/user.service';
import { GET_ALL_ROLES } from '../../graphql/role.queries';
import { BaseFormComponent } from '@core/abstracts/base-form.component';
import { User } from '../../models/user.model';
import { CustomValidators } from '@core/validators/custom-validators';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UiInputComponent, UiFormComponent],
  template: `
    <app-ui-form
      [title]="user ? 'Modifier l\\'Utilisateur' : 'Nouvel Utilisateur'"
      [formGroup]="form"
      [isLoading]="isSubmitting"
      [errorMessage]="errorMessage"
      [submitLabel]="user ? 'Modifier' : 'Créer'"
      (submitForm)="onSubmit()"
      (cancel)="onCancel()">

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        
        <app-ui-input
          label="Nom d'utilisateur"
          [control]="form.controls.username"
          [required]="true"
          placeholder="ex: jdupont"
        ></app-ui-input>

        <app-ui-input
          label="Email professionnel"
          type="email"
          [control]="form.controls.email"
          [required]="true"
          placeholder="jean.dupont@company.com"
        ></app-ui-input>

      </div>

      <!-- Sélection du Rôle -->
      <div class="mb-6">
        <label for="role" class="block text-sm font-semibold text-gray-700 mb-2">
          Rôle <span class="text-red-500">*</span>
        </label>
        <div class="relative">
          <select
            id="role"
            formControlName="role"
            class="block w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl text-sm appearance-none bg-no-repeat bg-right focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer shadow-sm"
          >
            <option [ngValue]="null" disabled>Sélectionnez un rôle</option>
            <option *ngFor="let role of roles$ | async" [ngValue]="role.id">
              {{ role.name }}
            </option>
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>
        <div *ngIf="form.controls.role.invalid && (form.controls.role.dirty || form.controls.role.touched)" class="text-red-500 text-xs mt-1.5 ml-1 font-medium">
          Le rôle est requis.
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <app-ui-input
            label="Mot de passe"
            type="password"
            [control]="form.controls.password"
            [required]="!user"
          ></app-ui-input>

          <app-ui-input
            label="Confirmation"
            type="password"
            [control]="form.controls.password2"
            [required]="!user"
            errorMessage="Les mots de passe ne correspondent pas."
          ></app-ui-input>
      </div>

    </app-ui-form>
  `
})
export class UserFormComponent extends BaseFormComponent implements OnInit, OnChanges {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private apollo = inject(Apollo);

  @Input() user: User | null = null;

  roles$!: Observable<any[]>;

  // Définition stricte du formulaire (Logique Métier)
  // On utilise 'form' (hérité) au lieu de 'userForm'
  // @ts-ignore: On force le typage pour le moment car BaseFormComponent a FormGroup générique
  override form = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    role: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    password2: ['', [Validators.required]]
  }, { validators: CustomValidators.match('password', 'password2') });

  override ngOnInit() {
    super.ngOnInit();
    // Chargement des rôles via GraphQL
    this.roles$ = this.apollo
      .watchQuery({ query: GET_ALL_ROLES })
      .valueChanges.pipe(
        map((result: any) => result.data.roles)
      );
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['user']) {
      if (this.user) {
        // Mode Édition
        this.form.patchValue({
          username: this.user.username,
          email: this.user.email,
          role: this.user.roles?.[0]?.id || '' // On prend l'ID du premier rôle ou vide
        });

        // En édition, le mot de passe est optionnel
        this.form.controls.password.clearValidators();
        this.form.controls.password.updateValueAndValidity();
        this.form.controls.password2.clearValidators();
        this.form.controls.password2.updateValueAndValidity();
      } else {
        // Mode Création (Reset)
        this.form.reset();
        this.form.controls.password.setValidators([Validators.required, Validators.minLength(6)]);
        this.form.controls.password.updateValueAndValidity();
        this.form.controls.password2.setValidators([Validators.required]);
        this.form.controls.password2.updateValueAndValidity();
      }
    }
  }

  onSubmit() {
    // Validation spécifique avant soumission (ex: password match)
    // Géré par le CustomValidator désormais

    // On appelle la méthode submit() du parent qui gère le loading, save(), success/error
    super.submit();
  }

  // Implémentation de la méthode abstraite save()
  save(): Observable<any> {
    // Mapping pour le backend : 'role' (front) -> 'roles' (back)
    const payload: any = {
      ...this.form.value,
      roles: [this.form.value.role]
    };

    // Si on est en édition, on ajoute l'ID
    if (this.user && this.user.id) {
      payload.id = this.user.id;
      // Si le mot de passe est vide, on ne l'envoie pas pour ne pas l'écraser
      if (!payload.password) {
        delete payload.password;
        delete payload.password2;
      }
    }

    return this.userService.save(payload);
  }
}