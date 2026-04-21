import { Component, ElementRef, OnDestroy, ViewChild, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-publicar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './publicar.html',
  styleUrls: ['./publicar.css']
})
export class Publicar implements OnDestroy {
  private router = inject(Router);
  private http = inject(HttpClient);

  isDragging = signal(false);
  isUploading = signal(false);
  previewUrl = signal<string | null>(null);
  validationResult = signal<'pending' | 'success' | 'invalid' | 'error'>('pending');

  cameraOpen = signal(false);
  cameraError = signal<string | null>(null);

  private cameraStream: MediaStream | null = null;
  private videoRef?: ElementRef<HTMLVideoElement>;
  private canvasRef?: ElementRef<HTMLCanvasElement>;

  @ViewChild('videoElement')
  set videoElementSetter(ref: ElementRef<HTMLVideoElement> | undefined) {
    this.videoRef = ref;

    if (ref?.nativeElement && this.cameraStream) {
      ref.nativeElement.srcObject = this.cameraStream;
    }
  }

  @ViewChild('canvasElement')
  set canvasElementSetter(ref: ElementRef<HTMLCanvasElement> | undefined) {
    this.canvasRef = ref;
  }

  ngOnDestroy(): void {
    this.closeCamera();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }

    input.value = '';
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(false);

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  async openCamera() {
    this.closeCamera();
    this.previewUrl.set(null);
    this.validationResult.set('pending');
    this.cameraError.set(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.cameraError.set('Este navegador no soporta acceso a la cámara.');
      return;
    }

    try {
      this.cameraStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      this.cameraOpen.set(true);

      if (this.videoRef?.nativeElement) {
        this.videoRef.nativeElement.srcObject = this.cameraStream;
      }
    } catch (error) {
      console.error('Error al abrir la cámara:', error);
      this.cameraError.set('No se pudo abrir la cámara. Revisa permisos del navegador.');
      this.cameraOpen.set(false);
      this.cameraStream = null;
    }
  }

  takePhoto() {
    const video = this.videoRef?.nativeElement;
    const canvas = this.canvasRef?.nativeElement;

    if (!video || !canvas) {
      this.cameraError.set('La vista de cámara no está lista.');
      return;
    }

    const width = video.videoWidth;
    const height = video.videoHeight;

    if (!width || !height) {
      this.cameraError.set('La cámara aún no está lista. Intenta nuevamente.');
      return;
    }

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      this.cameraError.set('No se pudo procesar la imagen.');
      return;
    }

    ctx.drawImage(video, 0, 0, width, height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          this.cameraError.set('No se pudo capturar la foto.');
          return;
        }

        const file = new File([blob], `captura-${Date.now()}.jpg`, {
          type: 'image/jpeg'
        });

        this.closeCamera();
        this.handleFile(file);
      },
      'image/jpeg',
      0.92
    );
  }

  closeCamera() {
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach(track => track.stop());
      this.cameraStream = null;
    }

    if (this.videoRef?.nativeElement) {
      this.videoRef.nativeElement.srcObject = null;
    }

    this.cameraOpen.set(false);
  }

  reset() {
    this.closeCamera();
    this.previewUrl.set(null);
    this.validationResult.set('pending');
    this.cameraError.set(null);
  }

  private handleFile(file: File) {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => this.previewUrl.set(e.target?.result as string);
    reader.readAsDataURL(file);

    this.uploadAndVerifyImage(file);
  }

  private uploadAndVerifyImage(file: File) {
    this.isUploading.set(true);
    this.validationResult.set('pending');

    const formData = new FormData();
    formData.append('image', file);
    formData.append('file', file);

    console.log(
      '🛠️ Evaluando Producto usando Endpoint...',
      'http://localhost:8080/api/products/validate-image'
    );

    this.http.post('http://localhost:8080/api/products/validate-image', formData).subscribe({
      next: (response: any) => {
        this.isUploading.set(false);

        const status = response?.status;

        if (status === 'valido') {
          this.validationResult.set('success');
          this.router.navigate(['/configurar-producto'], {
            state: { image: this.previewUrl(), data: response }
          });
        } else if (status === 'invalido') {
          this.validationResult.set('invalid');
        } else {
          this.validationResult.set('error');
        }
      },
      error: (err) => {
        this.isUploading.set(false);
        this.validationResult.set('error');
        console.error('Fallo durante verificación HTTP de imagen:', err);
      }
    });
  }
}