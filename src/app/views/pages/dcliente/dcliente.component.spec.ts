import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DclienteComponent } from './Dcliente.component';

describe('DclienteComponent', () => {
  let component: DclienteComponent;
  let fixture: ComponentFixture<DclienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DclienteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DclienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
