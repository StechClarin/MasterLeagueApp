import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BaseFormComponent } from '@core/abstracts/base-form.component';
import { RoomService } from '../../services/room.service';
import { Observable } from 'rxjs';

// Shared UI Imports
import { UiInputComponent } from '@shared/components/ui-input/ui-input.component';

@Component({
  selector: 'app-room-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UiInputComponent],
  templateUrl: './room-form.component.html'
})
export class RoomFormComponent extends BaseFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  public service = inject(RoomService);

  @Input() item: any;
  @Input() isReadOnly = false;

  form!: FormGroup;

  override ngOnInit(): void {
    super.ngOnInit();
    this.form = this.initForm();
    if (this.item) {
      this.form.patchValue(this.item);
    }
    if (this.isReadOnly) {
      this.form.disable();
    }
  }

  initForm(): FormGroup {
    return this.fb.group({
      id: [null],
      name: ['', [Validators.required]],
      capacity: [30, [Validators.required, Validators.min(1)]]
    });
  }

  save(): Observable<any> {
    return this.service.save(this.form.value);
  }
}
