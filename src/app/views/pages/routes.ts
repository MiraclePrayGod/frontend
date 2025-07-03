import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'ordenes',
    loadComponent: () => import('./ordenes/ordenes.component').then(m => m.OrdenesComponent),
    data: {
      title: 'ordenes'
    }
  },
  {
    path: '500',
    loadComponent: () => import('./page500/page500.component').then(m => m.Page500Component),
    data: {
      title: 'Page 500'
    }
  },
  {
    path: 'clientes',
    loadComponent: () => import('./clientes/clientes.component').then(m => m.ClientesComponent),
    data: {
      title: 'Clientes'
    }
  },
  {
    path: 'productos',
    loadComponent: () => import('./productos/productos.component').then(m => m.ProductosComponent),
    data: {
      title: 'Productos'
    }
  },
  {
  path: 'ventas',
  loadComponent: () => import('./ventas/ventas.component').then(m => m.VentasTrabajadorComponent),
  data: {
  title: 'Ventas'
}
},
  {
    path: 'facturas',
    loadComponent: () => import('./facturas/facturas.component').then(m => m.FacturasComponent),
    data: {
      title: 'Facturas'
    }
  },
  {
    path: 'ventas_clientes',
    loadComponent: () => import('./ventas_clientes/ventas_clientes.component').then(m => m.VentasClienteComponent),
    data: {
      title: 'ventas_clientes'
    }
  },
  {
    path: 'pagos',
    loadComponent: () => import('./pagos/pagos.component').then(m => m.ComprasComponent),
    data: {
      title: 'Tus Compras'
    }
  },
  {

    path: 'dcliente',
    loadComponent: () => import('./dcliente/dcliente.component').then(m => m.DClienteComponent),
    data: {
      title: 'dcliente'
    }
  },



  {

    path: 'login',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent),
    data: {
      title: 'Login Page'
    }
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent),
    data: {
      title: 'Register Page'
    }
  },
  {
    path: 'licencias',
    loadComponent: () => import('./licencias/licencias.component').then(m => m.LicenciasComponent),
    data: {
      title: 'Licencias'
    }
  }
];
