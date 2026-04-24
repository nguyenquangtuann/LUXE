import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';

type CheckoutStep = 'shipping' | 'payment' | 'review';

interface ShippingForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface PaymentForm {
  cardName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent {
  cartService = inject(CartService);

  currentStep = signal<CheckoutStep>('shipping');

  steps = [
    { id: 'shipping' as const, label: 'Shipping' },
    { id: 'payment' as const, label: 'Payment' },
    { id: 'review' as const, label: 'Review' }
  ];

  shippingForm: ShippingForm = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US'
  };

  paymentForm: PaymentForm = {
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  };

  shipping = computed(() => {
    return this.cartService.cartTotal() >= 500 ? 0 : 25;
  });

  tax = computed(() => {
    return Math.round(this.cartService.cartTotal() * 0.08);
  });

  total = computed(() => {
    return this.cartService.cartTotal() + this.shipping() + this.tax();
  });

  isStepCompleted(step: CheckoutStep): boolean {
    const stepOrder: CheckoutStep[] = ['shipping', 'payment', 'review'];
    const currentIndex = stepOrder.indexOf(this.currentStep());
    const stepIndex = stepOrder.indexOf(step);
    return stepIndex < currentIndex;
  }

  goToShipping() {
    this.currentStep.set('shipping');
  }

  goToPayment() {
    this.currentStep.set('payment');
  }

  goToReview() {
    this.currentStep.set('review');
  }

  placeOrder() {
    alert('Order placed successfully! Thank you for your purchase.');
    this.cartService.clearCart();
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  }
}
