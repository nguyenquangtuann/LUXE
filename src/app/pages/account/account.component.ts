import { Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { CartSidebarComponent } from '../../components/cart-sidebar/cart-sidebar.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent, CartSidebarComponent],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {
  authService = inject(AuthService);

  @ViewChild('googleBtn', { static: false }) googleBtn!: ElementRef;
  activeTab = signal<'login' | 'register'>('login');
  isLoading = signal<boolean>(false);

  // Login
  loginEmail = '';
  loginPassword = '';
  rememberMe = false;
  showLoginPassword = signal<boolean>(false);
  loginError = signal<string>('');

  // Register
  firstName = '';
  lastName = '';
  registerEmail = '';
  registerPassword = '';
  agreeTerms = false;
  showRegisterPassword = signal<boolean>(false);
  registerError = signal<string>('');
  registerSuccess = signal<boolean>(false);

  constructor(private router: Router) { }

  ngOnInit(): void {
    (window as any).onGoogleLibraryLoad = () => {
      (window as any).google.accounts.id.initialize({
        client_id: '690406882030-1aiqkgg1cuqlcucmh1lahnpspq91ssqe.apps.googleusercontent.com',
        // Gọi đúng hàm trong AuthService của bạn
        callback: this.authService.handleCredentialResponse.bind(this.authService)
      });

      // Render nút thật vào cái div tàng hình
      (window as any).google.accounts.id.renderButton(
        this.googleBtn.nativeElement,
        { theme: 'outline', size: 'large', width: 250 }
      );
    };
    if ((window as any).google) {
      (window as any).onGoogleLibraryLoad();
    }
  }

  onLogin() {
    this.loginError.set('');

    if (!this.loginEmail || !this.loginPassword) {
      this.loginError.set('Please fill in all fields');
      return;
    }

    this.isLoading.set(true);

    // Simulate API call
    setTimeout(() => {
      this.isLoading.set(false);
      // For demo purposes, show error
      this.loginError.set('Invalid email or password. This is a demo.');
    }, 1500);
  }

  onRegister() {
    this.registerError.set('');
    this.registerSuccess.set(false);

    if (!this.firstName || !this.lastName || !this.registerEmail || !this.registerPassword) {
      this.registerError.set('Please fill in all fields');
      return;
    }

    if (this.registerPassword.length < 8) {
      this.registerError.set('Password must be at least 8 characters');
      return;
    }

    if (!this.agreeTerms) {
      this.registerError.set('Please agree to the Terms of Service');
      return;
    }

    this.isLoading.set(true);

    // Simulate API call
    setTimeout(() => {
      this.isLoading.set(false);
      this.registerSuccess.set(true);
      // Reset form
      this.firstName = '';
      this.lastName = '';
      this.registerEmail = '';
      this.registerPassword = '';
      this.agreeTerms = false;
    }, 1500);
  }
}
