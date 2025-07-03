import { INavData } from '@coreui/angular';

export const navItems: INavData[] = [
  {
    name: 'Dashboard',
    url: '/dashboard',
    iconComponent: { name: 'cil-speedometer' },
    badge: {
      color: 'info',
      text: 'NEW'
    }
  },

  {
    name: 'Pages',
    url: '/login',
    iconComponent: { name: 'cil-star' },
    children: [
      {
        name: 'Login',
        url: '/login',
        icon: 'nav-icon-bullet'
      },
      {
        name: 'Register',
        url: '/register',
        icon: 'nav-icon-bullet'
      },
      {
        name: 'Clientes',
        url: '/pages/clientes',
        iconComponent: { name: 'cil-people' }
      },
      {
        name: 'dcliente',
        url: '/pages/dcliente',
        iconComponent: { name: 'cil-people' }
      },
      {
        name: 'Productos',
        url: '/pages/productos',
        iconComponent: { name: 'cil-box' }
      },
      {
        name: 'Ventas',
        url: '/pages/ventas',
        iconComponent: { name: 'cil-box' }
      },
      {
        name: 'Facturas',
        url: '/pages/facturas',
        iconComponent: { name: 'cil-box' }
      },
      {
        name: 'ventas_clientes',
        url: '/pages/ventas_clientes',
        iconComponent: { name: 'cil-box' }
      },

      {
        name: 'Tus Compras',
        url: '/pages/pagos',
        iconComponent: { name: 'cil-box' }
      },
      {
        name: 'Licencias',
        url: '/pages/licencias',
        iconComponent: { name: 'cil-key' }
      },
      {
        name: 'ordenes',
        url: '/pages/ordenes',
        icon: 'nav-icon-bullet'
      },
      {
        name: 'Error 500',
        url: '/500',
        icon: 'nav-icon-bullet'
      }
    ]
  },
  {
    title: true,
    name: 'Links',
    class: 'mt-auto'
  },
  {
    name: 'Docs',
    url: 'https://coreui.io/angular/docs/',
    iconComponent: { name: 'cil-description' },
    attributes: { target: '_blank' }
  }
];
