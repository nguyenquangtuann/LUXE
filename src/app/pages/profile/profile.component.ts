import { Component, computed, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { FooterComponent } from "../../components/footer/footer.component";
import { ProductsService } from "../../services/products.service";
import { FavoritesService } from "../../services/favorites.service";
import { CartService, Product } from "../../services/cart.service";

type TabId = "orders" | "wishlist" | "loyalty" | "addresses" | "settings";

interface ToggleSetting {
    id: string;
    label: string;
    sub: string;
    on: boolean;
}

interface FakeOrder {
    code: string;
    date: string;
    status: "done" | "ship" | "proc";
    statusLabel: string;
    product: Product;
}

@Component({
    selector: "app-profile",
    standalone: true,
    imports: [CommonModule, RouterLink, FooterComponent],
    templateUrl: "./profile.component.html",
    styleUrls: ["./profile.component.css"],
})
export class ProfileComponent {
    authService = inject(AuthService);
    productsService = inject(ProductsService);
    favoritesService = inject(FavoritesService);
    cartService = inject(CartService);

    activeTab = signal<TabId>("orders");
    toastMessage = signal<string | null>(null);
    private toastTimer: any = null;

    tabs: { id: TabId; label: string }[] = [
        { id: "orders", label: "Đơn hàng" },
        { id: "wishlist", label: "Yêu thích" },
        { id: "loyalty", label: "Điểm thưởng" },
        { id: "addresses", label: "Địa chỉ" },
        { id: "settings", label: "Cài đặt" },
    ];

    settings = signal<ToggleSetting[]>([
        { id: "email", label: "Email thông báo", sub: "Nhận cập nhật đơn hàng qua email", on: true },
        { id: "sms", label: "Thông báo SMS", sub: "Trạng thái vận chuyển qua tin nhắn", on: true },
        { id: "promo", label: "Ưu đãi & khuyến mãi", sub: "Thông báo sale và sự kiện đặc biệt", on: false },
    ]);

    // ─── Real data (computed) ─────────────────────────────────────────
    favoriteProducts = computed(() => this.favoritesService.favorites());

    /** Use first 3 products from catalog as mock past orders (real product data). */
    orders = computed<FakeOrder[]>(() => {
        const products = this.productsService.products();
        const meta: Omit<FakeOrder, "product">[] = [
            { code: "LX2025001", date: "14 Th4, 2025", status: "done", statusLabel: "Đã giao hàng" },
            { code: "LX2025002", date: "02 Th5, 2025", status: "ship", statusLabel: "Đang vận chuyển" },
            { code: "LX2025003", date: "10 Th5, 2025", status: "proc", statusLabel: "Đang xử lý" },
        ];
        return meta
            .map((m, i) => products[i] ? { ...m, product: products[i] } : null)
            .filter((o): o is FakeOrder => o !== null);
    });

    /** Recommended products: take a slice of the catalog. */
    recommended = computed<Product[]>(() => {
        const all = this.productsService.products();
        // skip ones already in favorites for variety
        const favIds = new Set(this.favoritesService.favorites().map((p) => p.id));
        return all.filter((p) => !favIds.has(p.id)).slice(0, 8);
    });

    displayName = computed(() => {
        const u: any = this.authService.user();
        return u?.name || u?.given_name || "Khách hàng LUXE";
    });

    firstName = computed(() => {
        const name = this.displayName();
        return name.split(" ").slice(-1)[0];
    });

    initials = computed(() => {
        const name = this.displayName();
        return name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((s: string) => s[0]?.toUpperCase() ?? "")
            .join("") || "LX";
    });

    avatar = computed<string | null>(() => {
        const u: any = this.authService.user();
        return u?.picture || null;
    });

    handle = computed(() => {
        const u: any = this.authService.user();
        if (u?.email) return "@" + u.email.split("@")[0];
        return "@guest.luxe";
    });

    setTab(tab: TabId) {
        this.activeTab.set(tab);
    }

    toggleSetting(id: string) {
        this.settings.update((list) =>
            list.map((s) => (s.id === id ? { ...s, on: !s.on } : s)),
        );
    }

    toast(message: string) {
        this.toastMessage.set(message);
        if (this.toastTimer) clearTimeout(this.toastTimer);
        this.toastTimer = setTimeout(() => this.toastMessage.set(null), 2400);
    }

    formatPrice(value: number): string {
        return (value * 25000).toLocaleString("vi-VN") + "₫";
    }

    addToCart(product: Product, event: MouseEvent) {
        event.stopPropagation();
        this.cartService.addToCart(product, event);
        this.toast("🛒 Đã thêm " + product.name + " vào giỏ");
    }

    removeFavorite(product: Product, event: MouseEvent) {
        event.stopPropagation();
        this.favoritesService.removeFromFavorites(product.id);
        this.toast("💔 Đã bỏ yêu thích");
    }

    toggleFavorite(product: Product, event: MouseEvent) {
        event.stopPropagation();
        const added = this.favoritesService.toggleFavorite(product);
        this.toast(added ? "♥ Đã thêm yêu thích" : "💔 Đã bỏ yêu thích");
    }

    isFavorite(id: number): boolean {
        return this.favoritesService.isFavorite(id);
    }

    progressPct = 80;
}
