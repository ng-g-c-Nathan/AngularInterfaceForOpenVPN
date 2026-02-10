import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminActions } from './admin-actions';

describe('AdminActions', () => {
  let component: AdminActions;
  let fixture: ComponentFixture<AdminActions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminActions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminActions);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
