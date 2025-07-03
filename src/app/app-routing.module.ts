import { Routes } from '@angular/router';
import { DashboardComponent } from './views/dashboard/dashboard.component';
import { ProductsComponent } from './views/products/products.component';
import { SalesComponent } from './views/sales/sales.component';
import { ClientesComponent } from './views/clientes/clientes.component';


export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'products', component: ProductsComponent },
  { path: 'sales', component: SalesComponent },
  { path: 'clientes', component: ClientesComponent },

];
