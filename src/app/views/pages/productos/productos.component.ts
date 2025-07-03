import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface Producto {
  id?: number;
  nombre: string;
  descripcion?: string | null;
  categoria?: string | null;
  precioUnitario: number;
  stock: number;
  stockMinimo?: number | null;
  imagenUrl?: string | null;
  estado?: boolean;
  fechaCreacion?: string | null;
  [key: string]: any;
}

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.scss']
})
export class ProductosComponent implements OnInit {
  productos: Producto[] = [];
  productoSeleccionado: Producto | null = null;
  filtro: string = '';
  nuevoProducto: Producto = this.crearProductoVacio();

  placeholderImg = 'https://via.placeholder.com/150?text=Sin+imagen';

  mostrarAgregar = false;
  mostrarEditar = false;

  private apiUrl = 'http://localhost:8085/productos';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.cargarProductos();
  }

  crearProductoVacio(): Producto {
    return {
      nombre: '',
      descripcion: '',
      categoria: '',
      precioUnitario: 0,
      stock: 0,
      estado: true,
      imagenUrl: '',
    };
  }

  cargarProductos() {
    this.http.get<Producto[]>(this.apiUrl).subscribe(data => this.productos = data);
  }

  productosFiltrados(): Producto[] {
    const filtroLower = this.filtro.toLowerCase();
    return this.productos.filter(p =>
      (p.nombre?.toLowerCase().includes(filtroLower) ?? false) ||
      (p.descripcion?.toLowerCase().includes(filtroLower) ?? false) ||
      (p.categoria?.toLowerCase().includes(filtroLower) ?? false)
    );
  }

  agregarProducto() {
    this.http.post<Producto>(this.apiUrl, this.nuevoProducto).subscribe(() => {
      this.cargarProductos();
      this.cancelarForm();
    });
  }

  editarProducto(producto: Producto) {
    this.productoSeleccionado = { ...producto };
    this.mostrarEditar = true;
  }

  guardarProducto() {
    if (!this.productoSeleccionado?.id) return;

    this.http.put<Producto>(`${this.apiUrl}/${this.productoSeleccionado.id}`, this.productoSeleccionado).subscribe(() => {
      this.cargarProductos();
      this.cancelarForm();
    });
  }

  eliminarProducto(id: number) {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      this.http.delete(`${this.apiUrl}/${id}`).subscribe(() => this.cargarProductos());
    }
  }

  limpiarNuevoProducto() {
    this.nuevoProducto = this.crearProductoVacio();
  }

  cancelarForm() {
    this.mostrarAgregar = false;
    this.mostrarEditar = false;
    this.productoSeleccionado = null;
    this.limpiarNuevoProducto();
  }
}
