import { Injectable, signal, computed } from '@angular/core';

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  imageHover: string;
  category: string;
  description: string;
  new: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems = signal<CartItem[]>([]);
  private _isCartOpen = signal(false);
  private _flyingProduct = signal<{ x: number; y: number; image: string } | null>(null);

  readonly items = this.cartItems.asReadonly();
  readonly isCartOpen = this._isCartOpen.asReadonly();
  readonly flyingProduct = this._flyingProduct.asReadonly();

  readonly cartCount = computed(() =>
    this.cartItems().reduce((sum, item) => sum + item.quantity, 0)
  );

  readonly cartTotal = computed(() =>
    this.cartItems().reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
  );

  addToCart(product: Product, event?: MouseEvent) {
    const currentItems = this.cartItems();
    const existingItem = currentItems.find(item => item.product.id === product.id);

    if (event) {
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      this._flyingProduct.set({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        image: product.image
      });

      setTimeout(() => {
        this._flyingProduct.set(null);
      }, 600);
    }

    if (existingItem) {
      this.cartItems.set(
        currentItems.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      this.cartItems.set([...currentItems, { product, quantity: 1 }]);
    }
  }

  removeFromCart(productId: number) {
    this.cartItems.update(items => items.filter(item => item.product.id !== productId));
  }

  updateQuantity(productId: number, quantity: number) {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    this.cartItems.update(items =>
      items.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  }

  openCart() {
    this._isCartOpen.set(true);
  }

  closeCart() {
    this._isCartOpen.set(false);
  }

  toggleCart() {
    this._isCartOpen.update(open => !open);
  }

  clearCart() {
    this.cartItems.set([]);
  }
}
