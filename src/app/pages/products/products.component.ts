import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductsService } from '../../services/products.service';
import { CartService, Product } from '../../services/cart.service';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { CartSidebarComponent } from '../../components/cart-sidebar/cart-sidebar.component';
import { FavoritesService } from '../../services/favorites.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, HeaderComponent, FooterComponent, CartSidebarComponent],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  private productsService = inject(ProductsService);
  private cartService = inject(CartService);
  favoritesService = inject(FavoritesService);
  private route = inject(ActivatedRoute);

  hoveredProduct = signal<number | null>(null);
  addedToCart = signal<Record<number, boolean>>({});
  selectedCategory = signal<string>('All');
  sortBy = signal<string>('featured');
  pageTitle = signal<string>('All Products');

  categories = ['All', 'Outerwear', 'Accessories', 'Watches', 'Dresses', 'Footwear', 'Jewelry', 'Knitwear'];

  allProducts: Product[] = [];

  ngOnInit() {
    this.allProducts = this.productsService.products();

    // Check for category param
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.selectedCategory.set(params['category']);
        this.pageTitle.set(params['category']);
        this.updateFilteredProducts();
      }
      if (params['search']) {
        this.pageTitle.set(`Search: "${params['search']}"`);
      }
    });
  }

  filteredProducts = signal<Product[]>([]);

  constructor() {
    // Update filtered products whenever filters change
    this.updateFilteredProducts();
  }

  private updateFilteredProducts() {
    let products = [...this.productsService.products()];

    // Filter by category
    if (this.selectedCategory() !== 'All') {
      products = products.filter(p => p.category === this.selectedCategory());
    }

    // Sort
    switch (this.sortBy()) {
      case 'price-low':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        products.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    this.filteredProducts.set(products);
  }

  onCategoryChange(category: string) {
    this.selectedCategory.set(category);
    this.pageTitle.set(category === 'All' ? 'All Products' : category);
    this.updateFilteredProducts();
  }

  onSortChange(sort: string) {
    this.sortBy.set(sort);
    this.updateFilteredProducts();
  }

  addToCart(product: Product) {
    this.cartService.addToCart(product);

    const current = this.addedToCart();
    this.addedToCart.set({ ...current, [product.id]: true });

    setTimeout(() => {
      const updated = this.addedToCart();
      this.addedToCart.set({ ...updated, [product.id]: false });
    }, 2000);
  }

  toggleFavorite(event: Event, product: Product) {
    event.preventDefault();
    event.stopPropagation();
    this.favoritesService.toggleFavorite(product);
  }
}
