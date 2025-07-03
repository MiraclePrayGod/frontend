import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-ventas-trabajador',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  template: `
    <div class="container">
      <h2>💰 Ventas - Trabajador</h2>

      <div class="top-bar">
        <button (click)="mostrarNuevaVenta = true">➕ Nueva Venta</button>
      </div>

      <!-- Lista de Ventas -->
      <div class="ventas-list" *ngIf="!mostrarNuevaVenta">
        <div class="venta-card" *ngFor="let venta of ventas">
          <div class="venta-header">
            <h3>Venta #{{ venta.id }}</h3>
            <span class="estado-badge" [class.sin-pagar]="venta.estado === 'SIN_PAGAR'"
                                 [class.pagada]="venta.estado === 'PAGADA'"
                                 [class.facturada]="venta.estado === 'FACTURADA'">
              {{ venta.estado }}
            </span>
          </div>

          <p><strong>Cliente:</strong> {{ venta.cliente?.nombres }} {{ venta.cliente?.apellidos }}</p>
          <p><strong>Fecha:</strong> {{ venta.fechaVenta | date:'mediumDate' }}</p>
          <p><strong>Total:</strong> S/ {{ venta.total?.toFixed(2) }}</p>

          <div class="productos-list">
            <div *ngFor="let detalle of venta.detalles" class="producto-item">
              {{ detalle.cantidad }} x {{ detalle.producto?.nombre }} (S/ {{ detalle.precioUnitario?.toFixed(2) }})
            </div>
          </div>

          <div class="venta-actions">
            <button *ngIf="venta.estado === 'SIN_PAGAR'" (click)="abrirModalPago(venta)">
              Marcar como Pagada
            </button>
            <button *ngIf="venta.estado === 'PAGADA'" (click)="abrirModalFactura(venta)">
              Facturar
            </button>
            <button class="delete-btn" (click)="eliminarVenta(venta.id!)">
              Eliminar
            </button>
          </div>
        </div>
      </div>

      <!-- Formulario de Nueva Venta -->
      <div class="venta-form" *ngIf="mostrarNuevaVenta">
        <h3>Nueva Venta</h3>

        <div class="form-section">
          <h4>1. Seleccionar Cliente</h4>
          <select [(ngModel)]="nuevaVenta.clienteId" required>
            <option *ngFor="let cliente of clientes" [value]="cliente.id">
              {{ cliente.nombres }} {{ cliente.apellidos }} - {{ cliente.tipoDocumento }}: {{ cliente.numeroDocumento }}
            </option>
          </select>
        </div>

        <div class="form-section">
          <h4>2. Agregar Productos</h4>
          <div class="add-product">
            <select [(ngModel)]="productoSeleccionado" (change)="actualizarPrecioUnitario()">
              <option *ngFor="let producto of productosDisponibles" [ngValue]="producto">
                {{ producto.nombre }} (Stock: {{ producto.stock }}) - S/ {{ producto.precioUnitario.toFixed(2) }}
              </option>
            </select>
            <input type="number" [(ngModel)]="cantidadProducto" min="1" [max]="productoSeleccionado?.stock || 1" placeholder="Cantidad">
            <button (click)="agregarProducto()" [disabled]="!productoSeleccionado || !cantidadProducto || cantidadProducto <= 0">
              Agregar
            </button>
          </div>

          <div class="productos-agregados">
            <h5>Productos en la venta:</h5>
            <div *ngFor="let detalle of nuevaVenta.detalles; let i = index" class="producto-agregado">
              <span>{{ detalle.cantidad }} x {{ detalle.producto?.nombre }} - S/ {{ detalle.subtotal?.toFixed(2) }}</span>
              <button (click)="eliminarProducto(i)">✕</button>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h4>3. Observaciones</h4>
          <textarea [(ngModel)]="nuevaVenta.observacion" placeholder="Observaciones adicionales..."></textarea>
        </div>

        <div class="totales">
          <h4>Total: S/ {{ calcularTotal().toFixed(2) }}</h4>
        </div>

        <div class="form-actions">
          <button (click)="registrarVenta()" [disabled]="nuevaVenta.detalles.length === 0 || !nuevaVenta.clienteId">
            Registrar Venta
          </button>
          <button class="cancel-btn" (click)="cancelarNuevaVenta()">Cancelar</button>
        </div>
      </div>

      <!-- Modal de Pago -->
      <div class="modal" *ngIf="mostrarModalPago">
        <div class="modal-content">
          <h3>Registrar Pago</h3>

          <div class="form-group">
            <label>Método de Pago:</label>
            <select [(ngModel)]="pagoRequest.metodo">
              <option value="CONTADO">Contado</option>
              <option value="TARJETA">Tarjeta</option>
              <option value="TRANSFERENCIA">Transferencia</option>
            </select>
          </div>

          <div class="form-group" *ngIf="pagoRequest.metodo === 'TRANSFERENCIA'">
            <label>Comprobante:</label>
            <input type="file" (change)="onComprobanteChange($event)">
          </div>

          <div class="modal-actions">
            <button (click)="registrarPago()">Confirmar Pago</button>
            <button class="cancel-btn" (click)="mostrarModalPago = false">Cancelar</button>
          </div>
        </div>
      </div>

      <!-- Modal de Facturación - Versión Mejorada -->
      <div class="modal" *ngIf="mostrarModalFactura">
        <div class="modal-content">
          <h3>Generar Factura</h3>

          <div *ngIf="ventaAFacturar">
            <div class="form-group">
              <label>Moneda:</label>
              <select [(ngModel)]="facturaRequest.moneda">
                <option value="PEN">Soles (PEN)</option>
                <option value="USD">Dólares (USD)</option>
              </select>
            </div>

            <div class="form-group">
              <label>Forma de Pago:</label>
              <select [(ngModel)]="facturaRequest.formaPago">
                <option value="CONTADO">Contado</option>
                <option value="CREDITO">Crédito</option>
              </select>
            </div>

            <div class="form-group">
              <label>Medio de Pago:</label>
              <select [(ngModel)]="facturaRequest.medioPago">
                <option value="EFECTIVO">Efectivo</option>
                <option value="TARJETA">Tarjeta</option>
                <option value="TRANSFERENCIA">Transferencia</option>
              </select>
            </div>

            <div class="form-group">
              <label>Observaciones:</label>
              <textarea [(ngModel)]="facturaRequest.observaciones" placeholder="Opcional"></textarea>
            </div>

            <div class="resumen-factura">
              <h4>Resumen de Factura</h4>
              <p><strong>Cliente:</strong> {{ obtenerNombreCliente(ventaAFacturar.clienteId) }}</p>
              <p><strong>Total:</strong> S/ {{ ventaAFacturar.total?.toFixed(2) }}</p>

              <div class="productos-factura">
                <h5>Productos:</h5>
                <div *ngFor="let detalle of ventaAFacturar.detalles" class="producto-factura">
                  {{ detalle.cantidad }} x {{ obtenerNombreProducto(detalle.productoId) }} -
                  S/ {{ (detalle.cantidad * detalle.precioUnitario).toFixed(2) }}
                </div>
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <button (click)="generarFactura()" [disabled]="generandoFactura">
              <span *ngIf="!generandoFactura">Generar Factura</span>
              <span *ngIf="generandoFactura">Procesando...</span>
            </button>
            <button class="cancel-btn" (click)="cerrarModalFactura()">Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f8f9fa;
      border-radius: 10px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }

    h2 {
      color: #2c3e50;
      text-align: center;
      margin-bottom: 25px;
      font-size: 28px;
      background: linear-gradient(90deg, #3498db, #9b59b6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      padding-bottom: 10px;
      border-bottom: 2px solid #3498db;
    }

    .top-bar {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 20px;
    }

    button {
      background-color: #3498db;
      color: white;
      border: none;
      padding: 10px 15px;
      border-radius: 5px;
      cursor: pointer;
      font-weight: bold;
      transition: all 0.3s ease;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }

    button:hover {
      background-color: #2980b9;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    button:disabled {
      background-color: #95a5a6;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    .ventas-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .venta-card {
      background-color: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      border-left: 4px solid #3498db;
    }

    .venta-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }

    .venta-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 1px solid #eee;
    }

    .venta-header h3 {
      margin: 0;
      color: #2c3e50;
    }

    .estado-badge {
      padding: 5px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
      text-transform: capitalize;
    }

    .sin-pagar {
      background-color: #ff9f43;
      color: white;
    }

    .pagada {
      background-color: #2ecc71;
      color: white;
    }

    .facturada {
      background-color: #9b59b6;
      color: white;
    }

    .productos-list {
      margin-top: 10px;
      padding: 10px;
      background-color: #f8f9fa;
      border-radius: 5px;
    }

    .producto-item {
      padding: 5px 0;
      border-bottom: 1px dashed #ddd;
    }

    .venta-actions {
      display: flex;
      gap: 10px;
      margin-top: 15px;
      justify-content: flex-end;
    }

    .delete-btn {
      background-color: #e74c3c;
    }

    .delete-btn:hover {
      background-color: #c0392b;
    }

    /* Formulario de nueva venta */
    .venta-form {
      background-color: white;
      padding: 25px;
      border-radius: 8px;
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
    }

    .form-section {
      margin-bottom: 20px;
      padding: 15px;
      background-color: #f8f9fa;
      border-radius: 5px;
    }

    h4 {
      color: #3498db;
      margin-top: 0;
      margin-bottom: 15px;
    }

    select, input, textarea {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
      margin-bottom: 10px;
      font-size: 14px;
    }

    .add-product {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
    }

    .add-product select, .add-product input {
      flex: 1;
    }

    .productos-agregados {
      margin-top: 15px;
    }

    .producto-agregado {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 10px;
      background-color: white;
      border-radius: 5px;
      margin-bottom: 5px;
      border-left: 3px solid #2ecc71;
    }

    .producto-agregado button {
      background: none;
      color: #e74c3c;
      padding: 0;
      font-size: 16px;
    }

    .totales {
      text-align: right;
      margin: 20px 0;
      font-size: 18px;
      color: #2c3e50;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }

    .cancel-btn {
      background-color: #95a5a6;
    }

    .cancel-btn:hover {
      background-color: #7f8c8d;
    }

    /* Modales */
    .modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0,0,0,0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      background-color: white;
      padding: 25px;
      border-radius: 10px;
      width: 500px;
      max-width: 90%;
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
    }

    .modal-content h3 {
      color: #3498db;
      margin-top: 0;
      text-align: center;
    }

    .form-group {
      margin-bottom: 15px;
    }

    .form-group label {
      display: block;
      margin-bottom: 5px;
      color: #2c3e50;
      font-weight: bold;
    }

    .form-group select, .form-group input, .form-group textarea {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
    }

    .modal-actions {
      display: flex;
      gap: 10px;
      margin-top: 20px;
      justify-content: flex-end;
    }

    .resumen-factura {
      background-color: #f8f9fa;
      padding: 15px;
      border-radius: 5px;
      margin: 15px 0;
    }

    .resumen-factura h4 {
      color: #3498db;
      margin-top: 0;
      border-bottom: 1px solid #ddd;
      padding-bottom: 5px;
    }

    .productos-factura {
      max-height: 200px;
      overflow-y: auto;
      margin: 10px 0;
    }

    .producto-factura {
      padding: 5px 0;
      border-bottom: 1px dashed #ddd;
      display: flex;
      justify-content: space-between;
    }
  `]
})
export class VentasTrabajadorComponent {
  ventas: any[] = [];
  clientes: any[] = [];
  productosDisponibles: any[] = [];

  mostrarNuevaVenta = false;
  nuevaVenta = {
    clienteId: null as number | null,
    observacion: '',
    detalles: [] as any[],
  };

  productoSeleccionado: any = null;
  cantidadProducto: number = 1;

  mostrarModalPago = false;
  pagoRequest = {
    ventaId: 0,
    metodo: 'CONTADO',
    comprobante: null as File | null
  };

  mostrarModalFactura = false;
  ventaAFacturar: any = null;
  generandoFactura = false;
  facturaRequest = {
    ventasIds: [] as number[],
    moneda: 'PEN',
    formaPago: 'CONTADO',
    medioPago: 'EFECTIVO',
    observaciones: ''
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.cargarVentas();
    this.cargarClientes();
    this.cargarProductos();
  }

  cargarVentas() {
    this.http.get<any[]>('http://localhost:8085/ventas').subscribe(data => {
      this.ventas = data;
    });
  }

  cargarClientes() {
    this.http.get<any[]>('http://localhost:8085/clientes').subscribe(data => {
      this.clientes = data;
    });
  }

  cargarProductos() {
    this.http.get<any[]>('http://tu-backend/productos').subscribe(data => {
      this.productosDisponibles = data;
    });
  }

  actualizarPrecioUnitario() {
    if (this.productoSeleccionado) {
      this.cantidadProducto = 1;
    }
  }

  agregarProducto() {
    if (!this.productoSeleccionado || !this.cantidadProducto) return;

    const productoExistente = this.nuevaVenta.detalles.find(
      d => d.productoId === this.productoSeleccionado.id
    );

    if (productoExistente) {
      productoExistente.cantidad += this.cantidadProducto;
      productoExistente.subtotal = productoExistente.cantidad * this.productoSeleccionado.precioUnitario;
    } else {
      this.nuevaVenta.detalles.push({
        productoId: this.productoSeleccionado.id,
        producto: { ...this.productoSeleccionado },
        cantidad: this.cantidadProducto,
        precioUnitario: this.productoSeleccionado.precioUnitario,
        subtotal: this.cantidadProducto * this.productoSeleccionado.precioUnitario
      });
    }

    this.productoSeleccionado = null;
    this.cantidadProducto = 1;
  }

  eliminarProducto(index: number) {
    this.nuevaVenta.detalles.splice(index, 1);
  }

  calcularTotal(): number {
    return this.nuevaVenta.detalles.reduce((total, detalle) => total + detalle.subtotal, 0);
  }

  registrarVenta() {
    const ventaRequest = {
      clienteId: this.nuevaVenta.clienteId,
      observacion: this.nuevaVenta.observacion,
      detalles: this.nuevaVenta.detalles.map(d => ({
        productoId: d.productoId,
        cantidad: d.cantidad,
        precioUnitario: d.precioUnitario
      }))
    };

    this.http.post<any>('http://localhost:8085/ventas', ventaRequest).subscribe({
      next: () => {
        this.cancelarNuevaVenta();
        this.cargarVentas();
        alert('Venta registrada con éxito');
      },
      error: (err) => {
        console.error('Error al registrar venta:', err);
        alert('Error al registrar venta: ' + err.message);
      }
    });
  }

  cancelarNuevaVenta() {
    this.mostrarNuevaVenta = false;
    this.nuevaVenta = {
      clienteId: null,
      observacion: '',
      detalles: []
    };
    this.productoSeleccionado = null;
    this.cantidadProducto = 1;
  }

  abrirModalPago(venta: any) {
    this.pagoRequest = {
      ventaId: venta.id,
      metodo: 'CONTADO',
      comprobante: null
    };
    this.mostrarModalPago = true;
  }

  onComprobanteChange(event: any) {
    if (event.target.files.length > 0) {
      this.pagoRequest.comprobante = event.target.files[0];
    }
  }

  registrarPago() {
    const formData = new FormData();
    formData.append('ventaId', this.pagoRequest.ventaId.toString());
    formData.append('metodo', this.pagoRequest.metodo);
    if (this.pagoRequest.comprobante) {
      formData.append('comprobante', this.pagoRequest.comprobante);
    }

    this.http.post('http://localhost:8085/pagos', formData).subscribe({
      next: () => {
        this.mostrarModalPago = false;
        this.cargarVentas();
        alert('Pago registrado con éxito');
      },
      error: (err) => {
        console.error('Error al registrar pago:', err);
        alert('Error al registrar pago: ' + err.message);
      }
    });
  }

  abrirModalFactura(venta: any) {
    this.ventaAFacturar = venta;
    this.facturaRequest.ventasIds = [venta.id];
    this.mostrarModalFactura = true;
  }

  cerrarModalFactura() {
    this.mostrarModalFactura = false;
    this.ventaAFacturar = null;
    this.generandoFactura = false;
    this.facturaRequest = {
      ventasIds: [],
      moneda: 'PEN',
      formaPago: 'CONTADO',
      medioPago: 'EFECTIVO',
      observaciones: ''
    };
  }

  generarFactura() {
    this.generandoFactura = true;

    this.http.post<any>('http://localhost:8085/facturas', this.facturaRequest)
      .subscribe({
        next: (facturaGenerada) => {
          this.mostrarModalFactura = false;
          this.generandoFactura = false;

          // Descargar el PDF automáticamente
          this.descargarFacturaPdf(facturaGenerada.id);

          // Actualizar la lista de ventas
          this.cargarVentas();

          alert('Factura generada con éxito');
        },
        error: (err) => {
          console.error('Error al generar factura:', err);
          this.generandoFactura = false;
          alert('Error al generar factura: ' + (err.error?.message || err.message));
        }
      });
  }

  descargarFacturaPdf(facturaId: number) {
    this.http.get(`http://tu-backend/facturas/${facturaId}/pdf`, {
      responseType: 'blob'
    }).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `factura-${facturaId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    });
  }

  eliminarVenta(ventaId: number) {
    if (confirm('¿Estás seguro de eliminar esta venta?')) {
      this.http.delete(`http://tu-backend/ventas/${ventaId}`).subscribe({
        next: () => {
          this.cargarVentas();
          alert('Venta eliminada con éxito');
        },
        error: (err) => {
          console.error('Error al eliminar venta:', err);
          alert('Error al eliminar venta: ' + err.message);
        }
      });
    }
  }

  obtenerNombreCliente(clienteId: number): string {
    const cliente = this.clientes.find(c => c.id === clienteId);
    return cliente ? `${cliente.nombres} ${cliente.apellidos}` : 'Cliente no encontrado';
  }

  obtenerNombreProducto(productoId: number): string {
    const producto = this.productosDisponibles.find(p => p.id === productoId);
    return producto ? producto.nombre : 'Producto no encontrado';
  }
}
