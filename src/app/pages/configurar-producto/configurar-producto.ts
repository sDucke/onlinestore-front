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
  private readonly upsertProductUrl = `${API_BASE_URL}/products/upsert`;
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

  async publicarProducto(generarDiseno: boolean) {
    if (!this.nombre() || !this.precio() || !this.cantidad() || !this.categoria()) {
      alert("Por favor, completa los campos obligatorios antes de publicar.");
      return;
    }

    this.isSubmitting.set(true);

    const formData = new FormData();
    formData.append('nombre', this.nombre());
    
    const detallesJson = {
      texto: this.detalles(),
      diseno: generarDiseno
    };
    formData.append('detalles', JSON.stringify(detallesJson));
    
    formData.append('precio', this.toPriceParam(this.precio()));
    formData.append('cantidad', this.cantidad()!.toString());
    formData.append('categoria', this.categoria());

    const imageUrl = this.previewUrl();
    if (imageUrl) {
      try {
        const res = await fetch(imageUrl);
        const blob = await res.blob();
        formData.append('file', blob, 'producto.jpg');
        formData.append('image', blob, 'producto.jpg');
      } catch (e) {
        console.error("Error procesando la imagen a Blob:", e);
      }
    }

    if (generarDiseno) {
      this.subirConDiseno(formData);
    } else {
      this.subirSinDiseno(formData);
    }
  }

  private subirConDiseno(formData: FormData) {
    console.log("Subiendo con generación de diseño (n8n)...");

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

  private subirSinDiseno(formData: FormData) {
    console.log("Subiendo producto directo (sin n8n)...");

    this.http.post(this.upsertProductUrl, formData).subscribe({
      next: (response: any) => {
        this.isSubmitting.set(false);
        console.log("Producto guardado:", response);
        if (response.status === 'success') {
          this.router.navigate(['/tienda']).then(() => {
            alert("¡Producto publicado con éxito!");
          });
        } else {
          alert("Error: " + (response.message || "No se pudo publicar el producto"));
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        console.error("Fallo durante la subida del producto:", err);
        alert("Ocurrió un problema de red al publicar el producto.");
      }
    });
  }

  private toPriceParam(value: number | null): string {
    if (value === null || value === undefined) {
      return '0.00';
    }
    return value.toFixed(2);
  }
}
