import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
    user = signal<any>(null);

    constructor() { }

    handleCredentialResponse(response: any) {
        // Giải mã Token (JWT) để lấy thông tin user
        const base64Url = response.credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));

        this.user.set(payload); // Lưu thông tin user (tên, email, ảnh)
        console.log('User Info:', payload);
    }

    logout() {
        this.user.set(null);
    }
}