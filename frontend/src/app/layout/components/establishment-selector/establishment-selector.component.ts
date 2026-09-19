import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiEstablishmentSelectorComponent } from '@shared/components/ui-establishment-selector/ui-establishment-selector.component';

@Component({
    selector: 'app-establishment-selector',
    standalone: true,
    imports: [CommonModule],
    templateUrl: '../../../shared/components/ui-establishment-selector/ui-establishment-selector.component.html'
})
export class EstablishmentSelectorComponent extends UiEstablishmentSelectorComponent {}
