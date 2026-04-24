import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductsService } from '../../services/products.service';
import { CartService, Product } from '../../services/cart.service';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { CartSidebarComponent } from '../../components/cart-sidebar/cart-sidebar.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, HeaderComponent, FooterComponent, CartSidebarComponent],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  private productsService = inject(ProductsService);
  private cartService = inject(CartService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  
  searchQuery = signal<string>('');
  searchResults = signal<Product[]>([]);
  hoveredProduct = signal<number | null>(null);
  addedToCart = signal<Record<number, boolean>>({});
  
  popularSearches = ['Blazer', 'Watch', 'Leather', 'Dress', 'Shoes', 'Jewelry', 'Cashmere'];
  
  categories = [
    { name: 'Outerwear', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&fit=crop' },
    { name: 'Accessories', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop' },
    { name: 'Watches', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop' },
    { name: 'Dresses', image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&h=400&fit=crop' }
  ];
  
  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['q']) {
        this.searchQuery.set(params['q']);
        this.performSearch();
      }
    });
  }
  
  onSearchChange(query: string) {
    this.searchQuery.set(query);
    this.performSearch();
  }
  
  performSearch() {
    const query = this.searchQuery().toLowerCase().trim();
    
    if (!query) {
      this.searchResults.set([]);
      return;
    }
    
    const allProducts = this.productsService.products();
    const results = allProducts.filter(product => 
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query)
    );
    
    this.searchResults.set(results);
  }
  
  clearSearch() {
    this.searchQuery.set('');
    this.searchResults.set([]);
  }
  
  searchByTag(tag: string) {
    this.searchQuery.set(tag);
    this.performSearch();
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
}
