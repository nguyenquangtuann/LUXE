import { Component, inject, signal, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ProductsService } from '../../services/products.service';
import { CartService, Product } from '../../services/cart.service';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { CartSidebarComponent } from '../../components/cart-sidebar/cart-sidebar.component';
import { FavoritesService } from '../../services/favorites.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent, FooterComponent, CartSidebarComponent],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  private productsService = inject(ProductsService);
  private cartService = inject(CartService);
  private router = inject(Router);
  favoritesService = inject(FavoritesService);

  product = signal<Product | null>(null);
  selectedImage = signal<string>('');
  selectedSize = signal<string>('M');
  quantity = signal<number>(1);
  addedToCart = signal<boolean>(false);
  isWishlisted = signal<boolean>(false);

  sizes = ['XS', 'S', 'M', 'L', 'XL'];
  @Input() id!: string; // sẽ được gán từ route params thông qua input binding

  ngOnInit() {
    const id = parseInt(this.id, 10);
    const foundProduct = this.productsService.getProductById(id);

    if (foundProduct) {
      this.product.set(foundProduct);
      this.selectedImage.set(foundProduct.image);
    }
  }

  increaseQuantity() {
    this.quantity.update(q => q + 1);
  }

  decreaseQuantity() {
    if (this.quantity() > 1) {
      this.quantity.update(q => q - 1);
    }
  }

  addToCart() {
    const prod = this.product();
    if (prod) {
      for (let i = 0; i < this.quantity(); i++) {
        this.cartService.addToCart(prod);
      }
      this.addedToCart.set(true);
      setTimeout(() => this.addedToCart.set(false), 2000);
    }
  }

  buyNow() {
    this.addToCart();
    this.router.navigate(['/checkout']);
  }

  toggleFavorite(event: Event, product: Product) {
    event.preventDefault();
    event.stopPropagation();
    this.favoritesService.toggleFavorite(product);
  }
}
