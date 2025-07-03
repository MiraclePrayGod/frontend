import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
declare const URL: any;

@Component({
  selector: 'app-ventas-trabajador',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './ventas.component.html',
  styleUrls: ['./ventas.component.scss']
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
  mostrarFacturasModal = false;
  clienteSeleccionadoFacturas: number | null = null;
  ventaAFacturar: any = null;
  facturasCliente: any[] = [];
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
    this.http.get<any[]>('http://localhost:8085/productos').subscribe(data => {
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
    console.log('Venta enviada:', ventaRequest);


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
// Método para mostrar el modal de facturas
  mostrarFacturasClientes() {
    this.mostrarFacturasModal = true;
    this.clienteSeleccionadoFacturas = null;
    this.facturasCliente = [];
  }

// Método para cerrar el modal
  cerrarModalFacturas() {
    this.mostrarFacturasModal = false;
  }

// Método para cargar facturas por cliente
  cargarFacturasCliente() {
    if (!this.clienteSeleccionadoFacturas) return;

    this.http.get<any[]>(`http://localhost:8085/facturas/cliente/${this.clienteSeleccionadoFacturas}`)
      .subscribe({
        next: (facturas) => {
          this.facturasCliente = facturas;
        },
        error: (err) => {
          console.error('Error al cargar facturas:', err);
          alert('Error al cargar facturas: ' + err.message);
        }
      });
  }

  onComprobanteChange(event: any) {
    if (event.target.files.length > 0) {
      this.pagoRequest.comprobante = event.target.files[0];
    }
  }

  registrarPago() {
    // 1. Preparar los datos del pago
    const pagoData: any = {
      ventaId: this.pagoRequest.ventaId,
      clienteId: this.ventas.find(v => v.id === this.pagoRequest.ventaId)?.clienteId,
      trabajadorId: 1, // Asegúrate de obtener el trabajadorId correcto
      metodo: this.pagoRequest.metodo
    };

    // 2. Crear FormData
    const formData = new FormData();

    // 3. Agregar el objeto PagoRequest como JSON en la parte 'data'
    formData.append('data', new Blob([JSON.stringify(pagoData)], {
      type: 'application/json'
    }));

    // 4. Agregar archivo si existe y es transferencia
    if (this.pagoRequest.metodo === 'TRANSFERENCIA' && this.pagoRequest.comprobante) {
      formData.append('archivo', this.pagoRequest.comprobante);
    }

    // 5. Enviar la solicitud de pago
    this.http.post('http://localhost:8085/pagos', formData).subscribe({
      next: (pagoResponse: any) => {
        this.mostrarModalPago = false;
        this.cargarVentas();

        // Obtener el clienteId de la venta pagada
        const ventaPagada = this.ventas.find(v => v.id === this.pagoRequest.ventaId);
        const clienteId = ventaPagada?.clienteId;

        if (clienteId) {
          // Crear la licencia para el cliente (esto disparará el correo automáticamente)
          const licenciaRequest = {
            clienteId: clienteId,
            tipoLicencia: "Licencia Automática", // Puedes personalizar esto
            fechaExpiracion: this.calcularFechaExpiracion() // Método para calcular fecha
          };

          this.http.post('http://localhost:8085/licencias', licenciaRequest)
            .subscribe({
              next: (licenciaResponse: any) => {
                console.log('Licencia creada y correo enviado:', licenciaResponse);
                alert('Pago registrado y licencia generada. El cliente recibirá un correo con los detalles.');
              },
              error: (err) => {
                console.error('Error al crear licencia:', err);
                alert('Pago registrado, pero hubo un error al generar la licencia');
              }
            });
        } else {
          alert('Pago registrado con éxito');
        }
      },
      error: (err) => {
        console.error('Error al registrar pago:', err);
        alert('Error al registrar pago: ' + err.message);
      }
    });
  }

// Método auxiliar para calcular fecha de expiración (1 año desde hoy)
  calcularFechaExpiracion(): string {
    const fechaExpiracion = new Date();
    fechaExpiracion.setFullYear(fechaExpiracion.getFullYear() + 1);
    return fechaExpiracion.toISOString().split('T')[0]; // Formato YYYY-MM-DD
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
    this.http.get(`http://localhost:8085/facturas/${facturaId}/pdf`, {
      responseType: 'blob'
    }).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        // Buscar el número de factura para el nombre del archivo
        const factura = this.facturasCliente.find(f => f.id === facturaId);
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
