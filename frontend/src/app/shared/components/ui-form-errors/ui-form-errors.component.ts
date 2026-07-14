import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ui-form-errors',
  standalone: true,
  imports: [CommonModule],
  template: ``
})
export class UiFormErrorsComponent {
  @Input() errors: Array<{ field: string, message: string }> = [];
}

