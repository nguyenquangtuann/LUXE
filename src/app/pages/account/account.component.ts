import { Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { CartSidebarComponent } from '../../components/cart-sidebar/cart-sidebar.component';
import { AuthService } from '../../services/auth.service';
declare var google: any;
@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent, CartSidebarComponent],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {
  authService = inject(AuthService);

  clientId = '1092586557004-h2cl9706bn9p0jqe2291n690urp41n6g.apps.googleusercontent.com';
  tokenClient: any;
  userProfile: any = null;

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
    this.loadGoogleLibrary();
  }

  loadGoogleLibrary() {
    // Nếu script đã có thì khởi tạo luôn
    if (typeof google !== 'undefined' && google.accounts) {
      this.initCustomLoginClient();
      return;
    }

    // Tự động nhúng script GSI vào trang
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;

    script.onload = () => {
      this.initCustomLoginClient();
    };

    document.head.appendChild(script);
  }

  initCustomLoginClient() {
    // Khởi tạo luồng OAuth2 cho Custom Button
    this.tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: this.clientId,
      scope: 'email profile openid',
      callback: (response: any) => {
        if (response.error !== undefined) {
          console.error('Đăng nhập bị lỗi hoặc bị hủy:', response);
          return;
        }

        // Khi đăng nhập thành công, Google trả về access_token
        // Ta dùng nó để gọi API lấy thông tin User
        this.fetchUserInfo(response.access_token);
      }
    });
  }

  // Hàm này được gọi khi bạn click vào cái nút Custom của bạn
  loginWithCustomButton() {
    if (this.tokenClient) {
      // Mở Popup chọn tài khoản Google
      this.tokenClient.requestAccessToken();
    } else {
      console.warn('Thư viện Google chưa tải xong, vui lòng đợi...');
    }
  }

  // Hàm gọi API để lấy ra Tên, Email, Hình ảnh
  fetchUserInfo(accessToken: string) {
    fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
      .then(res => res.json())
      .then(userInfo => {
        this.userProfile = userInfo;
        localStorage.setItem('user_data', JSON.stringify(userInfo));
        this.router.navigate(['/']);
      })
      .catch(err => console.error('Lỗi khi lấy thông tin user:', err));
  }

  logout() {
    this.userProfile = null;
    localStorage.removeItem('user_data');
    google.accounts.oauth2.revoke(localStorage.getItem('token'), () => { });
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
