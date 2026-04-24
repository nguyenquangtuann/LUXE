import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { CartSidebarComponent } from './components/cart-sidebar/cart-sidebar.component';
import { FavoritesSidebarComponent } from "./components/favorites-sidebar/favorites-sidebar.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, CartSidebarComponent, FavoritesSidebarComponent],
  template: `
    <div class="app-container">
      <app-header />
      <main>
        <router-outlet />
      </main>
      <app-cart-sidebar />
      <app-favorites-sidebar />
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    main {
      flex: 1;
    }
  `]
})
export class AppComponent {}
