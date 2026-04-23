import { Component, PLATFORM_ID, inject, signal, OnInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { API_BASE_URL, API_IMAGES_URL } from '../../api-base';

@Component({
  selector: 'app-disenos',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './disenos.html',
  styleUrls: ['./disenos.css']
})
export class Disenos implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly productsUrl = `${API_BASE_URL}/products/all`;
  private router = inject(Router);
  private http = inject(HttpClient);

  productsList = signal<any[]>([]);

  // Selected details
  selectedProductId = signal<number | null>(null);
  productName = signal<string>('');
  generatedImage = signal<string | null>(null);
  precio = signal<number | null>(null);
  cantidad = signal<number | null>(null);
  categoria = signal<string>('');
  detalles = signal<string>('');
  socialPostText = signal<string>('');

  showTemplate = signal<boolean>(false);
  showDetailsModal = signal<boolean>(false);
  isEditingDetails = signal<boolean>(false);

  constructor() {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state && navigation.extras.state['image']) {
      const st = navigation.extras.state;
      this.generatedImage.set(st['image']);
      if (st['productName']) this.productName.set(st['productName']);
      if (st['precio']) this.precio.set(st['precio']);
      if (st['cantidad']) this.cantidad.set(st['cantidad']);
      if (st['categoria']) this.categoria.set(st['categoria']);
      if (st['detalles']) this.detalles.set(st['detalles']);
      if (st['socialPost']) this.socialPostText.set(st['socialPost']);
    }
  }

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.fetchProducts();
  }

  fetchProducts() {
    this.http.get<any[]>(this.productsUrl).subscribe({
      next: (data) => {
        const reversed = [...data].reverse();
        this.productsList.set(reversed);

        if (!this.generatedImage() && reversed.length > 0) {
          this.selectProduct(reversed[0]);
        }
      },
      error: (err) => console.error("Error obteniendo productos:", err)
    });
  }

  selectProduct(product: any) {
    this.selectedProductId.set(product.id);
    if (product.designImagePath) {
      this.generatedImage.set(`${API_IMAGES_URL}/${product.designImagePath}`);
    } else {
      this.generatedImage.set(null);
    }

    this.productName.set(product.name);
    this.precio.set(product.price);
    this.cantidad.set(product.stock);
    this.categoria.set(product.category);
    this.detalles.set(product.details);
    this.socialPostText.set(product.socialPost || '');
  }

  toggleTemplate(product?: any) {
    if (product) {
      this.selectProduct(product);
    }
    this.showTemplate.set(true);
  }

  toggleDetailsModal() {
    this.showDetailsModal.set(!this.showDetailsModal());
    this.isEditingDetails.set(false); // Reset edit state when toggling
  }

  toggleEditMode() {
    this.isEditingDetails.set(!this.isEditingDetails());
  }

  saveProductEdit() {
    const id = this.selectedProductId();
    if (!id) {
      alert("No hay un producto válido seleccionado para editar.");
      return;
    }

    const params: any = {
      nombre: this.productName(),
      precio: this.precio()?.toString() || '0',
      cantidad: this.cantidad()?.toString() || '0',
      categoria: this.categoria(),
      detalles: this.detalles()
    };

    console.log("Guardando datos...", params);

    this.http.put(`${API_BASE_URL}/products/update/${id}`, null, { params }).subscribe({
      next: (response: any) => {
        alert("¡Producto actualizado exitosamente!");
        this.isEditingDetails.set(false);
        this.fetchProducts(); // Recargar lista para reflejar cambios
      },
      error: (err) => {
        console.error("Error actualizando producto:", err);
        alert("No se pudo actualizar el producto. Verifica la conexión.");
      }
    });
  }

  copyToClipboard(text: string) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        alert("¡Texto copiado al portapapeles!");
      }).catch(err => {
        console.error("No se pudo copiar al portapapeles", err);
      });
    } else {
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        alert("¡Texto copiado al portapapeles!");
      } catch (err) {
        console.error("No se pudo copiar al portapapeles", err);
      }
      document.body.removeChild(textArea);
    }
  }
}
