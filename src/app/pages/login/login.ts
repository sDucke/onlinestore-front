import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login implements OnInit {
  user = '';
  password = '';
  loading = false;
  errorMessage = '';

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  async ngOnInit(): Promise<void> {
    if (this.route.snapshot.queryParamMap.get('error') === 'config') {
      this.errorMessage =
        'Falta configurar LOGIN_USER y LOGIN_PASSWORD en Dokploy.';
    }

    await this.checkCurrentSession();
  }

  async submit(): Promise<void> {
    if (this.loading) {
      return;
    }

    this.errorMessage = '';
    this.loading = true;

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          user: this.user.trim(),
          password: this.password,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { message?: string }
          | null;
        this.errorMessage = payload?.message ?? 'Credenciales inválidas.';
        return;
      }

      const redirectTo = this.route.snapshot.queryParamMap.get('redirect') || '/';
      await this.router.navigateByUrl(redirectTo);
    } catch {
      this.errorMessage = 'No se pudo conectar al servidor.';
    } finally {
      this.loading = false;
    }
  }

  private async checkCurrentSession(): Promise<void> {
    try {
      const response = await fetch('/api/auth/status', { credentials: 'include' });
      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as { authenticated?: boolean };
      if (!payload.authenticated) {
        return;
      }

      const redirectTo = this.route.snapshot.queryParamMap.get('redirect') || '/';
      await this.router.navigateByUrl(redirectTo);
    } catch {
      // Ignore startup auth check errors and keep login screen.
    }
  }
}
