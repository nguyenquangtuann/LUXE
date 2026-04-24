import { Injectable, signal } from '@angular/core';
import { Product } from './cart.service';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private _products = signal<Product[]>([
    {
      id: 1,
      name: 'Silk Elegance Blazer',
      price: 1250,
      image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=800&fit=crop',
      imageHover: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=800&fit=crop',
      category: 'Outerwear',
      description: 'Luxurious silk-blend blazer with refined tailoring',
      new: true
    },
    {
      id: 2,
      name: 'Heritage Leather Tote',
      price: 890,
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=800&fit=crop',
      imageHover: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=800&fit=crop',
      category: 'Accessories',
      description: 'Handcrafted Italian leather with gold hardware',
      new: true
    },
    {
      id: 3,
      name: 'Cashmere Infinity Scarf',
      price: 425,
      image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&h=800&fit=crop',
      imageHover: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=600&h=800&fit=crop',
      category: 'Accessories',
      description: 'Pure Mongolian cashmere in timeless design',
      new: false
    },
    {
      id: 4,
      name: 'Artisan Gold Timepiece',
      price: 3450,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=800&fit=crop',
      imageHover: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=800&fit=crop',
      category: 'Watches',
      description: 'Swiss movement with 18k gold accents',
      new: true
    },
    {
      id: 5,
      name: 'Velvet Evening Gown',
      price: 1890,
      image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&h=800&fit=crop',
      imageHover: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=800&fit=crop',
      category: 'Dresses',
      description: 'Hand-sewn velvet with subtle shimmer finish',
      new: false
    },
    {
      id: 6,
      name: 'Premium Leather Loafers',
      price: 650,
      image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&h=800&fit=crop',
      imageHover: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&h=800&fit=crop',
      category: 'Footwear',
      description: 'Italian craftsmanship with comfort insoles',
      new: false
    },
    {
      id: 7,
      name: 'Diamond Drop Earrings',
      price: 2890,
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=800&fit=crop',
      imageHover: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=600&h=800&fit=crop',
      category: 'Jewelry',
      description: 'Ethically sourced diamonds in platinum setting',
      new: true
    },
    {
      id: 8,
      name: 'Merino Wool Sweater',
      price: 380,
      image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=800&fit=crop',
      imageHover: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&h=800&fit=crop',
      category: 'Knitwear',
      description: 'Ultra-fine merino with ribbed detailing',
      new: true
    },
    {
      id: 9,
      name: 'Classic Wool Coat',
      price: 1680,
      image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&h=800&fit=crop',
      imageHover: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&h=800&fit=crop',
      category: 'Outerwear',
      description: 'Double-breasted wool coat with satin lining',
      new: false
    },
    {
      id: 10,
      name: 'Silver Chain Necklace',
      price: 520,
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=800&fit=crop',
      imageHover: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=800&fit=crop',
      category: 'Jewelry',
      description: 'Sterling silver chain with pendant',
      new: false
    },
    {
      id: 11,
      name: 'Designer Sunglasses',
      price: 420,
      image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&h=800&fit=crop',
      imageHover: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=800&fit=crop',
      category: 'Accessories',
      description: 'Polarized lenses with titanium frames',
      new: true
    },
    {
      id: 12,
      name: 'Minimalist Sneakers',
      price: 295,
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=800&fit=crop',
      imageHover: 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=600&h=800&fit=crop',
      category: 'Footwear',
      description: 'Italian leather with memory foam insoles',
      new: false
    },
    {
      id: 13,
      name: 'Minimalist Sneakers 2',
      price: 302,
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=800&fit=crop',
      imageHover: 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=600&h=800&fit=crop',
      category: 'Accessories',
      description: 'Italian leather with memory foam insoles',
      new: true
    }
  ]);

  readonly products = this._products.asReadonly();

  getProductById(id: number): Product | undefined {
    return this._products().find(p => p.id === id);
  }

  getProductsByCategory(category: string): Product[] {
    return this._products().filter(p => p.category === category);
  }
}
