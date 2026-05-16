import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
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
export class AccountComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  private router = inject(Router);

  get userProfile() { return this.authService.user(); }
  get isLoading() { return this.authService.isLoading(); }

  activeTab = signal<'login' | 'register'>('login');

  loginEmail = '';
  loginPassword = '';
  rememberMe = false;
  showLoginPassword = signal<boolean>(false);
  loginError = signal<string>('');

  firstName = '';
  lastName = '';
  registerEmail = '';
  registerPassword = '';
  agreeTerms = false;
  showRegisterPassword = signal<boolean>(false);
  registerError = signal<string>('');
  registerSuccess = signal<boolean>(false);

  otpDigits = signal<string[]>(['', '', '', '', '', '']);
  countdown = signal<number>(0);
  private countdownTimer: any = null;
  private readonly RESEND_SECONDS = 60;

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
      this.loginError.set('Đăng nhập Google thất bại, vui lòng thử lại.');
    }
  }

  async onLogin() {
    this.loginError.set('');
    if (!this.loginEmail || !this.loginPassword) {
      this.loginError.set('Please fill in all fields');
      return;
    }

    const success = await this.authService.loginLocal(this.loginEmail, this.loginPassword);
    if (success) {
      this.router.navigate(['/']);
    } else {
      this.loginError.set('Invalid email or password.');
    }
  }

  async onSendCode() {
    this.registerError.set('');
    if (!this.registerEmail) {
      this.registerError.set('Please enter your email first');
      return;
    }

    const name = `${this.firstName} ${this.lastName}`.trim() || 'User';
    this.startCountdown();

    const isSent = await this.authService.sendOtpEmail(name, this.registerEmail);
    if (!isSent) {
      this.registerError.set('Could not send verification email. Please try again.');
      this.stopCountdown();
    }
  }

  async onRegister() {
    this.registerError.set('');
    if (!this.firstName || !this.lastName || !this.registerEmail || !this.registerPassword) {
      this.registerError.set('Please fill in all fields'); return;
    }
    if (this.registerPassword.length < 8) {
      this.registerError.set('Password must be at least 8 characters'); return;
    }
    if (!this.agreeTerms) {
      this.registerError.set('Please agree to the Terms of Service'); return;
    }

    const otp = this.otpDigits().join('');
    if (otp.length !== 6) {
      this.registerError.set('Please enter the 6-digit verification code'); return;
    }

    const savedOTP = sessionStorage.getItem('temp_otp');
    if (!savedOTP) {
      this.registerError.set('Please request a verification code first'); return;
    }
    if (otp !== savedOTP) {
      this.registerError.set('Invalid verification code'); return;
    }

    await this.authService.registerLocal({
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.registerEmail,
      pass: this.registerPassword
    });

    this.registerSuccess.set(true);
    this.activeTab.set('login');
    this.clearRegisterForm();
  }

  onOtpInput(index: number, event: Event) {
    const input = event.target as HTMLInputElement;
    const val = input.value.replace(/\D/g, '').slice(-1);
    const arr = [...this.otpDigits()];
    arr[index] = val;
    this.otpDigits.set(arr);
    input.value = val;
    if (val && index < 5) {
      (input.parentElement?.children[index + 1] as HTMLInputElement | undefined)?.focus();
    }
  }

  onOtpKeydown(index: number, event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    if (event.key === 'Backspace' && !input.value && index > 0) {
      (input.parentElement?.children[index - 1] as HTMLInputElement | undefined)?.focus();
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
    (container?.children[Math.min(text.length, 5)] as HTMLInputElement)?.focus();
  }

  private startCountdown() {
    this.countdown.set(this.RESEND_SECONDS);
    if (this.countdownTimer) clearInterval(this.countdownTimer);
    this.countdownTimer = setInterval(() => {
      const next = this.countdown() - 1;
      if (next <= 0) this.stopCountdown();
      else this.countdown.set(next);
    }, 1000);
  }

  private stopCountdown() {
    this.countdown.set(0);
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
    sessionStorage.removeItem('temp_otp');
  }

  private clearRegisterForm() {
    this.firstName = '';
    this.lastName = '';
    this.registerEmail = '';
    this.registerPassword = '';
    this.otpDigits.set(['', '', '', '', '', '']);
    this.agreeTerms = false;
    this.stopCountdown();
    setTimeout(() => this.registerSuccess.set(false), 3000);
  }

  logout() {
    this.authService.logout();
  }
}