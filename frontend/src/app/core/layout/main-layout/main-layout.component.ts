import { Component } from '@angular/core';

import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-main-layout',
    standalone: true,
    imports: [RouterOutlet],
    template: `
    <header>Header</header>
    <main>
      <router-outlet></router-outlet>
    </main>
    <footer>Footer</footer>
  `,
})
export class MainLayoutComponent { }
