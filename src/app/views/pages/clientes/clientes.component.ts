import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface Cliente {
  id?: number;
  nombres: string;
  apellidos: string;
  tipoDocumento: string;
  numeroDocumento: string;
  correo: string;
  telefono: string;
  direccion: string;
  estado?: boolean;
  fechaRegistro?: string;
  [key: string]: any;
}

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.scss']
})
export class ClientesComponent implements OnInit {
  clientes: Cliente[] = [];
  clienteSeleccionado: Cliente | null = null;
  filtro: string = '';
  nuevoCliente: Cliente = this.crearClienteVacio();

  campos = [
    { key: 'nombres', label: 'Nombres' },
    { key: 'apellidos', label: 'Apellidos' },
    { key: 'tipoDocumento', label: 'Tipo Documento' },
    { key: 'numeroDocumento', label: 'Número Documento' },
    { key: 'correo', label: 'Correo Electrónico' },
    { key: 'telefono', label: 'Teléfono' },
    { key: 'direccion', label: 'Dirección' }
  ];

  mostrarAgregar = false;
  mostrarEditar = false;

  // Para modal Generar Venta
  mostrarFormularioVenta = false;
  clientesActivos: Cliente[] = [];
  clienteSeleccionadoVenta: Cliente | null = null;

  private apiUrl = 'http://localhost:8085/clientes';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.cargarClientes();
  }

  crearClienteVacio(): Cliente {
    return {
      nombres: '',
      apellidos: '',
      tipoDocumento: '',
      numeroDocumento: '',
      correo: '',
      telefono: '',
      direccion: ''
    };
  }

  cargarClientes() {
    this.http.get<Cliente[]>(this.apiUrl).subscribe(
      data => {
        this.clientes = data;
        this.clientesActivos = data.filter(c => c.estado);
      },
      error => {
        console.error('Error al cargar clientes', error);
      }
    );
  }

  clientesFiltrados(): Cliente[] {
    if (!this.filtro) return this.clientes;
    const f = this.filtro.toLowerCase();
    return this.clientes.filter(c =>
      (c.nombres.toLowerCase().includes(f)) ||
      (c.apellidos.toLowerCase().includes(f)) ||
      (c.numeroDocumento.toLowerCase().includes(f)) ||
      (c.correo.toLowerCase().includes(f))
    );
  }

  limpiarNuevoCliente() {
    this.nuevoCliente = this.crearClienteVacio();
  }

  agregarCliente() {
    this.http.post<Cliente>(this.apiUrl, this.nuevoCliente).subscribe(
      nuevo => {
        this.clientes.push(nuevo);
        if (nuevo.estado) {
          this.clientesActivos.push(nuevo);
        }
        this.mostrarAgregar = false;
        this.limpiarNuevoCliente();
      },
      error => {
        console.error('Error al agregar cliente', error);
      }
    );
  }

  editarCliente(cliente: Cliente) {
    this.clienteSeleccionado = { ...cliente };
    this.mostrarEditar = true;
    this.mostrarAgregar = false;
  }

  verDetalles(cliente: Cliente) {
    // Implementar lógica para ver detalles si es necesario
    console.log('Ver detalles', cliente);
  }

  guardarCliente() {
    if (!this.clienteSeleccionado || !this.clienteSeleccionado.id) return;

    const id = this.clienteSeleccionado.id;
    this.http.put<Cliente>(`${this.apiUrl}/${id}`, this.clienteSeleccionado).subscribe(
      actualizado => {
        const idx = this.clientes.findIndex(c => c.id === id);
        if (idx >= 0) {
          this.clientes[idx] = actualizado;
        }
        this.clientesActivos = this.clientes.filter(c => c.estado);
        this.mostrarEditar = false;
        this.clienteSeleccionado = null;
      },
      error => {
        console.error('Error al actualizar cliente', error);
      }
    );
  }

  cancelarForm() {
    this.mostrarAgregar = false;
    this.mostrarEditar = false;
    this.clienteSeleccionado = null;
    this.limpiarNuevoCliente();
  }

  eliminarCliente(id: number) {
    if (!confirm('¿Está seguro de eliminar este cliente?')) return;
    this.http.delete(`${this.apiUrl}/${id}`).subscribe(
      () => {
        this.clientes = this.clientes.filter(c => c.id !== id);
        this.clientesActivos = this.clientes.filter(c => c.estado);
      },
      error => {
        console.error('Error al eliminar cliente', error);
      }
    );
  }

  // Funciones para modal Generar Venta
  abrirModalVenta() {
    this.clienteSeleccionadoVenta = null;
    this.mostrarFormularioVenta = true;
  }

  cancelarVenta() {
    this.mostrarFormularioVenta = false;
    this.clienteSeleccionadoVenta = null;
  }

  seleccionarClienteVenta(cliente: Cliente) {
    this.clienteSeleccionadoVenta = cliente;
  }

  confirmarVenta() {
    if (!this.clienteSeleccionadoVenta) return;

    alert(`Venta generada para cliente: ${this.clienteSeleccionadoVenta.nombres} ${this.clienteSeleccionadoVenta.apellidos}`);
    this.mostrarFormularioVenta = false;
    this.clienteSeleccionadoVenta = null;
  }
}
   