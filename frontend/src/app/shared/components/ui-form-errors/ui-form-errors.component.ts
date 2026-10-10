import { Component, Input } from '@angular/core';


@Component({
  selector: 'app-ui-form-errors',
  standalone: true,
  imports: [],
  template: ``
})
export class UiFormErrorsComponent {
  @Input() errors: Array<{ field: string, message: string }> = [];
}

