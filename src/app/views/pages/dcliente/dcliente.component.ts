import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbCarouselModule, NgbCarouselConfig, NgbSlideEvent, NgbSlideEventSource } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-dcliente',
  standalone: true,
  templateUrl: './dcliente.component.html',
  styleUrls: ['./dcliente.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NgbCarouselModule
  ],
})
export class DClienteComponent {

// Datos para el carrusel
  carouselImages = [
    {
      src: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      alt: 'Contabilidad moderna',
      caption: 'Gestión financiera inteligente'
    },
    {
      src: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      alt: 'Análisis de datos',
      caption: 'Toma decisiones basadas en datos'
    },
    {
      src: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1351&q=80',
      alt: 'Equipo trabajando',
      caption: 'Soluciones colaborativas'
    }
  ];

  paused = false;
  unpauseOnArrow = false;
  pauseOnIndicator = false;
  pauseOnHover = true;
  pauseOnFocus = true;

  // Productos destacados
  featuredProducts = [
    {
      id: 1,
      name: 'Plan Básico',
      description: 'Ideal para pequeños negocios y emprendedores',
      price: 29.99,
      features: [
        'Hasta 100 transacciones/mes',
        '2 usuarios',
        'Reportes básicos',
        'Soporte por email'
      ],
      popular: false
    },
    {
      id: 2,
      name: 'Plan Profesional',
      description: 'Para medianas empresas con necesidades avanzadas',
      price: 79.99,
      features: [
        'Transacciones ilimitadas',
        '5 usuarios',
        'Reportes avanzados',
        'Integración con bancos',
        'Soporte prioritario'
      ],
      popular: true
    },
    {
      id: 3,
      name: 'Plan Empresarial',
      description: 'Solución completa para grandes organizaciones',
      price: 149.99,
      features: [
        'Transacciones ilimitadas',
        'Usuarios ilimitados',
        'Analítica predictiva',
        'API de integración',
        'Soporte 24/7',
        'Entrenamiento personalizado'
      ],
      popular: false
    }
  ];

  // Testimonios
  testimonials = [
    {
      name: 'María González',
      position: 'Dueña de negocio',
      content: 'ContaCloud ha transformado mi manera de manejar las finanzas de mi negocio. Ahora tengo todo bajo control en un solo lugar.',
      avatar: 'https://randomuser.me/api/portraits/women/65.jpg'
    },
    {
      name: 'Carlos Mendoza',
      position: 'Contador independiente',
      content: 'La mejor herramienta contable que he usado en mis 15 años de experiencia. Mis clientes están encantados con los reportes.',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
      name: 'Laura Jiménez',
      position: 'Directora Financiera',
      content: 'La integración con nuestros sistemas bancarios nos ha ahorrado cientos de horas de trabajo manual. Excelente producto.',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
    }
  ];

  // Estado del formulario de login/registro
  showLoginForm: boolean | null = null;
  loginData = { email: '', password: '' };
  registerData = { name: '', email: '', password: '', confirmPassword: '' };

  constructor(config: NgbCarouselConfig) {
    // Configuración del carrusel
    config.interval = 5000;
    config.keyboard = true;
    config.pauseOnHover = true;
    config.showNavigationIndicators = true;
    config.showNavigationArrows = true;
  }

  toggleForm() {
    this.showLoginForm = !this.showLoginForm;
  }

  onLogin() {
    // Lógica de inicio de sesión
    console.log('Iniciando sesión', this.loginData);
    // Aquí iría la llamada al servicio de autenticación
  }

  onRegister() {
    // Lógica de registro
    if (this.registerData.password !== this.registerData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    console.log('Registrando usuario', this.registerData);
    // Aquí iría la llamada al servicio de registro
  }

  // Métodos para controlar el carrusel
  togglePaused() {
    if (this.paused) {
      this.paused = false;
    } else {
      this.paused = true;
    }
  }

  onSlide(slideEvent: NgbSlideEvent) {
    if (
      this.unpauseOnArrow &&
      slideEvent.paused &&
      (slideEvent.source === NgbSlideEventSource.ARROW_LEFT || slideEvent.source === NgbSlideEventSource.ARROW_RIGHT)
    ) {
      this.togglePaused();
    }
    if (
      this.pauseOnIndicator &&
      !slideEvent.paused &&
      slideEvent.source === NgbSlideEventSource.INDICATOR
    ) {
      this.togglePaused();
    }
  }
}
