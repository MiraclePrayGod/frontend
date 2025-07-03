import { ComponentFixture, TestBed } from '@angular/core/testing';

import {VentasClienteComponent, VentasClienteComponent} from './pagos.component';

describe('VentasClienteComponent', () => {
  let component: VentasClienteComponent;
  let fixture: ComponentFixture<VentasClienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VentasClienteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VentasClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
