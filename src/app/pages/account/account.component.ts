import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { CartSidebarComponent } from '../../components/cart-sidebar/cart-sidebar.component';
import { AuthService } from '../../services/auth.service';
import emailjs from '@emailjs/browser';

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
  avatarUrl = 'https://ui-avatars.com/api/?name=User&background=random';
  agreeTerms = false;
  showRegisterPassword = signal<boolean>(false);
  registerError = signal<string>('');
  registerSuccess = signal<boolean>(false);

  //send code otp
  private SERVICE_ID = 'service_kkr2lmd';
  private TEMPLATE_ID = 'template_6xw8k3q';
  private PUBLIC_KEY = 'w30nxF8pT-xl7ygGO';

  generatedOTP: string = '';
  userEnteredOTP: string = '';

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
      let user = localStorage.getItem('user_data');
      if (user) {
        let data = JSON.parse(user);
        if (data.email === this.loginEmail && data.pass === this.loginPassword) {
          this.authService.user.set(data); // Cập nhật user trong AuthService
          this.router.navigate(['/']);
        } else {
          this.loginError.set('Invalid email or password.');
        }
      } else {
        this.loginError.set('Invalid email or password.');
      }
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
      const user = {
        sub: "local_" + Math.random().toString(36).substr(2, 9), // Tạo ID ngẫu nhiên
        name: this.firstName + ' ' + this.lastName,
        given_name: this.firstName,
        family_name: this.lastName,
        picture: this.avatarUrl,
        email: this.registerEmail,
        email_verified: true,
        pass: this.registerPassword
      };

      const name = this.firstName + ' ' + this.lastName;
      const email = this.registerEmail;

      this.sendVerificationEmail(name, email);

      // localStorage.setItem('user_data', JSON.stringify(user));
      // localStorage.setItem('token', 'fake-jwt-token');

      // this.firstName = '';
      // this.lastName = '';
      // this.registerEmail = '';
      // this.registerPassword = '';
      // this.agreeTerms = false;
      // this.activeTab.set('login');
    }, 1500);
  }

  //send OTP code to email
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendVerificationEmail(userName: string, userEmail: string) {
    this.generatedOTP = this.generateOTP();

    const templateParams = {
      user_name: userName,
      user_email: userEmail,
      otp_code: this.generatedOTP, // Mã này sẽ điền vào {{otp_code}} trong template
    };

    try {
      const response = await emailjs.send(
        this.SERVICE_ID,
        this.TEMPLATE_ID,
        templateParams,
        this.PUBLIC_KEY
      );

      console.log('Email đã được gửi thành công!', response.status, response.text);
      alert('Một mã xác thực đã được gửi đến email của bạn!');

      // Lưu OTP vào localStorage hoặc biến tạm để so khớp sau này
      sessionStorage.setItem('temp_otp', this.generatedOTP);

    } catch (error) {
      console.error('Gửi mail thất bại...', error);
      alert('Có lỗi xảy ra khi gửi mail.');
    }
  }

  verifyOTP() {
    const savedOTP = sessionStorage.getItem('temp_otp');

    if (this.userEnteredOTP === savedOTP) {
      alert('Xác thực thành công! Đang tạo tài khoản...');
      // Tiến hành lưu JSON vào localStorage như bài trước mình làm
      
    } else {
      alert('Mã xác thực không đúng, vui lòng kiểm tra lại.');
    }
  }
}
