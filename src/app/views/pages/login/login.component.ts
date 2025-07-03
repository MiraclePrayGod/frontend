import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgStyle } from '@angular/common';
import { IconDirective } from '@coreui/icons-angular';
import {
  ContainerComponent,
  RowComponent,
  ColComponent,
  CardGroupComponent,
  TextColorDirective,
  CardComponent,
  CardBodyComponent,
  FormDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  FormControlDirective,
  ButtonDirective
} from '@coreui/angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ContainerComponent,
    RowComponent,
    ColComponent,
    CardGroupComponent,
    TextColorDirective,
    CardComponent,
    CardBodyComponent,
    FormDirective,
    InputGroupComponent,
    InputGroupTextDirective,
    IconDirective,
    FormControlDirective,
    ButtonDirective,
    NgStyle
  ],
  template: `
    <div class="bg min-vh-100 d-flex flex-row align-items-center">
      <c-container>
        <c-row class="justify-content-center">
          <c-col md="8" lg="6" xl="5">
            <c-card-group>
              <c-card class="p-4 login-card">
                <c-card-body>
                  <form #loginForm="ngForm" (ngSubmit)="onSubmit()">
                    <div class="text-center mb-4">
                      <img src="assets/logo.png" alt="Logo" class="login-logo">
                      <h2 class="login-title">Bienvenido</h2>
                      <p class="text-medium-emphasis">Ingresa tus credenciales para continuar</p>
                    </div>

                    <div class="mb-3">
                      <c-input-group>
                        <span cInputGroupText>
                          <svg cIcon name="cil-user"></svg>
                        </span>
                        <input
                          cFormControl
                          [(ngModel)]="credentials.username"
                          name="username"
                          placeholder="Usuario"
                          required
                          [ngClass]="{ 'is-invalid': loginForm.submitted && !credentials.username }"
                        />
                      </c-input-group>
                      <div *ngIf="loginForm.submitted && !credentials.username" class="invalid-feedback">
                        Usuario es requerido
                      </div>
                    </div>

                    <div class="mb-4">
                      <c-input-group>
                        <span cInputGroupText>
                          <svg cIcon name="cil-lock-locked"></svg>
                        </span>
                        <input
                          cFormControl
                          type="password"
                          [(ngModel)]="credentials.password"
                          name="password"
                          placeholder="Contraseña"
                          required
                          [ngClass]="{ 'is-invalid': loginForm.submitted && !credentials.password }"
                        />
                      </c-input-group>
                      <div *ngIf="loginForm.submitted && !credentials.password" class="invalid-feedback">
                        Contraseña es requerida
                      </div>
                    </div>

                    <c-row>
                      <c-col xs="6" class="text-start">
                        <label cCheck class="c-switch c-switch-primary">
                          <input type="checkbox" class="c-switch-input" [(ngModel)]="rememberMe" name="rememberMe">
                          <span class="c-switch-slider"></span>
                          <span class="switch-label">Recordarme</span>
                        </label>
                      </c-col>
                      <c-col xs="6" class="text-end">
                        <a href="#" class="forgot-password">¿Olvidaste tu contraseña?</a>
                      </c-col>
                    </c-row>

                    <div class="d-grid gap-2 mt-4">
                      <button
                        cButton
                        color="primary"
                        type="submit"
                        [disabled]="loading"
                        [ngStyle]="{ 'cursor': loading ? 'wait' : 'pointer' }"
                      >
                        <span *ngIf="!loading">Ingresar</span>
                        <span *ngIf="loading">
                          <svg cIcon name="cil-spinner" class="spin"></svg> Procesando...
                        </span>
                      </button>
                    </div>

                    <div class="text-center mt-4">
                      <p class="register-text">¿No tienes una cuenta? <a routerLink="/register" class="register-link">Regístrate</a></p>
                    </div>
                  </form>
                </c-card-body>
              </c-card>
            </c-card-group>
          </c-col>
        </c-row>
      </c-container>
    </div>
  `,
  styles: [`
    .bg {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .login-card {
      border-radius: 15px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      border: none;
      overflow: hidden;
    }

    .login-logo {
      height: 60px;
      margin-bottom: 20px;
    }

    .login-title {
      color: #3a3a3a;
      font-weight: 600;
      margin-bottom: 5px;
    }

    .forgot-password {
      color: #6c757d;
      text-decoration: none;
      font-size: 0.875rem;
      transition: color 0.2s;
    }

    .forgot-password:hover {
      color: #4a5568;
      text-decoration: underline;
    }

    .register-text {
      color: #6c757d;
      margin-bottom: 0;
    }

    .register-link {
      color: #4e73df;
      text-decoration: none;
      font-weight: 600;
    }

    .register-link:hover {
      text-decoration: underline;
    }

    .switch-label {
      color: #6c757d;
      font-size: 0.875rem;
      margin-left: 5px;
    }

    .spin {
      animation: spin 1s linear infinite;
      margin-right: 8px;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .invalid-feedback {
      display: block;
      margin-top: 5px;
      color: #e55353;
      font-size: 0.875rem;
    }

    .is-invalid {
      border-color: #e55353 !important;
    }
  `]
})
export class LoginComponent {
  credentials = {
    username: '',
    password: ''
  };

  rememberMe = false;
  loading = false;

  onSubmit() {
    this.loading = true;

    // Simular llamada a API
    setTimeout(() => {
      console.log('Login attempt with:', this.credentials);
      this.loading = false;

      // Aquí iría la lógica real de autenticación
      // this.authService.login(this.credentials).subscribe(...)
    }, 1500);
  }
}
