import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
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
export class AccountComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  private router = inject(Router);

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

  // Passcode (OTP)
  otpDigits = signal<string[]>(['', '', '', '', '', '']);
  countdown = signal<number>(0);
  private countdownTimer: any = null;
  private readonly RESEND_SECONDS = 60;

  // EmailJS config
  private SERVICE_ID = 'service_kkr2lmd';
  private TEMPLATE_ID = 'template_6xw8k3q';
  private PUBLIC_KEY = 'w30nxF8pT-xl7ygGO';

  generatedOTP: string = '';

  ngOnInit(): void {
    this.authService.initGoogle();
  }

  ngOnDestroy(): void {
    if (this.countdownTimer) clearInterval(this.countdownTimer);
  }

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
          localStorage.setItem('token', 'fake-jwt-token');
          this.authService.user.set(data);
          this.router.navigate(['/']);
        } else {
          this.loginError.set('Invalid email or password.');
        }
      } else {
        this.loginError.set('Invalid email or password.');
      }
    }, 1500);
  }

  // ==== Passcode handlers ====
  onOtpInput(index: number, event: Event) {
    const input = event.target as HTMLInputElement;
    const val = input.value.replace(/\D/g, '').slice(-1);
    const arr = [...this.otpDigits()];
    arr[index] = val;
    this.otpDigits.set(arr);
    input.value = val;
    if (val && index < 5) {
      const next = input.parentElement?.children[index + 1] as HTMLInputElement | undefined;
      next?.focus();
    }
  }

  onOtpKeydown(index: number, event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    if (event.key === 'Backspace' && !input.value && index > 0) {
      const prev = input.parentElement?.children[index - 1] as HTMLInputElement | undefined;
      prev?.focus();
    } else if (event.key === 'ArrowLeft' && index > 0) {
      (input.parentElement?.children[index - 1] as HTMLInputElement)?.focus();
    } else if (event.key === 'ArrowRight' && index < 5) {
      (input.parentElement?.children[index + 1] as HTMLInputElement)?.focus();
    }
  }

  onOtpPaste(event: ClipboardEvent) {
    event.preventDefault();
    const text = (event.clipboardData?.getData('text') || '').replace(/\D/g, '').slice(0, 6);
    if (!text) return;
    const arr = ['', '', '', '', '', ''];
    for (let i = 0; i < text.length; i++) arr[i] = text[i];
    this.otpDigits.set(arr);
    const container = (event.target as HTMLInputElement).parentElement;
    const focusIdx = Math.min(text.length, 5);
    (container?.children[focusIdx] as HTMLInputElement)?.focus();
  }

  private getOtpValue(): string {
    return this.otpDigits().join('');
  }

  private startCountdown() {
    this.countdown.set(this.RESEND_SECONDS);
    if (this.countdownTimer) clearInterval(this.countdownTimer);
    this.countdownTimer = setInterval(() => {
      const next = this.countdown() - 1;
      if (next <= 0) {
        this.countdown.set(0);
        clearInterval(this.countdownTimer);
        this.countdownTimer = null;
      } else {
        this.countdown.set(next);
      }
    }, 1000);
  }

  async onSendCode() {
    this.registerError.set('');
    if (!this.registerEmail) {
      this.registerError.set('Please enter your email first');
      return;
    }
    const name = (this.firstName + ' ' + this.lastName).trim() || 'User';
    this.startCountdown();
    await this.sendVerificationEmail(name, this.registerEmail);
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

    const otp = this.getOtpValue();
    if (otp.length !== 6) {
      this.registerError.set('Please enter the 6-digit verification code');
      return;
    }
    const savedOTP = sessionStorage.getItem('temp_otp');
    if (!savedOTP) {
      this.registerError.set('Please request a verification code first');
      return;
    }
    if (otp !== savedOTP) {
      this.registerError.set('Invalid verification code');
      return;
    }

    this.isLoading.set(true);
    setTimeout(() => {
      this.isLoading.set(false);
      this.registerSuccess.set(true);
      const user = {
        sub: 'local_' + Math.random().toString(36).substr(2, 9),
        name: this.firstName + ' ' + this.lastName,
        given_name: this.firstName,
        family_name: this.lastName,
        picture: this.avatarUrl,
        email: this.registerEmail,
        email_verified: true,
        pass: this.registerPassword
      };
      localStorage.setItem('user_data', JSON.stringify(user));
      sessionStorage.removeItem('temp_otp');
      this.activeTab.set('login');
      this.firstName = '';
      this.lastName = '';
      this.registerEmail = '';
      this.registerPassword = '';
      this.otpDigits.set(['', '', '', '', '', '']);
      this.agreeTerms = false;
    }, 1500);
  }

  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendVerificationEmail(userName: string, userEmail: string) {
    this.generatedOTP = this.generateOTP();
    const templateParams = {
      user_name: userName,
      user_email: userEmail,
      otp_code: this.generatedOTP,
    };
    try {
      const response = await emailjs.send(
        this.SERVICE_ID, this.TEMPLATE_ID, templateParams, this.PUBLIC_KEY
      );
      console.log('Email sent!', response.status, response.text);
      sessionStorage.setItem('temp_otp', this.generatedOTP);
    } catch (error) {
      console.error('Send mail failed', error);
      this.registerError.set('Could not send verification email. Please try again.');
      this.countdown.set(0);
      if (this.countdownTimer) { clearInterval(this.countdownTimer); this.countdownTimer = null; }
    }
  }
}