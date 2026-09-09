import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of } from 'rxjs';
import { signal } from '@angular/core';
import { EstablishmentSelectorComponent } from './establishment-selector.component';
import { StructureStateService } from '@core/services/structure-state.service';
import { GetAllEstablishmentsGQL } from '@features/structure/graphql/structure.generated';

describe('EstablishmentSelectorComponent', () => {
    let component: EstablishmentSelectorComponent;
    let fixture: ComponentFixture<EstablishmentSelectorComponent>;
    let structureStateMock: any;
    let gqlMock: any;

    const EST_A = { id: 'est-1', name: 'École Alpha', city: 'Douala', country: 'Cameroun' };
    const EST_B = { id: 'est-2', name: 'Collège Beta', city: 'Yaoundé', country: 'Cameroun' };

    beforeEach(async () => {
        structureStateMock = {
            currentEstablishmentId: signal<string | null>(null),
            establishments: signal<any[]>([EST_A, EST_B]),
            isLoading: signal(false),
            setEstablishment: jasmine.createSpy('setEstablishment'),
            fetchEstablishments: jasmine.createSpy('fetchEstablishments'),
        };

        gqlMock = {
            fetch: jasmine.createSpy('fetch').and.returnValue(
                of({
                    data: {
                        establishments: { items: [EST_A, EST_B] },
                    },
                }),
            ),
        };

        await TestBed.configureTestingModule({
            imports: [EstablishmentSelectorComponent],
            providers: [
                { provide: StructureStateService, useValue: structureStateMock },
                { provide: GetAllEstablishmentsGQL, useValue: gqlMock },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(EstablishmentSelectorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });

    it('should display "Tous les établissements" when no establishment is selected', () => {
        const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
        expect(button.textContent).toContain('Tous les établissements');
    });

    it('should display the current establishment name on the trigger', () => {
        structureStateMock.currentEstablishmentId.set('est-2');
        fixture.detectChanges();
        const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
        expect(button.textContent).toContain('Collège Beta');
    });

    it('should open the dropdown when the trigger is clicked', () => {
        expect(component.isOpen()).toBe(false);
        const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
        button.click();
        fixture.detectChanges();
        expect(component.isOpen()).toBe(true);
        const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
        expect(input).toBeTruthy();
    });

    it('should list local establishments when opened without search term', () => {
        component.open();
        fixture.detectChanges();
        const items = fixture.nativeElement.querySelectorAll('li');
        // « Tous les établissements » + les 2 établissements du cache
        expect(items.length).toBe(3);
        expect(items[1].textContent).toContain('École Alpha');
        expect(items[2].textContent).toContain('Collège Beta');
    });

    it('should call setEstablishment(null) when clicking "Tous les établissements"', () => {
        component.open();
        fixture.detectChanges();
        const items = fixture.nativeElement.querySelectorAll('li');
        (items[0] as HTMLElement).click();
        expect(structureStateMock.setEstablishment).toHaveBeenCalledWith(null);
        expect(component.isOpen()).toBe(false);
    });

    it('should select an establishment and close on click', () => {
        component.open();
        fixture.detectChanges();
        const items = fixture.nativeElement.querySelectorAll('li');
        (items[1] as HTMLElement).click();
        expect(structureStateMock.setEstablishment).toHaveBeenCalledWith('est-1');
        expect(component.isOpen()).toBe(false);
    });

    it('should trigger a debounced remote search when typing', fakeAsync(() => {
        component.open();
        fixture.detectChanges();
        const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

        input.value = 'Alpha';
        input.dispatchEvent(new Event('input'));
        tick(300); // débounce
        fixture.detectChanges();

        expect(component.isSearching()).toBe(false);
        expect(component.filteredOptions().length).toBeGreaterThan(0);
        expect(gqlMock.fetch).toHaveBeenCalledWith(
            jasmine.objectContaining({ search: 'Alpha' }),
            jasmine.anything(),
        );
    }));

    it('should show a check mark on the currently selected establishment', () => {
        structureStateMock.currentEstablishmentId.set('est-1');
        component.open();
        fixture.detectChanges();
        const items = fixture.nativeElement.querySelectorAll('li');
        const selectedSvg = items[1].querySelector('svg[viewBox="0 0 24 24"] path[d="M5 13l4 4L19 7"]');
        expect(selectedSvg).toBeTruthy();
    });

    it('should close the dropdown with Escape', fakeAsync(() => {
        component.open();
        tick(); // purge le setTimeout de focus de open()
        fixture.detectChanges();
        expect(component.isOpen()).toBe(true);
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        expect(component.isOpen()).toBe(false);
    }));
});
