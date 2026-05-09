import { Injectable, signal } from '@angular/core';

declare var google: any;

@Injectable({ providedIn: 'root' })
export class AuthService {
    user = signal<any>(null);

    private clientId = '1092586557004-h2cl9706bn9p0jqe2291n690urp41n6g.apps.googleusercontent.com';
    private tokenClient: any = null;
    private accessToken: string | null = null;
    private googleReady = signal<boolean>(false);

    constructor() {
        // Khôi phục user đã lưu (nếu có)
        const saved = localStorage.getItem('user_data');
        if (saved) {
            try { this.user.set(JSON.parse(saved)); } catch { }
        }
        this.accessToken = localStorage.getItem('token');
    }

    /** Tải thư viện GSI và khởi tạo token client */
    initGoogle(): Promise<void> {
        return new Promise((resolve) => {
            if (typeof google !== 'undefined' && google.accounts) {
                this.initTokenClient();
                resolve();
                return;
            }
            const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
            if (existing) {
                existing.addEventListener('load', () => { this.initTokenClient(); resolve(); });
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = () => { this.initTokenClient(); resolve(); };
            document.head.appendChild(script);
        });
    }

    private initTokenClient() {
        this.tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: this.clientId,
            scope: 'email profile openid',
            callback: (response: any) => {
                if (response.error !== undefined) {
                    console.error('Đăng nhập bị lỗi hoặc bị hủy:', response);
                    return;
                }
                this.accessToken = response.access_token;
                localStorage.setItem('token', response.access_token);
                this.fetchUserInfo(response.access_token);
            }
        });
        this.googleReady.set(true);
    }

    /** Mở popup đăng nhập Google */
    loginWithGoogle(): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (!this.tokenClient) {
                await this.initGoogle();
            }
            if (!this.tokenClient) {
                reject(new Error('Google library chưa sẵn sàng'));
                return;
            }
            // Override callback tạm thời để resolve promise
            this.tokenClient.callback = (response: any) => {
                if (response.error !== undefined) {
                    reject(response);
                    return;
                }
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

    /** Dùng cho One Tap / credential flow (JWT) */
    handleCredentialResponse(response: any) {
        const base64Url = response.credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        this.user.set(payload);
        localStorage.setItem('user_data', JSON.stringify(payload));
    }

    logout() {
        const token = this.accessToken || localStorage.getItem('token');
        if (token && typeof google !== 'undefined' && google.accounts?.oauth2?.revoke) {
            try { google.accounts.oauth2.revoke(token, () => { }); } catch { }
        }
        this.user.set(null);
        this.accessToken = null;
        localStorage.removeItem('user_data');
        localStorage.removeItem('token');
    }
}
