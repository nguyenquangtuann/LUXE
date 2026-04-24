import { Component } from '@angular/core';
import { HeroComponent } from '../../components/hero/hero.component';
import { FeaturedProductsComponent } from '../../components/featured-products/featured-products.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeroComponent, FeaturedProductsComponent, FooterComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  onSubscribe(event: Event) {
    event.preventDefault();
    // Handle subscription
    alert('Thank you for subscribing!');
  }
}
