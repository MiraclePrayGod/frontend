import { ComponentFixture, TestBed } from '@angular/core/testing';

import {ListarVentasClienteComponent, ListarVentasClienteComponent} from './pagos.component';

describe('ListarVentasClienteComponent', () => {
  let component: ListarVentasClienteComponent;
  let fixture: ComponentFixture<ListarVentasClienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarVentasClienteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarVentasClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
