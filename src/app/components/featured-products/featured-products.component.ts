import { Component, inject, signal, OnInit, OnDestroy, ElementRef, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService, Product } from '../../services/cart.service';
import { ProductsService } from '../../services/products.service';
import { FavoritesService } from '../../services/favorites.service';

@Component({
  selector: 'app-featured-products',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './featured-products.component.html',
  styleUrls: ['./featured-products.component.css']
})
export class FeaturedProductsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren('productCard') productCards!: QueryList<ElementRef>;
  private productsService = inject(ProductsService);
  cartService = inject(CartService);
  favoritesService = inject(FavoritesService);

  hoveredCard = signal<number | null>(null);
  addedToCart = signal<boolean[]>([]);
  visibleCards = signal<boolean[]>([]);
  activeCategory = signal<string>('All');

  allProducts: Product[] = [];

  categories: string[] = ['All', 'Outerwear', 'Accessories', 'Watches', 'Dresses', 'Footwear', 'Jewelry', 'Knitwear'];

  get filteredProducts(): Product[] {
    let products = this.allProducts;

    if (this.activeCategory() !== 'All') {
      products = products.filter(p => p.category === this.activeCategory());
    }
    return products.filter(p => p.new);
  }

  selectCategory(category: string) {
    this.activeCategory.set(category);
    // Reset visibility for animation replay
    const resetVisible = this.filteredProducts.map(() => false);
    this.visibleCards.set(resetVisible);
    // Trigger visibility after short delay for animation
    setTimeout(() => {
      const filtered = this.filteredProducts;
      const newVisible = this.filteredProducts.map((p) => filtered.includes(p));
      this.visibleCards.set(newVisible);
    }, 50);
  }

  getOriginalIndex(product: Product): number {
    return this.filteredProducts.findIndex(p => p.id === product.id);
  }

  private observer: IntersectionObserver | null = null;

  ngOnInit() {
    this.allProducts = this.productsService.products();

    this.visibleCards.set(new Array(this.filteredProducts.length).fill(false));
    this.addedToCart.set(new Array(this.filteredProducts.length).fill(false));

    // Initialize intersection observer for scroll animations
    if (typeof IntersectionObserver !== 'undefined') {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const index = parseInt(entry.target.getAttribute('data-index') || '0', 10);
              this.setCardVisible(index);
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: '0px 0px -50px 0px'
        }
      );
    }
  }

  ngAfterViewInit() {
    // Observe all product cards
    if (this.observer) {
      this.productCards.forEach((card, index) => {
        card.nativeElement.setAttribute('data-index', index.toString());
        this.observer!.observe(card.nativeElement);
      });
    } else {
      // Fallback: show all cards immediately
      const allVisible = this.filteredProducts.map(() => true);
      this.visibleCards.set(allVisible);
    }
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private setCardVisible(index: number) {
    const current = this.visibleCards();
    if (!current[index]) {
      const updated = [...current];
      updated[index] = true;
      this.visibleCards.set(updated);
    }
  }

  onCardHover(index: number, isHovering: boolean) {
    this.hoveredCard.set(isHovering ? index : null);
  }

  addToCart(product: Product, index: number, event: MouseEvent) {
    event.stopPropagation();

    // Add to cart via service
    this.cartService.addToCart(product, event);

    // Show success state
    const current = this.addedToCart();
    const updated = [...current];
    updated[index] = true;
    this.addedToCart.set(updated);

    // Reset after 2 seconds
    setTimeout(() => {
      const reset = this.addedToCart();
      const resetUpdated = [...reset];
      resetUpdated[index] = false;
      this.addedToCart.set(resetUpdated);
    }, 2000);
  }

  toggleFavorite(event: Event, product: Product) {
    event.preventDefault();
    event.stopPropagation();
    this.favoritesService.toggleFavorite(product);
  }
}
