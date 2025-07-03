import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface FacturaDTO {
  id: number;
  numeroFactura: string;
  fechaEmision: string; // ISO string, ej: "2025-06-28"
  moneda: string;
  tipoComprobante: string;
  formaPago: string;
  medioPago: string;
  cliente: DatosClienteFacturaDTO;
  items: FacturaDetalleDTO[];
  subTotal: number;
  totalImpuestos: number;
  total: number;
}

interface DatosClienteFacturaDTO {
  id: number;
  nombres?: string | null;
  apellidos?: string | null;
  tipoDocumento?: string | null;
  numeroDocumento?: string | null;
  correo?: string | null;
  direccion?: string | null;
  telefono?: string | null;
  rucDni?: string | null;
  nombre: string;
}

interface DatosClienteDTO {
  id: number;
  nombre: string;
  documento: string;
  // Agrega más campos si hay más en tu DTO real
}

interface FacturaDetalleDTO {
  nombreProducto: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  igv: number;
  totalLinea: number;
  ventaId?: number | null;
}
interface Cliente {
  id: number;
  nombre: string;
  estado: boolean;
}


interface Venta {
  id: number;
  clienteId: number;
  fechaVenta: string;
  total: number;
  estado: string;
  origen: string;
  detalles: VentaDetalle[];
  estadoLicencia?: string; // opcional si no siempre está presente

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
  precioUnitario: number;
}

@Component({
  selector: 'app-compras',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './pagos.component.html',
  styleUrls: ['./pagos.component.scss']
})
export class ComprasComponent implements OnInit {
  mostrarModalFactura = false;
  ventaAFacturar: Venta | null = null;
  generandoFactura = false;
  facturaRequest = {
    ventasIds: [] as number[],
    moneda: 'PEN',
    formaPago: 'CONTADO',
    medioPago: 'EFECTIVO',
    observaciones: ''
  };

  mostrarFacturasModal = false;
  clienteSeleccionadoFacturas: number | null = null;
  facturasCliente: FacturaDTO[] = [];
  clientes: Cliente[] = [];
  clienteSeleccionado: number | null = null;
  ventasPendientes: Venta[] = [];
  ventasPagadas: Venta[] = [];
  estadoLicencia: string = ''; // o false, o true, dependiendo de lo que se espera


  mostrarPago = false;
  ventaSeleccionada: Venta | null = null;
  metodoPago = '';
  archivoSeleccionado: File | null = null;
  facturasEmitidas: FacturaDTO[] = [];


