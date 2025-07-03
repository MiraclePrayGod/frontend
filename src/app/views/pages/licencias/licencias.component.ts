import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

interface Licencia {
  id: number;
  clienteId: number;
  tipoLicencia: string;
  fechaActivacion: string;
  fechaExpiracion: string;
  estado: boolean;
  clienteDto?: {
    nombres: string;
    apellidos: string;
    correo: string;
    numeroDocumento?: string;
    ruc?: string;
    [key: string]: any;
  };
  detalles: LicenciaDetalle[];
}

interface LicenciaDetalle {
  detalleId: number;
  ventaId: number;
  productoId: number;
  codigoLicencia: string;
  contrasena: string;
  productoDto?: {
    nombre: string;
    descripcion: string;
  };
}

@Component({
  selector: 'app-licencias',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './licencias.component.html',
  styleUrls: ['./licencias.component.scss']
})
export class LicenciasComponent implements OnInit {
  licencias: Licencia[] = [];
  licenciaSeleccionada: Licencia | null = null;
  mostrarDetalles = false;

  // Filtros
  filtroTexto: string = '';
  filtroEstado: 'todos' | 'vigentes' | 'expirados' = 'todos';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.cargarLicencias();
  }

  cargarLicencias() {
    // Si no hay filtro, trae todas
    if (!this.filtroTexto.trim()) {
      this.http.get<Licencia[]>('http://localhost:8085/licencias').subscribe({
        next: (data) => this.licencias = data,
        error: (err) => alert('Error al cargar licencias: ' + err.message)
      });
    } else {
      // Si hay filtro, busca por nombre, correo o documento
      this.http.get<Licencia[]>(`http://localhost:8085/licencias/buscar?valor=${encodeURIComponent(this.filtroTexto.trim())}`).subscribe({
        next: (data) => {
          // Si la búsqueda no retorna nada, muestra todas
          if (!data || data.length === 0) {
            this.http.get<Licencia[]>('http://localhost:8085/licencias').subscribe({
              next: (all) => this.licencias = all,
              error: (err) => alert('Error al cargar licencias: ' + err.message)
            });
          } else {
            this.licencias = data;
          }
        },
        error: (err) => alert('Error al buscar licencias: ' + err.message)
      });
    }
  }

  get licenciasFiltradas(): Licencia[] {
    let lista = this.licencias;

    // Filtro por estado
    if (this.filtroEstado === 'vigentes') {
      lista = lista.filter(l => l.estado);
    } else if (this.filtroEstado === 'expirados') {
      lista = lista.filter(l => !l.estado);
    }

    return lista;
  }

  onFiltroTextoChange() {
    this.cargarLicencias();
  }

  verDetalles(licencia: Licencia) {
    this.licenciaSeleccionada = licencia;
    this.mostrarDetalles = true;
  }

  cerrarDetalles() {
    this.mostrarDetalles = false;
    this.licenciaSeleccionada = null;
  }
}


