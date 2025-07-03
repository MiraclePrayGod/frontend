import { Component, OnInit } from '@angular/core';
import { DecimalPipe } from "@angular/common";
import { RouterModule } from "@angular/router";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  imports: [
    DecimalPipe,
    RouterModule
  ],
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  stats = [
    {
      title: 'Total de Ventas',
      value: 23450,
      trend: 'up',
      percentage: '+12.5%',
      icon: 'bi bi-bar-chart-line'
    },
    {
      title: 'Clientes Nuevos',
      value: 150,
      trend: 'stable',
      percentage: '0%',
      icon: 'bi bi-person-check'
    },
    {
      title: 'Reembolsos',
      value: 5,
      trend: 'down',
      percentage: '-3%',
      icon: 'bi bi-arrow-counterclockwise'
    }
  ];

  barChartData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Ventas',
        data: [3000, 4500, 5000, 3500, 4800, 5100]
      }
    ]
  };

  pieChartData = {
    labels: ['Electrónica', 'Ropa', 'Alimentos', 'Otros'],
    datasets: [
      {
        data: [40, 25, 20, 15],
        backgroundColor: ['#0d6efd', '#20c997', '#ffc107', '#dc3545']
      }
    ]
  };

  constructor() {}

  ngOnInit(): void {}
}
        