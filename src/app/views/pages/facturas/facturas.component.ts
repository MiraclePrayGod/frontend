import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-facturas',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './facturas.component.html',
  styleUrl: './facturas.component.scss'
})
export class FacturasComponent {
  facturas: any[] = [];
  clienteId: number | null = null;
  loading = false;
  error: string = '';
  busquedaRealizada = false;

  constructor(private http: HttpClient) {}

  buscarFacturas() {
    if (!this.clienteId) {
      this.facturas = [];
      this.busquedaRealizada = false;
      return;
    }
    this.loading = true;
    this.error = '';
    this.busquedaRealizada = false;
    this.http.get<any[]>(`http://localhost:8085/facturas/cliente/${this.clienteId}`)
      .subscribe({
        next: (data) => {
          this.facturas = data;
          this.loading = false;
          this.busquedaRealizada = true;
        },
        error: (err) => {
          this.error = 'Error al cargar facturas';
          this.loading = false;
          this.busquedaRealizada = true;
        }
      });
  }

  descargarFacturaPdf(facturaId: number) {
    this.http.get(`http://localhost:8085/facturas/${facturaId}/pdf`, { responseType: 'blob' })
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          const factura = this.facturas.find(f => f.id === facturaId);
          const nombreArchivo = factura ? `factura-${factura.numeroFactura}.pdf` : `factura-${facturaId}.pdf`;
          a.href = url;
          a.download = nombreArchivo;
          document.body.appendChild(a);
          a.click();
          URL.revokeObjectURL(url);
          document.body.removeChild(a);
        },
        error: (err) => {
          alert('Error al descargar factura: ' + err.message);
        }
      });
  }
}
