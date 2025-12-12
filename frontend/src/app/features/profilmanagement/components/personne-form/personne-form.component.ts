import { Component, inject, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';

import { UiInputComponent } from '@shared/components/ui-input/ui-input.component';
import { UiSelectComponent } from '@shared/components/ui-select/ui-select.component';
import { UiTabsComponent } from '@shared/components/ui-tabs/ui-tabs.component';
import { UiFormComponent } from '@shared/components/ui-form/ui-form.component';
import { BaseFormComponent } from '@core/abstracts/base-form.component';
import { PersonneService } from '../../services/personne.service';
import { Personne } from '../../models/personne.model';

@Component({
  selector: 'app-personne-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    UiInputComponent,
    UiSelectComponent,
    UiTabsComponent,
    UiFormComponent
  ],
  template: `
    <app-ui-form
      [title]="personne ? 'Modifier la Personne' : 'Nouvelle Personne'"
      [formGroup]="form"
      [isLoading]="isSubmitting"
      [errorMessage]="errorMessage"
      [submitLabel]="personne ? 'Modifier' : 'Créer'"
      (submitForm)="onSubmit()"
      (cancel)="onCancel()">

      <app-ui-tabs [tabs]="tabs" (tabChange)="activeTab = $event">
        
        <!-- TAB 1: Informations Générales -->
        <div *ngIf="activeTab === 'general'" class="mt-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <app-ui-input label="Nom" formControlName="nom" [required]="true" placeholder="Ex: Doe"></app-ui-input>
            <app-ui-input label="Prénom" formControlName="prenom" [required]="true" placeholder="Ex: John"></app-ui-input>
            
            <app-ui-input label="Age" type="number" formControlName="age"></app-ui-input>
            <app-ui-input label="Nationalité" formControlName="nationalite"></app-ui-input>
            
            <app-ui-select 
              label="Genre" 
              formControlName="genre" 
              [options]="[
                {label: 'Homme', value: 'M'}, 
                {label: 'Femme', value: 'F'}, 
                {label: 'Autre', value: 'O'}
              ]">
            </app-ui-select>
            
            <app-ui-input label="Taille (cm)" type="number" formControlName="taille"></app-ui-input>
            <app-ui-input label="Poids (kg)" type="number" formControlName="poid"></app-ui-input>
          </div>
        </div>

        <!-- TAB 2: Contacts -->
        <div *ngIf="activeTab === 'contacts'" class="mt-6">
          <div class="space-y-4">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-medium text-gray-900">Liste des contacts</h3>
              <button type="button" (click)="addContact()" 
                class="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-sm">
                + Ajouter
              </button>
            </div>

            <div formArrayName="contacts" class="space-y-4">
                <div *ngFor="let contact of contactsArray.controls; let i=index" [formGroupName]="i" 
                    class="p-4 border border-gray-200 rounded-lg relative bg-gray-50 group">
                    
                    <button type="button" (click)="removeContact(i)" 
                        class="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <app-ui-input label="Téléphone" formControlName="telephone" [required]="true"></app-ui-input>
                        <app-ui-input label="Email" type="email" formControlName="email"></app-ui-input>
                        <app-ui-input label="Adresse" formControlName="adresse"></app-ui-input>
                    </div>
                </div>
                
                <div *ngIf="contactsArray.length === 0" class="text-center text-gray-500 py-8 border-2 border-dashed border-gray-200 rounded-lg">
                   Aucun contact associé. Cliquez sur "Ajouter" pour en créer un.
                </div>
            </div>
          </div>
        </div>

      </app-ui-tabs>

    </app-ui-form>
  `
})
export class PersonneFormComponent extends BaseFormComponent implements OnInit, OnChanges {
  private fb = inject(FormBuilder);
  private personneService = inject(PersonneService);

  @Input() personne: Personne | null = null;

  activeTab = 'general';
  tabs = [
    { id: 'general', label: 'Informations Générales' },
    { id: 'contacts', label: 'Contacts' }
  ];

  // @ts-ignore
  override form: FormGroup = this.fb.group({
    nom: ['', Validators.required],
    prenom: ['', Validators.required],
    age: [null, [Validators.min(0)]],
    nationalite: [''],
    genre: ['M'],
    taille: [null],
    poid: [null],
    contacts: this.fb.array([])
  });

  get contactsArray() {
    return this.form.get('contacts') as FormArray;
  }

  ngOnInit() {
    // Nothing special for now
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['personne']) {
      if (this.personne) {
        // Mode Édition
        this.form.patchValue({
          nom: this.personne.nom,
          prenom: this.personne.prenom,
          age: this.personne.age,
          nationalite: this.personne.nationalite,
          genre: this.personne.genre,
          taille: this.personne.taille,
          poid: this.personne.poid
        });

        // Patch Contacts
        this.contactsArray.clear();
        if (this.personne.contacts && Array.isArray(this.personne.contacts)) {
          this.personne.contacts.forEach(contact => {
            this.contactsArray.push(this.fb.group({
              id: [contact.id],
              telephone: [contact.telephone, Validators.required],
              email: [contact.email, [Validators.email]],
              adresse: [contact.adresse]
            }));
          });
        }
      } else {
        // Mode Création (Reset)
        this.form.reset();
        this.contactsArray.clear();
        this.form.patchValue({ genre: 'M' }); // Default
      }
    }
  }

  addContact() {
    const contactGroup = this.fb.group({
      id: [null],
      telephone: ['', Validators.required],
      email: ['', [Validators.email]],
      adresse: ['']
    });
    this.contactsArray.push(contactGroup);
  }

  removeContact(index: number) {
    this.contactsArray.removeAt(index);
  }

  onSubmit() {
    super.submit();
  }

  save(): Observable<any> {
    const payload: any = {
      ...this.form.value
    };

    if (this.personne && this.personne.id) {
      payload.id = this.personne.id;
    }

    return this.personneService.save(payload);
  }
}
