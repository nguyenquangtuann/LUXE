import { Component, signal, HostListener, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { FavoritesService } from '../../services/favorites.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  cartService = inject(CartService);
  favoritesService = inject(FavoritesService);

  isScrolled = signal(false);
  isMobileMenuOpen = signal(false);
  activeMegaMenu = signal<string | null>(null);
  activeMobileSubmenu = signal<string | null>(null);
  cartBadgePop = signal(false);
  favoritesBadgePop = signal(false);

  private previousCartCount = 0;

  constructor() {
    // Effect to trigger pop animation when cart count changes
    effect(() => {
      const currentCount = this.cartService.cartCount();
      if (currentCount > this.previousCartCount) {
        this.cartBadgePop.set(true);
        setTimeout(() => this.cartBadgePop.set(false), 300);
      }
      this.previousCartCount = currentCount;
    });
  }

  navItems = [
    { label: 'Home', submenu: null, link: '/' },
    // {
    //   label: 'Products',
    //   link: '/products',
    //   submenu: [
    //     { title: 'Categories', links: ['Outerwear', 'Dresses', 'Knitwear', 'Footwear'] },
    //     { title: 'Accessories', links: ['Jewelry', 'Watches', 'Bags', 'Scarves'] },
    //     { title: 'Collections', links: ['New Arrivals', 'Best Sellers', 'Sale'] }
    //   ]
    // },
    {
      label: 'Products', link: '/products', submenu: null
    },
    { label: 'About', submenu: null, link: '/about' },
    { label: 'Contact', submenu: null, link: '/contact' }
  ];

  @HostListener('window:scroll')
  onScroll() {
    this.isScrolled.set(window.scrollY > 50);
  }

  openMegaMenu(label: string) {
    this.activeMegaMenu.set(label);
  }

  closeMegaMenu() {
    this.activeMegaMenu.set(null);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(open => !open);
    if (!this.isMobileMenuOpen()) {
      this.activeMobileSubmenu.set(null);
    }
  }

  toggleMobileSubmenu(label: string) {
    if (this.activeMobileSubmenu() === label) {
      this.activeMobileSubmenu.set(null);
    } else {
      this.activeMobileSubmenu.set(label);
    }
  }
}
