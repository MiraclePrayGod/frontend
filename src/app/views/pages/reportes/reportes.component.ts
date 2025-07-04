import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';  // Asegúrate de importar HttpClientModule
import { CommonModule } from '@angular/common';
import { ChartConfiguration, ChartType } from 'chart.js';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, HttpClientModule],  // Añade HttpClientModule en imports
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.scss']
})
export class ReportesComponent implements OnInit {
  ventas: any[] = [];
  productos: any[] = [];
  pagos: any[] = [];
  licencias: any[] = [];
  resumenVentas: { estado: string, cantidad: number }[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.cargarReporte();
  }

  cargarReporte() {
    this.http.get<any>('http://localhost:8085/reportes/json').subscribe(data => {
      this.ventas = data.ventas || [];
      this.productos = data.productos || [];
      this.pagos = data.pagos || [];
      this.licencias = data.licencias || [];

      // Resumen de ventas por estado
      const estados = this.ventas.reduce((acc: any, v: any) => {
        acc[v.estado] = (acc[v.estado] || 0) + 1;
        return acc;
      }, {});
      this.resumenVentas = Object.keys(estados).map(estado => ({
        estado,
        cantidad: estados[estado]
      }));
    });
  }
}
