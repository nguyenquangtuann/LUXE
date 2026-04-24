import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FavoritesService } from '../../services/favorites.service';
import { CartService, Product } from '../../services/cart.service';

@Component({
  selector: 'app-favorites-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './favorites-sidebar.component.html',
  styleUrls: ['./favorites-sidebar.component.css']
})
export class FavoritesSidebarComponent {
  favoritesService = inject(FavoritesService);
  cartService = inject(CartService);
  
  removingId = signal<number | null>(null);
  addedToCart = signal<Record<number, boolean>>({});
  badgePop = signal(false);
  
  private previousCount = 0;
  
  constructor() {
    effect(() => {
      const currentCount = this.favoritesService.favoritesCount();
      if (currentCount > this.previousCount) {
        this.badgePop.set(true);
        setTimeout(() => this.badgePop.set(false), 400);
      }
      this.previousCount = currentCount;
    });
  }
  
  addToCart(product: Product) {
    this.cartService.addToCart(product);
    this.addedToCart.update(state => ({ ...state, [product.id]: true }));
    
    setTimeout(() => {
      this.addedToCart.update(state => ({ ...state, [product.id]: false }));
    }, 2000);
  }
  
  removeFromFavorites(productId: number) {
    this.removingId.set(productId);
    
    setTimeout(() => {
      this.favoritesService.removeFromFavorites(productId);
      this.removingId.set(null);
    }, 300);
  }
  
  clearAll() {
    this.favoritesService.clearFavorites();
  }
}
