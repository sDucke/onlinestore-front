import { Component, PLATFORM_ID, inject, signal, OnInit } from '@angular/core';
import { isPlatformBrowser, Location } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL, API_IMAGES_URL } from '../../api-base';

@Component({
  selector: 'app-producto-detalle',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './producto-detalle.html',
  styleUrls: ['./producto-detalle.css']
})
export class ProductoDetalle implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private http = inject(HttpClient);

  public readonly imagesUrl = API_IMAGES_URL;
  
  product = signal<any | null>(null);
  isLoading = signal<boolean>(true);

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Attempt to get product from navigation state (passed from Tienda)
    const navigation = this.router.getCurrentNavigation();
    const stateProduct = navigation?.extras.state?.['product'] || history.state?.product;

    if (stateProduct) {
      this.product.set(stateProduct);
      this.isLoading.set(false);
    } else {
      // Fallback: fetch from API by ID
      this.fetchProductById();
    }
  }

  fetchProductById() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.goBack();
      return;
    }

    // We fetch all products and find the one. Ideally the backend would have /products/:id
    this.http.get<any[]>(`${API_BASE_URL}/products/all`).subscribe({
      next: (data) => {
        const found = data.find(p => p.id.toString() === idParam);
        if (found) {
          this.product.set(found);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error("Error fetching product details", err);
        this.isLoading.set(false);
      }
    });
  }

  goBack() {
    this.location.back();
  }

  buyDirectly() {
    const p = this.product();
    if (!p) return;

    const phoneNumber = "593999999999"; // Reemplazar con número real
    const message = `Hola! Me interesa comprar el producto: *${p.name}* que está publicado en la tienda por $${p.price}.`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  }

  addToCart() {
    const p = this.product();
    if (!p) return;
    alert(`El producto ${p.name} se agregó al carrito (Funcionalidad en desarrollo).`);
  }
}
