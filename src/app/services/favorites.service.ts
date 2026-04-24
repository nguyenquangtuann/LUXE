import { Injectable, signal, computed } from '@angular/core';
import { Product } from './cart.service';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private _favorites = signal<Product[]>([]);
  private _isFavoritesOpen = signal(false);
  private _lastAddedProduct = signal<Product | null>(null);
  
  readonly favorites = this._favorites.asReadonly();
  readonly isFavoritesOpen = this._isFavoritesOpen.asReadonly();
  readonly lastAddedProduct = this._lastAddedProduct.asReadonly();
  
  readonly favoritesCount = computed(() => this._favorites().length);
  
  isFavorite(productId: number): boolean {
    return this._favorites().some(p => p.id === productId);
  }
  
  toggleFavorite(product: Product): boolean {
    const currentFavorites = this._favorites();
    const existingIndex = currentFavorites.findIndex(p => p.id === product.id);
    
    if (existingIndex > -1) {
      // Remove from favorites
      this._favorites.set(currentFavorites.filter(p => p.id !== product.id));
      return false;
    } else {
      // Add to favorites
      this._favorites.set([...currentFavorites, product]);
      this._lastAddedProduct.set(product);
      
      // Clear last added after animation
      setTimeout(() => {
        this._lastAddedProduct.set(null);
      }, 2000);
      
      return true;
    }
  }
  
  addToFavorites(product: Product) {
    if (!this.isFavorite(product.id)) {
      this._favorites.update(favorites => [...favorites, product]);
      this._lastAddedProduct.set(product);
      
      setTimeout(() => {
        this._lastAddedProduct.set(null);
      }, 2000);
    }
  }
  
  removeFromFavorites(productId: number) {
    this._favorites.update(favorites => favorites.filter(p => p.id !== productId));
  }
  
  openFavorites() {
    this._isFavoritesOpen.set(true);
  }
  
  closeFavorites() {
    this._isFavoritesOpen.set(false);
  }
  
  toggleFavoritesPanel() {
    this._isFavoritesOpen.update(open => !open);
  }
  
  clearFavorites() {
    this._favorites.set([]);
  }
}
