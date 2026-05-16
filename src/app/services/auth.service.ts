import { Injectable, signal } from '@angular/core';
import emailjs from '@emailjs/browser';

declare var google: any;

@Injectable({ providedIn: 'root' })
export class AuthService {
    user = signal<any>(null);
    isLoading = signal<boolean>(false);

    private clientId = '1092586557004-h2cl9706bn9p0jqe2291n690urp41n6g.apps.googleusercontent.com';
    private tokenClient: any = null;
    private accessToken: string | null = null;
    private googleReady = signal<boolean>(false);

    // Cấu hình EmailJS
    private readonly SERVICE_ID = 'service_kkr2lmd';
    private readonly TEMPLATE_ID = 'template_6xw8k3q';
    private readonly PUBLIC_KEY = 'w30nxF8pT-xl7ygGO';

    constructor() {
        this.accessToken = localStorage.getItem('token');
        if (this.accessToken != null) {
            const saved = localStorage.getItem('user_data');
            if (saved) {
                try { this.user.set(JSON.parse(saved)); } catch { }
            }
        }
    }

    loginLocal(email: string, pass: string): Promise<boolean> {
        return new Promise((resolve) => {
            this.isLoading.set(true);
            setTimeout(() => {
                this.isLoading.set(false);
                const savedUser = localStorage.getItem('user_data');

                if (savedUser) {
                    const data = JSON.parse(savedUser);
                    if (data.email === email && data.pass === pass) {
                        localStorage.setItem('token', 'fake-jwt-token');
                        this.user.set(data);
                        resolve(true);
                        return;
                    }
                }
                resolve(false);
            }, 1500);
        });
    }

    async sendOtpEmail(name: string, email: string): Promise<boolean> {
        const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
        const templateParams = {
            user_name: name,
            user_email: email,
            otp_code: generatedOTP,
        };

        try {
            await emailjs.send(this.SERVICE_ID, this.TEMPLATE_ID, templateParams, this.PUBLIC_KEY);
            sessionStorage.setItem('temp_otp', generatedOTP);
            return true;
        } catch (error) {
            console.error('Send mail failed', error);
            return false;
        }
    }

    registerLocal(userData: { firstName: string; lastName: string; email: string; pass: string }): Promise<void> {
        return new Promise((resolve) => {
            this.isLoading.set(true);
            setTimeout(() => {
                this.isLoading.set(false);
                const newUser = {
                    sub: 'local_' + Math.random().toString(36).substring(2, 11),
                    name: `${userData.firstName} ${userData.lastName}`,
                    given_name: userData.firstName,
                    family_name: userData.lastName,
                    picture: `https://ui-avatars.com/api/?name=${userData.firstName}+${userData.lastName}&background=random`,
                    email: userData.email,
                    email_verified: true,
                    pass: userData.pass
                };

                localStorage.setItem('user_data', JSON.stringify(newUser));
                sessionStorage.removeItem('temp_otp');
                resolve();
            }, 1500);
        });
    }

    /** 4. Quản lý Google OAuth (Giữ nguyên gốc nhưng tối ưu lỗi Revoke Token Fake) */
    initGoogle(): Promise<void> {
        return new Promise((resolve) => {
            if (typeof google !== 'undefined' && google.accounts) {
                this.initTokenClient(); resolve(); return;
            }
            const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
            if (existing) {
                existing.addEventListener('load', () => { this.initTokenClient(); resolve(); }); return;
            }
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true; script.defer = true;
            script.onload = () => { this.initTokenClient(); resolve(); };
            document.head.appendChild(script);
        });
    }

    private initTokenClient() {
        this.tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: this.clientId,
            scope: 'email profile openid',
            callback: (response: any) => {
                if (response.error !== undefined) return;
                this.accessToken = response.access_token;
                localStorage.setItem('token', response.access_token);
                this.fetchUserInfo(response.access_token);
            }
        });
        this.googleReady.set(true);
    }

    loginWithGoogle(): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (!this.tokenClient) await this.initGoogle();
            if (!this.tokenClient) return reject(new Error('Google library chưa sẵn sàng'));

            this.tokenClient.callback = (response: any) => {
                if (response.error !== undefined) return reject(response);
                this.accessToken = response.access_token;
                localStorage.setItem('token', response.access_token);
                this.fetchUserInfo(response.access_token).then(resolve).catch(reject);
            };
            this.tokenClient.requestAccessToken();
        });
    }

    private async fetchUserInfo(accessToken: string) {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        const userInfo = await res.json();
        this.user.set(userInfo);
        localStorage.setItem('user_data', JSON.stringify(userInfo));
        return userInfo;
    }

    logout() {
        const token = this.accessToken || localStorage.getItem('token');
        // Chỉ gọi revoke nếu là token thật của Google (bắt đầu bằng ya29) nhằm tránh lỗi crash do dùng token fake khi test
        if (token && token.startsWith('ya29.') && typeof google !== 'undefined' && google.accounts?.oauth2?.revoke) {
            try { google.accounts.oauth2.revoke(token, () => { }); } catch { }
        }
        this.user.set(null);
        this.accessToken = null;
        localStorage.removeItem('user_data');
        localStorage.removeItem('token');
    }
}