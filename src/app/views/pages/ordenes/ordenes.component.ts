import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface Pago {
  id: number;
  ventaId: number;
  clienteId: number;
  trabajadorId: number | null;
  metodo: string;
  monto: number;
  fechaPago: string;
  comprobanteUrl: string;
  estado: string;
}

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precioUnitario: number;
  stock: number;
  estado: boolean;
}

interface VentaDetalle {
  id: number;
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  producto: Producto;
}

interface Venta {
  id: number;
  clienteId: number;
  trabajadorId: number | null;
  fechaVenta: string;
  total: number;
  origen: string;
  estado: string;
  estadoLicencia: string;
  cliente: null;
  observacion: null;
  detalles: VentaDetalle[];
}

@Component({
  standalone: true,
  selector: 'app-ordenes',
  templateUrl: './ordenes.component.html',
  styleUrls: ['./ordenes.component.scss'],
  imports: [CommonModule, HttpClientModule],
})
export class OrdenesComponent implements OnInit {
  pagos: Pago[] = [];
  ventasMap: {[key: number]: Venta} = {};
  currentPage = 1;
  itemsPerPage = 10;

  private ventasApiUrl = 'http://localhost:8085/ventas';
  private pagosApiUrl = 'http://localhost:8085/pagos';
  private licenciasApiUrl = 'http://localhost:8085/licencias';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarPagosTransferencia();
  }

  cargarPagosTransferencia() {
    this.http.get<Pago[]>(`${this.pagosApiUrl}/transferencias`).subscribe({
      next: (pagos) => {
        this.pagos = pagos;
        // Cargar información de ventas para cada pago
        pagos.forEach(pago => {
          this.http.get<Venta>(`${this.ventasApiUrl}/${pago.ventaId}`).subscribe({
            next: (venta) => {
              this.ventasMap[pago.ventaId] = venta;
            },
            error: (err) => {
              console.error(`Error al cargar venta ${pago.ventaId}:`, err);
            }
          });
        });
      },
      error: (err) => {
        console.error('Error al cargar pagos:', err);
      }
    });
  }

  get paginatedPagos(): Pago[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.pagos.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.pagos.length / this.itemsPerPage);
  }

  changePage(page: number): void {
    this.currentPage = page;
  }

  actualizarEstadoLicencia(ventaId: number, estado: string) {
    const url = `${this.ventasApiUrl}/venta/${ventaId}/licencia?estado=${estado}`;

    this.http.put(url, {}).subscribe({
      next: () => {
        const venta = this.ventasMap[ventaId];
        if (venta) {
          venta.estadoLicencia = estado;
        }

        const estadoMsg = estado === 'ACEPTADO' ? 'aprobada' : 'rechazada';
        alert(`Licencia ${estadoMsg} correctamente`);

        if (estado === 'ACEPTADO' && venta) {
          this.confirmarPago(venta.clienteId, ventaId);
        }
      },
      error: (err) => {
        console.error('Error al actualizar estado:', err);
        alert('Error al actualizar el estado de la licencia');
      }
    });
  }

  verComprobante(pagoId: number) {
    this.http.get(`${this.pagosApiUrl}/${pagoId}/comprobante`, { responseType: 'text' }).subscribe(
      nombreArchivo => {
        const extension = nombreArchivo.split('.').pop()?.toLowerCase();
        const baseUrl = this.pagosApiUrl.replace('/pagos', '');
        const comprobanteUrl = `${baseUrl}${this.pagos.find(p => p.id === pagoId)?.comprobanteUrl}`;

        if (extension === 'pdf') {
          window.open(comprobanteUrl, '_blank');
        } else if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) {
          window.open(comprobanteUrl, '_blank');
        } else {
          const link = document.createElement('a');
          link.href = comprobanteUrl;
          link.download = nombreArchivo;
          link.target = '_blank';
          link.click();
        }
      },
      error => {
        console.error('Error al obtener el comprobante:', error);
        alert('No se pudo obtener el comprobante.');
      }
    );
  }

  confirmarPago(clienteId: number, ventaId: number) {
    const venta = this.ventasMap[ventaId];
    if (!venta) return;

    const licencia = {
      clienteId: clienteId,
      ventaId: ventaId,
      tipoLicencia: "Licencia Tipo A",
      fechaExpiracion: this.calcularFechaExpiracion(),
      productos: venta.detalles.map(detalle => ({
        productoId: detalle.productoId,
        nombre: detalle.producto.nombre,
        cantidad: detalle.cantidad,
        precioUnitario: detalle.precioUnitario
      }))
    };

    this.http.post(this.licenciasApiUrl, licencia).subscribe({
      next: () => {
        console.log('Licencia confirmada y enviada para venta:', ventaId);
      },
      error: (err) => {
        console.error('Error confirmando licencia:', err);
        const venta = this.ventasMap[ventaId];
        if (venta) {
          venta.estadoLicencia = 'PENDIENTE';
        }
        alert('Error al confirmar la licencia. La venta volvió a estado pendiente.');
      }
    });
  }

  private calcularFechaExpiracion(): string {
    const fecha = new Date();
    fecha.setFullYear(fecha.getFullYear() + 1);
    return fecha.toISOString().split('T')[0];
  }

  getEstadoClass(estado: string): string {
    switch(estado) {
      case 'PENDIENTE': return 'badge bg-warning text-dark';
      case 'ACEPTADO': return 'badge bg-success';
      case 'RECHAZADO': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  }

  getVentaDetails(ventaId: number): Venta | undefined {
    return this.ventasMap[ventaId];
  }
}