  private facturasApiUrl = 'http://localhost:8085/facturas';
  private ventasApiUrl = 'http://localhost:8085/ventas';
  private pagosApiUrl = 'http://localhost:8085/pagos';
  private clientesApiUrl = 'http://localhost:8085/clientes';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.cargarClientes();
  }

  cargarClientes() {
    this.http.get<Cliente[]>(this.clientesApiUrl).subscribe({
      next: (data) => this.clientes = data.filter(c => c.estado),
      error: (err) => console.error('Error cargando clientes:', err)
    });
  }
  cargarFacturas() {
    if (!this.clienteSeleccionado) return;

    this.http.get<FacturaDTO[]>(`${this.facturasApiUrl}/cliente/${this.clienteSeleccionado}`).subscribe({
      next: (data) => {
        this.facturasEmitidas = data;

      },
      error: (err) => console.error('Error cargando facturas:', err)
    });
  }


  cargarVentas() {
    if (!this.clienteSeleccionado) return;

    // Ventas pendientes
    this.http.get<Venta[]>(`${this.ventasApiUrl}/pendientes/${this.clienteSeleccionado}`).subscribe({
      next: (data) => {
        this.ventasPendientes = data;
        this.enriquecerDetalles(this.ventasPendientes);
      },
      error: (err) => console.error('Error cargando ventas pendientes:', err)
    });

    // Ventas pagadas
    this.http.get<Venta[]>(`${this.ventasApiUrl}/pagadas/${this.clienteSeleccionado}`).subscribe({
      next: (data) => {
        this.ventasPagadas = data;
        this.enriquecerDetalles(this.ventasPagadas);
      },
      error: (err) => console.error('Error cargando ventas pagadas:', err)
    });

    // Facturas emitidas
    this.cargarFacturas();
  }
  mostrarEstadoLicencia(venta: Venta) {
    alert(`Estado de la licencia de la venta #${venta.id}: ${venta.estadoLicencia}`);
  }
  puedeFacturar(venta: Venta): boolean {
    // Verifica que la venta esté pagada y que no tenga factura ya emitida
    const yaFacturada = this.facturasEmitidas.some(f =>
      f.items.some(item => item.ventaId === venta.id)
    );

    return venta.estado === 'PAGADA' &&
      !yaFacturada &&
      venta.estadoLicencia === 'ACEPTADO';
  }


  enriquecerDetalles(ventas: Venta[]) {
    // En un escenario real, aquí haríamos llamadas al servicio de productos
    // para obtener los nombres y datos completos de cada producto
    // Por simplicidad, solo simulamos los nombres
    ventas.forEach(venta => {
      venta.detalles.forEach(detalle => {
        if (!detalle.producto) {
          detalle.producto = {
            id: detalle.productoId,
            nombre: `Producto ${detalle.productoId}`,
            precioUnitario: detalle.precioUnitario
          };
        }
      });
    });
  }

  mostrarFormularioPago(venta: Venta) {
    this.ventaSeleccionada = venta;
    this.mostrarPago = true;
    this.metodoPago = '';
    this.archivoSeleccionado = null;
  }

  cancelarPago() {
    this.mostrarPago = false;
    this.ventaSeleccionada = null;
  }

  onFileSelected(event: any) {
    this.archivoSeleccionado = event.target.files[0];
  }
  mostrarEstado(venta: Venta) {
    alert(`Estado de la venta #${venta.id}: ${venta.estado}`);
  }

  facturarVenta(venta: Venta) {
    // Aquí puedes implementar la lógica para facturar, por ejemplo:
    // - redirigir a otra vista con la factura
    // - abrir modal con factura
    // - o llamar al backend para generar factura

    // Por ejemplo, si ya tienes cargadas las facturas en facturasEmitidas,
    // podrías buscar la factura relacionada y mostrarla.

    const factura = this.facturasEmitidas.find(f => f.id === venta.id);

    if (factura) {
      alert(`Factura #${factura.id} ya emitida con total S/ ${factura.total}`);
      // Aquí podrías abrir modal o navegar a detalle de factura.
    } else {
      alert('No se ha emitido factura para esta venta todavía.');
      // O podrías lanzar una petición para generar la factura aquí.
    }
  }
  // En el componente ComprasComponent

  getMotivoNoFacturable(venta: Venta): string {
    if (venta.estado !== 'PAGADA') {
      return 'La venta no está pagada';
    }
    if (venta.estadoLicencia !== 'ACEPTADO') {
      return 'La licencia no ha sido aceptada';
    }
    if (this.tieneFactura(venta)) {
      return 'Ya existe una factura para esta venta';
    }
    return 'No se puede facturar esta venta';
  }
  abrirModalFactura(venta: Venta) {
    if (!this.puedeFacturar(venta)) {
      if (venta.estado !== 'PAGADA') {
        alert('No se puede facturar una venta que no está pagada');
      } else if (venta.estadoLicencia !== 'ACEPTADO') {
        alert('No se puede facturar porque la licencia no ha sido aceptada');
      } else {
        alert('Esta venta ya tiene una factura asociada');
      }
      return;
    }

    this.ventaAFacturar = venta;
    this.facturaRequest = {
      ventasIds: [venta.id],
      moneda: 'PEN',
      formaPago: 'CONTADO',
      medioPago: 'EFECTIVO',
      observaciones: ''
    };
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

    this.http.post<FacturaDTO>(this.facturasApiUrl, this.facturaRequest).subscribe({
      next: (facturaGenerada) => {
        this.mostrarModalFactura = false;
        this.generandoFactura = false;
        this.descargarFacturaPdf(facturaGenerada.id);
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
    this.http.get(`${this.facturasApiUrl}/${facturaId}/pdf`, {
      responseType: 'blob'
    }).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        const factura = this.facturasEmitidas.find(f => f.id === facturaId);
        const nombreArchivo = factura ? `factura-${factura.numeroFactura}.pdf` : `factura-${facturaId}.pdf`;

        a.download = nombreArchivo;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (err) => {
        console.error('Error al descargar factura:', err);
        alert('Error al descargar factura: ' + err.message);
      }
    });
  }

  visualizarFactura(venta: Venta) {
    // Buscar si existe una factura para esta venta
    const factura = this.facturasEmitidas.find(f =>
      f.items.some(item => item.ventaId === venta.id)
    );

    if (factura) {
      // Descargar el PDF de la factura
      this.descargarFacturaPdf(factura.id);
    } else {
      alert('No se ha encontrado una factura para esta venta');
    }
  }
  tieneFactura(venta: Venta): boolean {
    return this.facturasEmitidas.some(f =>
      f.items.some(item => item.ventaId === venta.id)
    );
  }
  procesarPago() {
    if (!this.ventaSeleccionada || !this.metodoPago) return;

    const pagoRequest = {
      ventaId: this.ventaSeleccionada.id,
      clienteId: this.clienteSeleccionado,  // ojo que clienteSeleccionado no sea null
      metodo: this.metodoPago

    };
    console.log('PagoRequest JSON:', JSON.stringify(pagoRequest));

    const formData = new FormData();
    // JSON.stringify y convertir a Blob para que Spring pueda mapearlo
    formData.append('data', new Blob([JSON.stringify(pagoRequest)], { type: 'application/json' }));

    if (this.archivoSeleccionado && this.metodoPago === 'TRANSFERENCIA') {
      formData.append('archivo', this.archivoSeleccionado);
    }

    this.http.post(this.pagosApiUrl, formData).subscribe({
      next: () => {
        alert('Pago registrado correctamente');
        this.cancelarPago();
        this.cargarVentas();
      },
      error: (err) => {
        console.error('Error procesando pago:', err);
        alert('Error al procesar el pago: ' + err.message);
      }
    });
  }
}
