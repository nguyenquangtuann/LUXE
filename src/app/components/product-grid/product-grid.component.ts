import { Component, inject, signal, computed, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductCardComponent } from '../product-card/product-card.component';
import { ProductsService } from '../../services/products.service';

@Component({
  selector: 'app-product-grid',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
  templateUrl: './product-grid.component.html',
  styleUrls: ['./product-grid.component.css']
})
export class ProductGridComponent implements AfterViewInit {
  productsService = inject(ProductsService);

  categories = ['All', 'Outerwear', 'Accessories', 'Watches', 'Dresses', 'Footwear', 'Jewelry', 'Knitwear'];
  activeCategory = signal('All');
  sortBy = signal('featured');
  isVisible = signal(false);

  filteredProducts = computed(() => {
    let products = this.productsService.products();

    if (this.activeCategory() !== 'All') {
      products = products.filter(p => p.category === this.activeCategory());
    }

    switch (this.sortBy()) {
      case 'price-asc':
        products = [...products].sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        products = [...products].sort((a, b) => b.price - a.price);
        break;
      case 'name':
        products = [...products].sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return products;
  });

  ngAfterViewInit() {
    setTimeout(() => {
      this.isVisible.set(true);
    }, 100);
  }

  setCategory(category: string) {
    this.activeCategory.set(category);
    this.isVisible.set(false);
    setTimeout(() => {
      this.isVisible.set(true);
    }, 50);
  }

  onSortChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.sortBy.set(select.value);
  }
}
