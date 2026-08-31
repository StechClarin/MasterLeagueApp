import { Component, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { BaseFormComponent } from '@core/abstracts/base-form.component';
import { RoomService } from '../../services/room.service';

// Shared UI Imports
import { UiInputComponent } from '@shared/components/ui-input/ui-input.component';
import { UiSelectComponent } from '@shared/components/ui-select/ui-select.component';
import { UiFormComponent } from '@shared/components/ui-form/ui-form.component';
import { RoomType, StructureRoomRoomTypeChoices } from '@app/graphql/types';

@Component({
  selector: 'app-room-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UiInputComponent, UiSelectComponent, UiFormComponent],
  templateUrl: './room-form.component.html'
})
export class RoomFormComponent extends BaseFormComponent implements OnChanges {
  private fb = inject(FormBuilder);
  public service = inject(RoomService);

  @Input() room: RoomType | null = null;
  @Input() isReadOnly = false;

  // Options du select "Type de local" (miroir de l'enum backend)
  roomTypeOptions = Object.values(StructureRoomRoomTypeChoices).map((value) => ({
    label: this.roomTypeLabel(value),
    value
  }));

  override form = this.fb.nonNullable.group({
      name: ['', [Validators.required]],
      capacity: [30, [Validators.required, Validators.min(1)]],
      room_type: ['CLASSROOM', [Validators.required]]
  });

  private roomTypeLabel(value: StructureRoomRoomTypeChoices): string {
    switch (value) {
      case StructureRoomRoomTypeChoices.Classroom: return 'Salle de classe';
      case StructureRoomRoomTypeChoices.Office: return 'Bureau';
      case StructureRoomRoomTypeChoices.Laboratory: return 'Laboratoire';
      case StructureRoomRoomTypeChoices.Library: return 'Bibliothèque';
      case StructureRoomRoomTypeChoices.Storage: return 'Autre / Stockage';
      default: return value;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
      if (changes['room']) {
          if (this.room) {
              this.form.patchValue({
                  name: this.room.name || '',
                  capacity: this.room.capacity || 30,
                  room_type: this.room.roomType || 'CLASSROOM'
              });
          } else {
              this.form.reset({ capacity: 30, room_type: 'CLASSROOM' });
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
