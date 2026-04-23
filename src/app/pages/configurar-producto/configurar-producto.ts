import { Component, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../api-base';

export interface ProductPayload {
  nombre: string;
  detalles: string;
  precio: number | null;
  cantidad: number | null;
  categoria: string;
}

@Component({
  selector: 'app-configurar-producto',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './configurar-producto.html',
  styleUrls: ['./configurar-producto.css']
})
export class ConfigurarProducto {
  private readonly uploadProductUrl = `${API_BASE_URL}/products/upload`;
  private router = inject(Router);
  private http = inject(HttpClient);

  previewUrl = signal<string | null>(null);
  isSubmitting = signal<boolean>(false);

  // Form signals
  nombre = signal('');
  detalles = signal('');
  precio = signal<number | null>(null);
  cantidad = signal<number | null>(null);
  categoria = signal('');

  constructor() {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state?.['image']) {
      this.previewUrl.set(navigation.extras.state['image']);
    }
  }

  async publicarProducto() {
    if (!this.nombre() || !this.precio() || !this.cantidad() || !this.categoria()) {
      alert("Por favor, completa los campos obligatorios antes de publicar.");
      return;
    }

    this.isSubmitting.set(true);

    const formData = new FormData();
    formData.append('nombre', this.nombre());
    formData.append('detalles', this.detalles());
    formData.append('precio', this.precio()!.toString());
    formData.append('cantidad', this.cantidad()!.toString());
    formData.append('categoria', this.categoria());

    const imageUrl = this.previewUrl();
    if (imageUrl) {
      try {
        // Conversión de la Data URL a Blob validable para el server
        const res = await fetch(imageUrl);
        const blob = await res.blob();
        formData.append('file', blob, 'producto.jpg');
        formData.append('image', blob, 'producto.jpg');
      } catch (e) {
        console.error("Error procesando la imagen a Blob:", e);
      }
    }

    console.log("Subiendo inventario final a Backend...");

    this.http.post(this.uploadProductUrl, formData).subscribe({
      next: (response: any) => {
        this.isSubmitting.set(false);
        console.log("Producto guardado:", response);
        if (response.n8n_response_image) {
          this.router.navigate(['/disenos'], {
            state: {
              image: response.n8n_response_image,
              socialPost: response.social_post,
              productName: this.nombre(),
              precio: this.precio(),
              cantidad: this.cantidad(),
              categoria: this.categoria(),
              detalles: this.detalles()
            }
          }).then(() => {
            alert("¡Inventario actualizado con éxito!");
          });
        } else {
          alert("Error al conectar con la IA");
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        console.error("Fallo durante la subida del producto:", err);
        alert("Ocurrió un problema de red al publicar el producto.");
      }
    });
  }
}
