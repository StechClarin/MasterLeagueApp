import { Component, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { BaseFormComponent } from '@core/abstracts/base-form.component';
import { RoomService } from '../../services/room.service';

// Shared UI Imports
import { UiInputComponent } from '@shared/components/ui-input/ui-input.component';
import { UiFormComponent } from '@shared/components/ui-form/ui-form.component';
import { RoomType } from '@app/graphql/types';

@Component({
  selector: 'app-room-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UiInputComponent, UiFormComponent],
  templateUrl: './room-form.component.html'
})
export class RoomFormComponent extends BaseFormComponent implements OnChanges {
  private fb = inject(FormBuilder);
  public service = inject(RoomService);

  @Input() room: RoomType | null = null;
  @Input() isReadOnly = false;

  override form = this.fb.nonNullable.group({
      name: ['', [Validators.required]],
      capacity: [30, [Validators.required, Validators.min(1)]]
  });

  ngOnChanges(changes: SimpleChanges): void {
      if (changes['room']) {
          if (this.room) {
              this.form.patchValue({
                  name: this.room.name || '',
                  capacity: this.room.capacity || 30
              });
          } else {
              this.form.reset({ capacity: 30 });
          }
      }

      if (changes['isReadOnly']) {
          if (this.isReadOnly) {
              this.form.disable();
          } else {
              this.form.enable();
          }
      }
  }

  save() {
      const payload: any = this.form.getRawValue();
      if (this.room?.id) {
          payload.id = this.room.id;
      }
      return this.service.save(payload);
  }
}
