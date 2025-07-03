import {DefaultLayoutComponent} from "./layout";
import {ClientesComponent} from "./views/pages/clientes/clientes.component";
import {DashboardComponent} from "./views/dashboard/dashboard.component";
import {Routes} from "@angular/router";

const routes: Routes = [
  {
    path: '',
    component: DefaultLayoutComponent,
    children: [
      { path: 'clientes', component: ClientesComponent },
      { path: 'dashboard', component: DashboardComponent },
      { path: '', redirectTo: 'clientes', pathMatch: 'full' } // <- redirige al listado
    ]
  },
  { path: '**', redirectTo: 'clientes' } // <- cualquier otra ruta incorrecta también se redirige
];
