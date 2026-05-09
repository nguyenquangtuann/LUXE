import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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
  private router = inject(Router);

  // Đọc user trực tiếp từ AuthService (signal)
  get userProfile() { return this.authService.user(); }

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

  ngOnInit(): void {
    // Khởi tạo Google client thông qua AuthService
    this.authService.initGoogle();
  }

  // Click nút "Đăng nhập với Google"
  async loginWithCustomButton() {
    try {
      await this.authService.loginWithGoogle();
      this.router.navigate(['/']);
    } catch (err) {
      console.error('Google login failed:', err);
      this.loginError.set('Đăng nhập Google thất bại, vui lòng thử lại.');
    }
  }

  logout() {
    this.authService.logout();
  }

  onLogin() {
    this.loginError.set('');

    if (!this.loginEmail || !this.loginPassword) {
      this.loginError.set('Please fill in all fields');
      return;
    }

    this.isLoading.set(true);

    setTimeout(() => {
      this.isLoading.set(false);
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

    setTimeout(() => {
      this.isLoading.set(false);
      this.registerSuccess.set(true);
      this.firstName = '';
      this.lastName = '';
      this.registerEmail = '';
      this.registerPassword = '';
      this.agreeTerms = false;
    }, 1500);
  }
}
