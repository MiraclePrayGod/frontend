import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precioUnitario: number;
  stock: number;
  imagenUrl?: string;
}

interface DetalleVenta {
  productoId: number;
  cantidad: number;
  precioUnitario: number;

}

interface VentaRequest {
  clienteId: number;
  origen: string;
  detalles: DetalleVenta[];
}

@Component({
  selector: 'app-ventas-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './ventas_clientes.component.html',
  styleUrls: ['./ventas_clientes.component.scss']
})
export class VentasClienteComponent implements OnInit {
  showSuccessModal = false;
  productos: Producto[] = [];
  clientes: any[] = [];
  clienteId: number | null = null;
  detalles: DetalleVenta[] = [];
  cantidades: {[key: number]: number} = {};
  mensaje: string = '';
  error: string = '';
  placeholderImg = 'assets/default-product.png';

  private apiUrl = 'http://localhost:8085/productos';
  trackByProductId: any;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.cargarProductos();
    this.cargarClientes();
  }

  cargarProductos() {
    this.http.get<Producto[]>(this.apiUrl).subscribe({
      next: data => {
        this.productos = data;
      },
      error: err => this.error = 'Error al cargar productos'
    });
  }

  cargarClientes() {
    this.http.get<any[]>('http://localhost:8085/clientes').subscribe({
      next: data => this.clientes = data.filter(c => c.estado),
      error: err => this.error = 'Error al cargar clientes'
    });
  }

  agregarAlCarrito(producto: Producto) {
    const cantidad = this.cantidades[producto.id] || 1;

    if (cantidad > producto.stock) {
      this.error = 'No hay suficiente stock disponible';
      setTimeout(() => this.error = '', 3000);
      return;
    }

    const detalleExistente = this.detalles.find(d => d.productoId === producto.id);

    if (detalleExistente) {
      detalleExistente.cantidad = cantidad;
    } else {
      this.detalles.push({
        productoId: producto.id,
        cantidad: cantidad,
        precioUnitario: producto.precioUnitario
      });
    }

    this.mensaje = `${producto.nombre} agregado al carrito`;
    setTimeout(() => this.mensaje = '', 3000);
  }

  removerDetalle(productoId: number) {
    this.detalles = this.detalles.filter(d => d.productoId !== productoId);
  }

  obtenerNombreProducto(productoId: number): string {
    const producto = this.productos.find(p => p.id === productoId);
    return producto ? producto.nombre : 'Producto no encontrado';
  }

  obtenerImagenProducto(productoId: number): string {
    const producto = this.productos.find(p => p.id === productoId);
    return producto?.imagenUrl || this.placeholderImg;
  }

  calcularTotal(): number {
    return this.detalles.reduce((total, detalle) => {
      return total + (detalle.cantidad * detalle.precioUnitario);
    }, 0);
  }

  generarVenta() {
    if (!this.clienteId || this.detalles.length === 0) {
      this.error = 'Por favor seleccione un cliente y al menos un producto';
      setTimeout(() => this.error = '', 3000);
      return;
    }

    const ventaRequest: VentaRequest = {
      clienteId: this.clienteId,
      origen: "CLIENTE",
      detalles: this.detalles
    };

    this.http.post('http://localhost:8085/ventas', ventaRequest).subscribe({
      next: () => {
        this.showSuccessModal = true;
        const detallesBackup = [...this.detalles];
        const totalBackup = this.calcularTotal();

        this.detalles = [];
        this.cantidades = {};
        window.location.href = 'http://localhost:4200/#/pages/pagos';


        setTimeout(() => {
          this.showSuccessModal = false;
        }, 5000);

        this.cargarProductos();
      },
      error: err => {
        console.error('Error:', err);
        this.error = 'Error al generar venta: ' +
          (err.error?.message || err.message || 'Error desconocido');
        setTimeout(() => this.error = '', 5000);
      }
    });
  }
}
