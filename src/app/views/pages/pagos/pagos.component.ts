import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface Venta {
  id: number;
  fechaVenta: string;
  total: number;
  estado: string;
  detalles: VentaDetalle[];
  cliente?: Cliente;
}

interface VentaDetalle {
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  producto?: Producto;
}

interface Producto {
  id: number;
  nombre: string;
  imagenUrl?: string;
}

interface Cliente {
  id: number;
  nombres: string;
  apellidos: string;
}

interface PagoRequest {
  ventaId: number;
  metodo: string;
  trabajadorId?: number;
}

@Component({
  selector: 'app-gestion-pagos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container">
      <div class="header">
        <h1>💳 Gestión de Pagos</h1>
        <p class="subtitle">Ventas pendientes y registro de pagos</p>
      </div>

      <!-- Listado de Ventas Pendientes -->
      <div class="section">
        <h2>🔄 Ventas Pendientes de Pago</h2>
        <div *ngIf="ventasPendientes.length === 0" class="empty-state">
          No hay ventas pendientes de pago
        </div>

        <div class="venta-card" *ngFor="let venta of ventasPendientes">
          <div class="venta-header">
            <span class="venta-id">Venta #{{venta.id}}</span>
            <span class="venta-fecha">{{venta.fechaVenta | date}}</span>
            <span class="venta-total">Total: S/ {{venta.total.toFixed(2)}}</span>
          </div>

          <div class="venta-detalles">
            <div class="detalle-item" *ngFor="let detalle of venta.detalles">
              <img [src]="detalle.producto?.imagenUrl || 'assets/default-product.png'"
                   class="producto-image">
              <div class="detalle-info">
                <h4>{{detalle.producto?.nombre || 'Producto ' + detalle.productoId}}</h4>
                <p>{{detalle.cantidad}} x S/ {{detalle.precioUnitario.toFixed(2)}}</p>
              </div>
              <div class="detalle-subtotal">
                S/ {{detalle.subtotal.toFixed(2)}}
              </div>
            </div>
          </div>

          <!-- Formulario de Pago -->
          <div class="pago-form" *ngIf="ventaSeleccionada === venta.id">
            <h3>Registrar Pago</h3>

            <div class="form-group">
              <label>Método de Pago:</label>
              <select [(ngModel)]="pagoRequest.metodo">
                <option value="EFECTIVO">Efectivo</option>
                <option value="TARJETA">Tarjeta</option>
                <option value="TRANSFERENCIA">Transferencia</option>
              </select>
            </div>

            <div *ngIf="pagoRequest.metodo === 'TRANSFERENCIA'" class="form-group">
              <label>Comprobante:</label>
              <input type="file" (change)="onFileSelected($event)">
            </div>

            <div class="form-actions">
              <button (click)="cancelarPago()">Cancelar</button>
              <button (click)="registrarPago(venta.id)"
                      [disabled]="!pagoRequest.metodo || (pagoRequest.metodo === 'TRANSFERENCIA' && !comprobante)">
                Registrar Pago
              </button>
            </div>
          </div>

          <button *ngIf="ventaSeleccionada !== venta.id"
                  (click)="seleccionarVenta(venta.id)"
                  class="pagar-btn">
            Registrar Pago
          </button>
        </div>
      </div>

      <!-- Mensajes de estado -->
      <div *ngIf="mensaje" class="alert success">
        {{mensaje}}
      </div>
      <div *ngIf="error" class="alert error">
        {{error}}
      </div>
    </div>
  `,
  styles: [`
    /* Estilos similares a los del componente anterior */
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .header {
      text-align: center;
      margin-bottom: 30px;
    }

    .venta-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .venta-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 1px solid #eee;
    }

    .venta-detalles {
      margin-bottom: 15px;
    }

    .detalle-item {
      display: flex;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px dashed #eee;
    }

    .producto-image {
      width: 50px;
      height: 50px;
      object-fit: cover;
      border-radius: 4px;
      margin-right: 15px;
    }

    .detalle-info {
      flex-grow: 1;
    }

    .pago-form {
      margin-top: 20px;
      padding: 15px;
      background: #f9f9f9;
      border-radius: 8px;
    }

    .form-group {
      margin-bottom: 15px;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }

    .pagar-btn {
      background: #4CAF50;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
    }

    .alert {
      padding: 15px;
      border-radius: 4px;
      margin: 20px 0;
    }

    .success {
      background: #dff0d8;
      color: #3c763d;
    }

    .error {
      background: #f2dede;
      color: #a94442;
    }
  `]
})
export class GestionPagosComponent implements OnInit {
  ventasPendientes: Venta[] = [];
  ventaSeleccionada: number | null = null;
  pagoRequest: PagoRequest = {
    ventaId: 0,
    metodo: 'EFECTIVO'
  };
  comprobante: File | null = null;
  mensaje: string = '';
  error: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.cargarVentasPendientes();
  }

  cargarVentasPendientes() {
    // Obtener ID del cliente de la sesión/auth
    const clienteId = 1; // Reemplazar con ID real

    this.http.get<Venta[]>(`http://localhost:8085/pagos/pendientes/${clienteId}`)
      .subscribe({
        next: (ventas) => {
          this.ventasPendientes = ventas;
        },
        error: (err) => {
          this.error = 'Error al cargar ventas pendientes';
          console.error(err);
        }
      });
  }

  seleccionarVenta(ventaId: number) {
    this.ventaSeleccionada = ventaId;
    this.pagoRequest.ventaId = ventaId;
  }

  cancelarPago() {
    this.ventaSeleccionada = null;
    this.pagoRequest = { ventaId: 0, metodo: 'EFECTIVO' };
    this.comprobante = null;
  }

  onFileSelected(event: any) {
    this.comprobante = event.target.files[0];
  }

  registrarPago(ventaId: number) {
    if (!this.pagoRequest.metodo) {
      this.error = 'Seleccione un método de pago';
      return;
    }

    if (this.pagoRequest.metodo === 'TRANSFERENCIA' && !this.comprobante) {
      this.error = 'Debe subir un comprobante para transferencias';
      return;
    }

    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(this.pagoRequest)], {
      type: 'application/json'
    }));

    if (this.comprobante) {
      formData.append('archivo', this.comprobante);
    }

    this.http.post('http://localhost:8085/pagos', formData)
      .subscribe({
        next: () => {
          this.mensaje = 'Pago registrado correctamente';
          this.cancelarPago();
          this.cargarVentasPendientes();
          setTimeout(() => this.mensaje = '', 3000);
        },
        error: (err) => {
          this.error = 'Error al registrar pago: ' +
            (err.error?.message || err.message || 'Error desconocido');
          console.error(err);
        }
      });
  }
}
