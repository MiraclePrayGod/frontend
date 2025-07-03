import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ChartConfiguration, ChartType } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';


// Asegúrate de tener instalado ng2-charts y chart.js:
// npm install ng2-charts chart.js
// Si ya lo instalaste y sigue el error, reinicia tu IDE y ejecuta: 
// npx ngcc --properties es2015 browser module main --first-only --create-ivy-entry-points
// El import correcto para Angular 15+ y ng2-charts 4.x es:
// import { NgChartsModule } from 'ng2-charts';
// Si sigue en rojo, revisa tu versión instalada:
// - Si usas ng2-charts 3.x: NgChartsModule NO existe, usa ChartsModule:
// import { ChartsModule } from 'ng2-charts';
// y cambia en imports: [CommonModule, ChartsModule]
// - Si usas ng2-charts 4.x o superior: NgChartsModule SÍ existe.
// Si no, actualiza con: npm install ng2-charts@latest chart.js@latest

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.scss']
})
export class ReportesComponent implements OnInit {
  ventas: any[] = [];
  productos: any[] = [];
  pagos: any[] = [];
  licencias: any[] = [];

  // Ejemplo: gráfico de ventas por estado
  chartData: ChartConfiguration<'pie'>['data'] = {
    labels: [],
    datasets: [{ data: [] }]
  };
  chartType: ChartType = 'pie';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.cargarReporte();
  }

  cargarReporte() {
    this.http.get<any>('http://localhost:8085/reportes/json').subscribe(data => {
      // Suponiendo que tu backend expone un endpoint que devuelve los datos en JSON
      this.ventas = data.ventas || [];
      this.productos = data.productos || [];
      this.pagos = data.pagos || [];
      this.licencias = data.licencias || [];

      // Ejemplo: preparar gráfico de ventas por estado
      const estados = this.ventas.reduce((acc: any, v: any) => {
        acc[v.estado] = (acc[v.estado] || 0) + 1;
        return acc;
      }, {});
      this.chartData.labels = Object.keys(estados);
      this.chartData.datasets[0].data = Object.values(estados);
    });
  }
}
